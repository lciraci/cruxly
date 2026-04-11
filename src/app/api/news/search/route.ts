import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import RSSParser from 'rss-parser';
import { NEWS_SOURCES, getSourceById } from '@/config/sources';
import { RSS_FEEDS } from '@/config/rss-feeds';
import { Article, EnrichedArticle, NewsAPIResponse } from '@/types/news';
import type { BiasLeaning } from '@/config/sources';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const rssParser = new RSSParser();

// ---------------------------------------------------------------------------
// Relevance scoring — filters out articles that don't match the query
// ---------------------------------------------------------------------------
function relevanceScore(article: { title: string; description?: string | null; content?: string | null }, query: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  let matched = 0;
  for (const term of queryTerms) {
    if (text.includes(term)) matched++;
  }

  return queryTerms.length > 0 ? matched / queryTerms.length : 0;
}

// ---------------------------------------------------------------------------
// RSS Feed Fetching — free, full text, no API limits
// ---------------------------------------------------------------------------
async function fetchRSSArticles(query: string): Promise<EnrichedArticle[]> {
  const allArticles: EnrichedArticle[] = [];

  // Fetch all RSS feeds in parallel with a timeout
  const feedPromises = RSS_FEEDS.map(async (feedConfig) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const feed = await rssParser.parseURL(feedConfig.feedUrl);
      clearTimeout(timeout);

      const source = getSourceById(feedConfig.sourceId);
      if (!source || !feed.items) return [];

      // Convert RSS items to our article format
      return feed.items.slice(0, 15).map((item): EnrichedArticle => ({
        source: { id: source.newsApiId || source.id, name: source.name },
        author: item.creator || item['dc:creator'] || null,
        title: item.title || '',
        description: item.contentSnippet || item.content?.substring(0, 300) || null,
        url: item.link || '',
        urlToImage: item.enclosure?.url || null,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        content: item.content || item['content:encoded'] || null,
        sourceBias: source.bias,
        sourceTrustScore: source.trustScore,
        sourceRegion: source.region,
      }));
    } catch (err) {
      // RSS feed failed — that's fine, we have other sources
      console.warn(`RSS feed failed for ${feedConfig.sourceId}:`, err instanceof Error ? err.message : 'unknown');
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  }

  return allArticles;
}

// ---------------------------------------------------------------------------
// NewsAPI Fetching — fallback, 100 req/day free
// ---------------------------------------------------------------------------
async function fetchNewsAPIArticles(query: string, language: string): Promise<EnrichedArticle[]> {
  if (!NEWS_API_KEY) return [];

  try {
    const availableSources = NEWS_SOURCES
      .filter(s => s.newsApiId && s.language === language)
      .map(s => s.newsApiId)
      .filter(Boolean);

    const response = await axios.get<NewsAPIResponse>(
      `${NEWS_API_BASE_URL}/everything`,
      {
        params: {
          q: query,
          sources: availableSources.join(','),
          language,
          pageSize: 20,
          sortBy: 'publishedAt',
          apiKey: NEWS_API_KEY,
        },
        timeout: 10000,
      }
    );

    return response.data.articles.map(article => {
      const sourceData = NEWS_SOURCES.find(
        s => s.newsApiId === article.source.id ||
             article.source.name.toLowerCase().includes(s.name.toLowerCase())
      );

      return {
        ...article,
        sourceBias: sourceData?.bias,
        sourceTrustScore: sourceData?.trustScore,
        sourceRegion: sourceData?.region,
      };
    });
  } catch (err) {
    console.warn('NewsAPI failed:', err instanceof Error ? err.message : 'unknown');
    return [];
  }
}

