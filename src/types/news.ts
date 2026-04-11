import { BiasLeaning } from '@/config/sources';

export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

export interface EnrichedArticle extends Article {
  sourceBias?: BiasLeaning;
  sourceTrustScore?: number;
  sourceRegion?: string;
}

export interface StoryCluster {
  topic: string;
  articles: EnrichedArticle[];
  biasDistribution: Record<BiasLeaning, number>;
  firstPublished: string;
  lastUpdated: string;
}
