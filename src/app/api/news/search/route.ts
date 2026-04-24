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

// Common stop words to ignore in relevance scoring
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'were', 'they',
  'this', 'that', 'with', 'from', 'will', 'what', 'when', 'make', 'like',
  'just', 'over', 'such', 'take', 'than', 'them', 'very', 'some', 'into',
  'could', 'after', 'about', 'would', 'there', 'their', 'which', 'being',
]);

// Entity extraction — finds proper nouns (people, places, orgs)
function extractEntities(text: string): { entities: string[]; terms: string[] } {
  const words = text.split(/\s+/);
  const entities: string[] = [];
  const terms: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i].trim();
    // Capitalized word (likely proper noun) that's not a stop word
    if (word && /^[A-Z]/.test(word) && !STOP_WORDS.has(word.toLowerCase())) {
      // Capture multi-word entities (e.g., "Donald Trump", "New York")
      let entity = word;
      if (i + 1 < words.length && /^[A-Z]/.test(words[i + 1])) {
        entity = `${word} ${words[i + 1]}`;
      }
      entities.push(entity);
    } else if (word.length > 2 && !STOP_WORDS.has(word.toLowerCase())) {
      terms.push(word.toLowerCase());
    }
  }

  return { entities: [...new Set(entities)], terms: [...new Set(terms)] };
}

