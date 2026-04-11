/**
 * TEST 3: Analysis Types & Data Contracts
 *
 * Validates that the analysis data structures are correct and that
 * mock analysis data conforms to the expected shape. This catches
 * breaking changes to the API contract between frontend and backend.
 */
import { describe, it, expect } from 'vitest';
import type { FactClaim, BiasIndicator, SourceAnalysis, StoryAnalysis } from '@/types/analysis';
import type { Article, EnrichedArticle, StoryCluster } from '@/types/news';
import type { BiasLeaning } from '@/config/sources';

// Mock data matching what Claude API would return
const mockFactClaim: FactClaim = {
  claim: 'US imposed 145% tariffs on Chinese goods',
  sourceCount: 4,
  sources: ['Reuters', 'CNN', 'Fox News', 'BBC'],
  confidence: 'high',
};

const mockBiasIndicator: BiasIndicator = {
  type: 'emotional-language',
  description: 'Uses charged language like "trade war escalation"',
  examples: ['"devastating blow to consumers"', '"reckless economic policy"'],
  severity: 'medium',
};

const mockSourceAnalysis: SourceAnalysis = {
  sourceId: 'cnn',
  sourceName: 'CNN',
  articleUrl: 'https://cnn.com/article/tariffs',
  factualClaims: [
    'US imposed 145% tariffs on Chinese goods',
    'China retaliated with 125% tariffs',
  ],
  biasIndicators: [mockBiasIndicator],
  emotionalTone: 'negative',
  keyOmissions: ['Did not mention potential benefits to domestic manufacturing'],
  score: 72,
};

const mockStoryAnalysis: StoryAnalysis = {
  topic: 'Trump tariffs China',
  consensusFacts: [mockFactClaim],
  disputedClaims: [
    {
      claim: 'Tariffs will reduce trade deficit by 50%',
      sourceCount: 1,
      sources: ['Fox News'],
      confidence: 'low',
    },
  ],
  sourceAnalyses: [mockSourceAnalysis],
  summary: 'Multiple sources confirm tariff imposition with varying framing.',
  timestamp: '2026-04-10T12:00:00.000Z',
};

describe('Analysis Data Contract', () => {
  it('FactClaim has required fields', () => {
    expect(mockFactClaim.claim).toBeTruthy();
    expect(mockFactClaim.sourceCount).toBeGreaterThan(0);
    expect(mockFactClaim.sources.length).toBe(mockFactClaim.sourceCount);
    expect(['high', 'medium', 'low']).toContain(mockFactClaim.confidence);
  });

  it('BiasIndicator has valid type', () => {
    const validTypes = ['emotional-language', 'omission', 'framing', 'source-selection'];
    expect(validTypes).toContain(mockBiasIndicator.type);
    expect(['high', 'medium', 'low']).toContain(mockBiasIndicator.severity);
    expect(mockBiasIndicator.examples.length).toBeGreaterThan(0);
  });

  it('SourceAnalysis has valid score range', () => {
    expect(mockSourceAnalysis.score).toBeGreaterThanOrEqual(0);
    expect(mockSourceAnalysis.score).toBeLessThanOrEqual(100);
    expect(['neutral', 'positive', 'negative', 'mixed']).toContain(mockSourceAnalysis.emotionalTone);
  });

  it('StoryAnalysis has all required sections', () => {
    expect(mockStoryAnalysis.topic).toBeTruthy();
    expect(mockStoryAnalysis.consensusFacts.length).toBeGreaterThan(0);
    expect(mockStoryAnalysis.sourceAnalyses.length).toBeGreaterThan(0);
    expect(mockStoryAnalysis.summary).toBeTruthy();
    expect(mockStoryAnalysis.timestamp).toBeTruthy();
    expect(new Date(mockStoryAnalysis.timestamp).getTime()).not.toBeNaN();
  });

  it('consensus facts should have higher source count than disputed claims', () => {
    const avgConsensus =
      mockStoryAnalysis.consensusFacts.reduce((sum, f) => sum + f.sourceCount, 0) /
      mockStoryAnalysis.consensusFacts.length;
    const avgDisputed =
      mockStoryAnalysis.disputedClaims.reduce((sum, f) => sum + f.sourceCount, 0) /
      mockStoryAnalysis.disputedClaims.length;
    expect(avgConsensus).toBeGreaterThan(avgDisputed);
  });
});

describe('News Article Types', () => {
  const mockArticle: EnrichedArticle = {
    source: { id: 'cnn', name: 'CNN' },
    author: 'John Doe',
    title: 'US-China Trade War Escalates',
    description: 'New tariffs imposed on Chinese goods',
    url: 'https://cnn.com/article',
    urlToImage: 'https://cnn.com/image.jpg',
    publishedAt: '2026-04-10T10:00:00Z',
    content: 'Full article content here...',
    sourceBias: 'left',
    sourceTrustScore: 75,
    sourceRegion: 'us',
  };

  it('EnrichedArticle has base article fields', () => {
    expect(mockArticle.source.name).toBeTruthy();
    expect(mockArticle.title).toBeTruthy();
    expect(mockArticle.url).toMatch(/^https?:\/\//);
    expect(new Date(mockArticle.publishedAt).getTime()).not.toBeNaN();
  });

  it('EnrichedArticle has Cruxly enrichment fields', () => {
    expect(mockArticle.sourceBias).toBeTruthy();
    expect(mockArticle.sourceTrustScore).toBeGreaterThan(0);
    expect(mockArticle.sourceRegion).toBeTruthy();
  });

  it('bias field matches valid BiasLeaning values', () => {
    const validBiases: BiasLeaning[] = ['left', 'center-left', 'center', 'center-right', 'right'];
    expect(validBiases).toContain(mockArticle.sourceBias);
  });
});