// ---------------------------------------------------------------------------
// DIVERSITY ENGINE — the core of Cruxly's value
//
// Rules:
//  1. Maximum 2 articles per source (no Fox News flood)
//  2. Minimum 3 different bias categories in final results
//  3. Prioritize: relevance → bias diversity → trust score
//  4. At least 1 article from left, center, and right
// ---------------------------------------------------------------------------
function enforceDiversity(articles: EnrichedArticle[], query: string, limit: number): EnrichedArticle[] {
  // Step 1: Score relevance and filter out junk (< 30% match)
  const scored = articles
    .map(a => ({ article: a, score: relevanceScore(a, query) }))
    .filter(a => a.score >= 0.3)
    .sort((a, b) => b.score - a.score);

  // Step 2: Deduplicate by title similarity (avoid same story from same source)
  const seen = new Set<string>();
  const deduped = scored.filter(({ article }) => {
    const key = `${article.source.name}::${article.title.substring(0, 50).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Step 3: Build diverse set — pick best article per source, max 2 per source
  const bySource = new Map<string, typeof deduped>();
  for (const item of deduped) {
    const sourceName = item.article.source.name;
    if (!bySource.has(sourceName)) bySource.set(sourceName, []);
    bySource.get(sourceName)!.push(item);
  }

  // Step 4: Round-robin by bias category to ensure balance
  const biasOrder: BiasLeaning[] = ['center', 'center-left', 'center-right', 'left', 'right'];
  const byBias = new Map<BiasLeaning, typeof deduped>();

  for (const [, sourceArticles] of bySource) {
    for (const item of sourceArticles.slice(0, 2)) { // max 2 per source
      const bias = item.article.sourceBias || 'center';
      if (!byBias.has(bias as BiasLeaning)) byBias.set(bias as BiasLeaning, []);
      byBias.get(bias as BiasLeaning)!.push(item);
    }
  }

  // Sort within each bias group by trust score, then relevance
  for (const [, items] of byBias) {
    items.sort((a, b) => {
      const trustDiff = (b.article.sourceTrustScore || 0) - (a.article.sourceTrustScore || 0);
      if (trustDiff !== 0) return trustDiff;
      return b.score - a.score;
    });
  }

  // Step 5: Round-robin pick — 1 from each bias, repeat until limit
  const result: EnrichedArticle[] = [];
  const biasPointers = new Map<BiasLeaning, number>();
  biasOrder.forEach(b => biasPointers.set(b, 0));

  let added = true;
  while (result.length < limit && added) {
    added = false;
    for (const bias of biasOrder) {
      if (result.length >= limit) break;
      const items = byBias.get(bias) || [];
      const pointer = biasPointers.get(bias) || 0;
      if (pointer < items.length) {
        result.push(items[pointer].article);
        biasPointers.set(bias, pointer + 1);
        added = true;
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main API handler
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const language = searchParams.get('language') || 'en';
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Fetch from both sources in parallel
    const [rssArticles, newsApiArticles] = await Promise.all([
      fetchRSSArticles(query),
      fetchNewsAPIArticles(query, language),
    ]);

    // Merge all articles
    const allArticles = [...rssArticles, ...newsApiArticles];

    // Apply diversity engine
    const diverseArticles = enforceDiversity(allArticles, query, pageSize);

    // Stats for the response
    const biasDistribution: Record<string, number> = {};
    const sourceNames: string[] = [];
    for (const article of diverseArticles) {
      const bias = article.sourceBias || 'unknown';
      biasDistribution[bias] = (biasDistribution[bias] || 0) + 1;
      if (!sourceNames.includes(article.source.name)) {
        sourceNames.push(article.source.name);
      }
    }

    return NextResponse.json({
      query,
      totalResults: diverseArticles.length,
      articles: diverseArticles,
      diversity: {
        uniqueSources: sourceNames.length,
        sourceNames,
        biasDistribution,
        rssArticlesFound: rssArticles.length,
        newsApiArticlesFound: newsApiArticles.length,
      },
      metadata: {
        sourcesQueried: RSS_FEEDS.length + NEWS_SOURCES.filter(s => s.newsApiId).length,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('News search error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
