import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { NEWS_SOURCES, getSourceById } from '@/config/sources';
import { Article, EnrichedArticle, NewsAPIResponse } from '@/types/news';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const sources = searchParams.get('sources'); // comma-separated source IDs
    const language = searchParams.get('language') || 'en';
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    if (!NEWS_API_KEY) {
      return NextResponse.json(
        { error: 'NEWS_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Build NewsAPI source string
    let newsApiSources: string | undefined;
    if (sources) {
      // User provided specific sources
      const sourceIds = sources.split(',');
      const newsApiIds = sourceIds
        .map(id => getSourceById(id)?.newsApiId)
        .filter(Boolean);
      newsApiSources = newsApiIds.join(',');
    } else {
      // Use all available NewsAPI sources
      const availableSources = NEWS_SOURCES
        .filter(s => s.newsApiId && s.language === language)
        .map(s => s.newsApiId)
        .filter(Boolean);
      newsApiSources = availableSources.join(',');
    }

    // Fetch from NewsAPI
    const response = await axios.get<NewsAPIResponse>(
      `${NEWS_API_BASE_URL}/everything`,
      {
        params: {
          q: query,
          sources: newsApiSources,
          language,
          pageSize,
          sortBy: 'publishedAt',
          apiKey: NEWS_API_KEY,
        },
      }
    );

    // Enrich articles with source metadata
    const enrichedArticles: EnrichedArticle[] = response.data.articles.map(article => {
      // Try to match article source to our source database
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

    // Group by bias for easy visualization
    const biasGroups = enrichedArticles.reduce((acc, article) => {
      const bias = article.sourceBias || 'unknown';
      if (!acc[bias]) acc[bias] = [];
      acc[bias].push(article);
      return acc;
    }, {} as Record<string, EnrichedArticle[]>);

    return NextResponse.json({
      query,
      totalResults: response.data.totalResults,
      articles: enrichedArticles,
      biasGroups,
      metadata: {
        sourcesQueried: newsApiSources?.split(',').length || 0,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('News API error:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: 'Failed to fetch news',
          details: error.response?.data || error.message
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
