/**
 * TEST 4: Source Enrichment Logic
 *
 * Tests the logic that matches NewsAPI articles to our source database
 * and enriches them with bias/trust data. This is the core of Cruxly's
 * value — if enrichment breaks, users see articles without bias labels.
 */
import { describe, it, expect } from 'vitest';
import { NEWS_SOURCES, getSourceById } from '@/config/sources';
import type { Article, EnrichedArticle } from '@/types/news';

// Simulate the enrichment logic from /api/news/search/route.ts
function enrichArticle(article: Article): EnrichedArticle {
  const sourceData = NEWS_SOURCES.find(
    (s) =>
      s.newsApiId === article.source.id ||
      article.source.name.toLowerCase().includes(s.name.toLowerCase())
  );

  return {
    ...article,
    sourceBias: sourceData?.bias,
    sourceTrustScore: sourceData?.trustScore,
    sourceRegion: sourceData?.region,
  };
}

describe('Source Enrichment', () => {
  it('enriches Fox News article correctly', () => {
    const article: Article = {
      source: { id: 'fox-news', name: 'Fox News' },
      author: null,
      title: 'Test article',
      description: null,
      url: 'https://foxnews.com/test',
      urlToImage: null,
      publishedAt: '2026-04-10T00:00:00Z',
      content: null,
    };

    const enriched = enrichArticle(article);
    expect(enriched.sourceBias).toBe('right');
    expect(enriched.sourceTrustScore).toBe(65);
    expect(enriched.sourceRegion).toBe('us');
  });

  it('enriches CNN article correctly', () => {
    const article: Article = {
      source: { id: 'cnn', name: 'CNN' },
      author: null,
      title: 'Test article',
      description: null,
      url: 'https://cnn.com/test',
      urlToImage: null,
      publishedAt: '2026-04-10T00:00:00Z',
      content: null,
    };

    const enriched = enrichArticle(article);
    expect(enriched.sourceBias).toBe('left');
    expect(enriched.sourceTrustScore).toBe(75);
  });

  it('enriches Reuters (center, high trust) correctly', () => {
    const article: Article = {
      source: { id: 'reuters', name: 'Reuters' },
      author: null,
      title: 'Test',
      description: null,
      url: 'https://reuters.com/test',
      urlToImage: null,
      publishedAt: '2026-04-10T00:00:00Z',
      content: null,
    };

    const enriched = enrichArticle(article);
    expect(enriched.sourceBias).toBe('center');
    expect(enriched.sourceTrustScore).toBe(95);
  });

  it('enriches BBC News correctly', () => {
    const article: Article = {
      source: { id: 'bbc-news', name: 'BBC News' },
      author: null,
      title: 'Test',
      description: null,
      url: 'https://bbc.com/test',
      urlToImage: null,
      publishedAt: '2026-04-10T00:00:00Z',
      content: null,
    };

    const enriched = enrichArticle(article);
    expect(enriched.sourceBias).toBe('center');
    expect(enriched.sourceTrustScore).toBe(90);
    expect(enriched.sourceRegion).toBe('uk');
  });

  it('enriches Wall Street Journal correctly', () => {
    const article: Article = {
      source: { id: 'the-wall-street-journal', name: 'The Wall Street Journal' },
      author: null,
      title: 'Test',
      description: null,
      url: 'https://wsj.com/test',
      urlToImage: null,
      publishedAt: '2026-04-10T00:00:00Z',
      content: null,
    };

    const enriched = enrichArticle(article);
    expect(enriched.sourceBias).toBe('center-right');
    expect(enriched.sourceTrustScore).toBe(87);
  });

  it('handles unknown source gracefully (no crash, fields undefined)', () => {
    const article: Article = {
      source: { id: 'unknown-blog', name: 'Some Random Blog' },
      author: null,
      title: 'Test',
      description: null,
      url: 'https://randomblog.com/test',
      urlToImage: null,
      publishedAt: '2026-04-10T00:00:00Z',
      content: null,
    };

    const enriched = enrichArticle(article);
    expect(enriched.sourceBias).toBeUndefined();
    expect(enriched.sourceTrustScore).toBeUndefined();
    expect(enriched.sourceRegion).toBeUndefined();
    // Should still have base article fields
    expect(enriched.title).toBe('Test');
    expect(enriched.source.name).toBe('Some Random Blog');
  });

  it('matches by name when newsApiId is missing', () => {
    // El País doesn't have a newsApiId, should match by name
    const article: Article = {
      source: { id: null, name: 'El País' },
      author: null,
      title: 'Test',
      description: null,
      url: 'https://elpais.com/test',
      urlToImage: null,
      publishedAt: '2026-04-10T00:00:00Z',
      content: null,
    };

    const enriched = enrichArticle(article);
    expect(enriched.sourceBias).toBe('center-left');
    expect(enriched.sourceRegion).toBe('spain');
  });
});