// ---------------------------------------------------------------------------
// Relevance scoring with entity matching
// ---------------------------------------------------------------------------
function relevanceScore(
  article: { title: string; description?: string | null; content?: string | null },
  query: string,
  queryEntities: string[] = []
): number {
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  if (queryTerms.length === 0) return 0;

  const title = (article.title || '').toLowerCase();
  const fullText = `${title} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  // Count matches in full text
  let textMatches = 0;
  for (const term of queryTerms) {
    if (fullText.includes(term)) textMatches++;
  }

  // Count matches in title specifically
  let titleMatches = 0;
  for (const term of queryTerms) {
    if (title.includes(term)) titleMatches++;
  }

  // Entity matching — boost if named entities from query appear in article
  let entityMatches = 0;
  for (const entity of queryEntities) {
    if (fullText.includes(entity.toLowerCase())) entityMatches++;
  }

  // Base score: % of query terms found in full text
  let score = textMatches / queryTerms.length;

  // BOOST: +0.3 if ALL query terms appear in the title (very relevant)
  if (titleMatches === queryTerms.length) {
    score += 0.3;
  }
  // BOOST: +0.15 if at least half the query terms appear in the title
  else if (titleMatches >= queryTerms.length / 2) {
    score += 0.15;
  }

  // ENTITY BOOST: +0.2 per entity match (e.g., searching "Biden" → articles mentioning Biden rank higher)
  if (queryEntities.length > 0) {
    score += 0.2 * (entityMatches / queryEntities.length);
  }

  // PENALTY: -0.3 if NONE of the query terms appear in the title
  if (titleMatches === 0) {
    score -= 0.3;
  }

  return Math.max(0, Math.min(1.5, score));
}

// ---------------------------------------------------------------------------
// Recency boost — fresher articles score higher
// ---------------------------------------------------------------------------
function recencyBoost(publishedAt: string): number {
  const now = Date.now();
  const published = new Date(publishedAt).getTime();
  const hoursAgo = (now - published) / (1000 * 60 * 60);

  if (hoursAgo < 6) return 0.2;     // Last 6 hours: big boost
  if (hoursAgo < 24) return 0.15;   // Last 24 hours
  if (hoursAgo < 48) return 0.1;    // Last 2 days
  if (hoursAgo < 72) return 0.05;   // Last 3 days
  return 0;                          // Older: no boost
}

// Jaccard similarity — measure overlap between two texts (for deduplication)
function jaccardSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

// Temporal cluster key — articles published within ±6 hours belong to same cluster
function getClusterKey(publishedAt: string): string {
  const date = new Date(publishedAt);
  // Round to nearest 6-hour block
  const hours = Math.floor(date.getHours() / 6) * 6;
  const clusterDate = new Date(date);
  clusterDate.setHours(hours, 0, 0, 0);
  return clusterDate.toISOString().split('T')[0] + `_${hours}`;
}

// ---------------------------------------------------------------------------
// RSS Feed Fetching — free, full text, no API limits
// ---------------------------------------------------------------------------
async function fetchRSSArticles(query: string): Promise<EnrichedArticle[]> {
  const allArticles: EnrichedArticle[] = [];
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Fetch all RSS feeds in parallel with a timeout
  const feedPromises = RSS_FEEDS.map(async (feedConfig) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const feed = await rssParser.parseURL(feedConfig.feedUrl);
      clearTimeout(timeout);

      const source = getSourceById(feedConfig.sourceId);
      if (!source || !feed.items) return [];

      // Convert RSS items, filter out articles older than 7 days
      return feed.items
        .slice(0, 15)
        .map((item): EnrichedArticle => ({
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
        }))
        .filter(article => {
          // Filter out articles older than 7 days
          const pubDate = new Date(article.publishedAt).getTime();
          return !isNaN(pubDate) && pubDate > sevenDaysAgo;
        });
    } catch (_err) {
      // RSS feed failed — that's fine, we have other sources
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
// NewsAPI Fetching — PRIMARY for keyword search, 100 req/day free
// ---------------------------------------------------------------------------
async function fetchNewsAPIArticles(
  query: string,
  language: string,
  location?: string
): Promise<EnrichedArticle[]> {
  if (!NEWS_API_KEY) return [];

  try {
    const availableSources = NEWS_SOURCES
      .filter(s => s.newsApiId && s.language === language)
      .map(s => s.newsApiId)
      .filter(Boolean);

    // Search last 7 days
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);

    // Add location context to query if provided
    const searchQuery = location
      ? `${query} ${location}`
      : query;

    const response = await axios.get<NewsAPIResponse>(
      `${NEWS_API_BASE_URL}/everything`,
      {
        params: {
          q: searchQuery,
          sources: availableSources.join(','),
          language,
          pageSize: 30, // Fetch more to have better selection
          sortBy: 'publishedAt',
          from: fromDate.toISOString().split('T')[0],
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
  } catch (_err) {
    return [];
  }
}

// ---------------------------------------------------------------------------
// DIVERSITY ENGINE — the core of Cruxly's value
//
// Rules:
//  1. Minimum relevance threshold: 50% (strict)
//  2. Maximum 2 articles per source (no Fox News flood)
//  3. Minimum 3 different bias categories in final results
//  4. Prioritize: relevance + recency → bias diversity → trust score
//  5. Temporal clustering: group articles by publish time (±6 hours)
// ---------------------------------------------------------------------------
function enforceDiversity(
  articles: EnrichedArticle[],
  query: string,
  limit: number,
  queryEntities: string[] = []
): { articles: EnrichedArticle[]; lowCoverage: boolean; clusters: Map<string, EnrichedArticle[]> } {
  // Step 1: Score relevance + recency, filter out junk (< 50% match)
  const scored = articles
    .map(a => ({
      article: a,
      score: relevanceScore(a, query, queryEntities) + recencyBoost(a.publishedAt),
    }))
    .filter(a => a.score >= 0.5) // Strict: must match at least 50%
    .sort((a, b) => b.score - a.score);

  const lowCoverage = scored.length < 6;

  // Step 2: Deduplicate by Jaccard similarity (title + description)
  // Keep only articles that are significantly different from previously kept ones
  const deduped: typeof scored = [];
  const seenTexts: string[] = [];

  for (const item of scored) {
    const articleText = `${item.article.title} ${item.article.description || ''}`;
    let isDuplicate = false;

    for (const seenText of seenTexts) {
      const similarity = jaccardSimilarity(articleText, seenText);
      // 70% similarity = considered duplicate
      if (similarity > 0.7) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      deduped.push(item);
      seenTexts.push(articleText);
    }
  }

  // Step 2.5: Temporal clustering — group articles by publish time
  const clusters = new Map<string, EnrichedArticle[]>();
  for (const { article } of deduped) {
    const clusterKey = getClusterKey(article.publishedAt);
    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, []);
    }
    clusters.get(clusterKey)!.push(article);
  }

  // Step 3: Build diverse set — max 2 per source
  const bySource = new Map<string, typeof deduped>();
  for (const item of deduped) {
    const sourceName = item.article.source.name;
    if (!bySource.has(sourceName)) bySource.set(sourceName, []);
    bySource.get(sourceName)!.push(item);
  }

  // Step 4: Group by bias, sort by trust then relevance
  const biasOrder: BiasLeaning[] = ['center', 'center-left', 'center-right', 'left', 'right'];
  const byBias = new Map<BiasLeaning, typeof deduped>();

  for (const [, sourceArticles] of bySource) {
    for (const item of sourceArticles.slice(0, 2)) {
      const bias = item.article.sourceBias || 'center';
      if (!byBias.has(bias as BiasLeaning)) byBias.set(bias as BiasLeaning, []);
      byBias.get(bias as BiasLeaning)!.push(item);
    }
  }

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

  return { articles: result, lowCoverage, clusters };
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
    const location = searchParams.get('location') || undefined;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Extract entities from query for smarter matching
    const { entities: queryEntities } = extractEntities(query);

    // Fetch from BOTH sources in parallel
    // NewsAPI is PRIMARY (keyword search), RSS is SUPPLEMENTARY (topic feeds)
    const [rssArticles, newsApiArticles] = await Promise.all([
      fetchRSSArticles(query),
      fetchNewsAPIArticles(query, language, location),
    ]);

    // Merge: NewsAPI first (better keyword matching), then RSS
    const allArticles = [...newsApiArticles, ...rssArticles];

    // Apply diversity engine with entity matching and temporal clustering
    const { articles: diverseArticles, lowCoverage, clusters } = enforceDiversity(allArticles, query, pageSize, queryEntities);

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

    // Temporal cluster info
    const clusterInfo = Array.from(clusters.entries()).map(([key, articles]) => ({
      timeCluster: key,
      articleCount: articles.length,
      sources: [...new Set(articles.map(a => a.source.name))],
    }));

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
        temporalClusters: clusterInfo,
      },
      ...(lowCoverage && {
        notice: 'Limited coverage found for this topic. Try broader search terms.',
      }),
      metadata: {
        sourcesQueried: RSS_FEEDS.length + NEWS_SOURCES.filter(s => s.newsApiId).length,
        timestamp: new Date().toISOString(),
        location: location || null,
        extractedEntities: queryEntities,
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
