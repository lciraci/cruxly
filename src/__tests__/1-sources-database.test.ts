/**
 * TEST 1: Sources Database Integrity
 *
 * Ensures the news sources database is complete, consistent, and balanced.
 * Every source must have valid bias, trust score, region, and language.
 * The political spectrum must be represented from all sides.
 */
import { describe, it, expect } from 'vitest';
import {
  NEWS_SOURCES,
  getSourcesByBias,
  getSourcesByRegion,
  getSourceById,
  getDiverseSourceSet,
  getNewsApiSourceIds,
} from '@/config/sources';

describe('Sources Database Integrity', () => {
  it('should have at least 25 verified sources', () => {
    expect(NEWS_SOURCES.length).toBeGreaterThanOrEqual(25);
  });

  it('every source must have required fields', () => {
    NEWS_SOURCES.forEach((source) => {
      expect(source.id, `${source.name} missing id`).toBeTruthy();
      expect(source.name, `${source.id} missing name`).toBeTruthy();
      expect(source.domain, `${source.id} missing domain`).toBeTruthy();
      expect(source.bias, `${source.id} missing bias`).toBeTruthy();
      expect(source.region, `${source.id} missing region`).toBeTruthy();
      expect(source.language, `${source.id} missing language`).toBeTruthy();
      expect(source.trustScore, `${source.id} missing trustScore`).toBeGreaterThan(0);
      expect(source.trustScore, `${source.id} trustScore too high`).toBeLessThanOrEqual(100);
    });
  });

  it('every source ID must be unique', () => {
    const ids = NEWS_SOURCES.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every domain must be unique', () => {
    const domains = NEWS_SOURCES.map((s) => s.domain);
    const uniqueDomains = new Set(domains);
    expect(uniqueDomains.size).toBe(domains.length);
  });

  it('must have all 5 bias categories represented', () => {
    const biases = ['left', 'center-left', 'center', 'center-right', 'right'] as const;
    biases.forEach((bias) => {
      const sources = getSourcesByBias(bias);
      expect(sources.length, `No sources for bias: ${bias}`).toBeGreaterThanOrEqual(1);
    });
  });

  it('must have at least 3 regions covered', () => {
    const regions = new Set(NEWS_SOURCES.map((s) => s.region));
    expect(regions.size).toBeGreaterThanOrEqual(3);
  });

  it('must have at least 2 languages', () => {
    const languages = new Set(NEWS_SOURCES.map((s) => s.language));
    expect(languages.size).toBeGreaterThanOrEqual(2);
  });

  it('getSourceById returns correct source', () => {
    const reuters = getSourceById('reuters');
    expect(reuters).toBeDefined();
    expect(reuters!.name).toBe('Reuters');
    expect(reuters!.bias).toBe('center');
  });

  it('getSourceById returns undefined for unknown id', () => {
    expect(getSourceById('nonexistent')).toBeUndefined();
  });

  it('getDiverseSourceSet returns balanced bias mix', () => {
    const diverse = getDiverseSourceSet(undefined, 6);
    expect(diverse.length).toBeGreaterThanOrEqual(3);
    const biases = new Set(diverse.map((s) => s.bias));
    expect(biases.size, 'Diverse set should have multiple bias types').toBeGreaterThanOrEqual(3);
  });

  it('getNewsApiSourceIds returns only sources with newsApiId', () => {
    const apiIds = getNewsApiSourceIds();
    expect(apiIds.length).toBeGreaterThan(0);
    apiIds.forEach((id) => {
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });
  });
});
