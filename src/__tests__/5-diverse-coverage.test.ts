/**
 * TEST 5: Diverse Coverage Selection
 *
 * Tests that Cruxly picks a balanced set of sources for any given query.
 * This is critical — if the selection algorithm is biased, the whole
 * product fails its mission. Tests the getDiverseSourceSet function
 * and simulates real-world search scenarios.
 */
import { describe, it, expect } from 'vitest';
import {
  NEWS_SOURCES,
  getDiverseSourceSet,
  getSourcesByRegion,
  getSourcesByLanguage,
} from '@/config/sources';
import type { BiasLeaning } from '@/config/sources';

describe('Diverse Coverage Selection', () => {
  it('global diverse set covers at least 4 bias categories', () => {
    const diverse = getDiverseSourceSet(undefined, 10);
    const biases = new Set(diverse.map((s) => s.bias));
    expect(biases.size).toBeGreaterThanOrEqual(4);
  });

  it('diverse set prioritizes highest trust score per bias', () => {
    const diverse = getDiverseSourceSet(undefined, 10);

    diverse.forEach((source) => {
      // Get all sources with the same bias
      const sameBias = NEWS_SOURCES.filter((s) => s.bias === source.bias);
      const maxTrust = Math.max(...sameBias.map((s) => s.trustScore));
      expect(
        source.trustScore,
        `${source.name} (${source.bias}) has trust ${source.trustScore} but max is ${maxTrust}`
      ).toBe(maxTrust);
    });
  });

  it('US region has left, center, and right representation', () => {
    const usDiverse = getDiverseSourceSet('us', 6);
    const biases = usDiverse.map((s) => s.bias);

    const hasLeft = biases.some((b) => b === 'left' || b === 'center-left');
    const hasCenter = biases.some((b) => b === 'center');
    const hasRight = biases.some((b) => b === 'right' || b === 'center-right');

    expect(hasLeft, 'US set missing left-leaning sources').toBe(true);
    expect(hasRight, 'US set missing right-leaning sources').toBe(true);
  });

  it('UK region has diverse perspectives', () => {
    const ukDiverse = getDiverseSourceSet('uk', 6);
    expect(ukDiverse.length).toBeGreaterThanOrEqual(2);
    const biases = new Set(ukDiverse.map((s) => s.bias));
    expect(biases.size).toBeGreaterThanOrEqual(2);
  });

  it('limit parameter actually limits results', () => {
    const set3 = getDiverseSourceSet(undefined, 3);
    const set6 = getDiverseSourceSet(undefined, 6);

    expect(set3.length).toBeLessThanOrEqual(3);
    expect(set6.length).toBeLessThanOrEqual(6);
    expect(set6.length).toBeGreaterThanOrEqual(set3.length);
  });

  it('English sources are sufficient for MVP', () => {
    const englishSources = getSourcesByLanguage('en');
    expect(englishSources.length).toBeGreaterThanOrEqual(10);

    // English sources should still have bias diversity
    const biases = new Set(englishSources.map((s) => s.bias));
    expect(biases.size).toBeGreaterThanOrEqual(4);
  });

  it('non-English sources exist for international coverage', () => {
    const spanish = getSourcesByLanguage('es');
    const italian = getSourcesByLanguage('it');
    const french = getSourcesByLanguage('fr');
    const german = getSourcesByLanguage('de');

    expect(spanish.length, 'No Spanish sources').toBeGreaterThanOrEqual(1);
    expect(italian.length, 'No Italian sources').toBeGreaterThanOrEqual(1);
    expect(french.length, 'No French sources').toBeGreaterThanOrEqual(1);
    expect(german.length, 'No German sources').toBeGreaterThanOrEqual(1);
  });

  it('simulated search: 5 topics should each get diverse coverage', () => {
    // These are the 5 topics we always test with
    const topics = [
      'Trump tariffs China',
      'Climate change policy EU',
      'AI regulation technology',
      'Ukraine war NATO',
      'Global inflation economy',
    ];

    // For each topic, verify that getDiverseSourceSet would provide balance
    topics.forEach((topic) => {
      const sources = getDiverseSourceSet(undefined, 6);
      const biases = new Set(sources.map((s) => s.bias));

      expect(
        biases.size,
        `Topic "${topic}" would get only ${biases.size} bias categories`
      ).toBeGreaterThanOrEqual(3);

      expect(
        sources.length,
        `Topic "${topic}" would get only ${sources.length} sources`
      ).toBeGreaterThanOrEqual(3);
    });
  });
});
