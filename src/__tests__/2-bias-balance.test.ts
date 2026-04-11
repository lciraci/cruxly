/**
 * TEST 2: Political Bias Balance
 *
 * Cruxly's core value is balanced coverage. This test ensures no single
 * political leaning dominates the source database. If the balance shifts
 * too far, the product loses credibility.
 */
import { describe, it, expect } from 'vitest';
import { NEWS_SOURCES, getSourcesByBias, getSourcesByRegion } from '@/config/sources';
import type { BiasLeaning } from '@/config/sources';

describe('Political Bias Balance', () => {
  const biasCategories: BiasLeaning[] = ['left', 'center-left', 'center', 'center-right', 'right'];

  it('no single bias should exceed 40% of total sources', () => {
    const total = NEWS_SOURCES.length;
    biasCategories.forEach((bias) => {
      const count = getSourcesByBias(bias).length;
      const percentage = (count / total) * 100;
      expect(
        percentage,
        `"${bias}" has ${count}/${total} sources (${percentage.toFixed(1)}%) — exceeds 40% limit`
      ).toBeLessThanOrEqual(40);
    });
  });

  it('left-leaning and right-leaning sources should be roughly balanced', () => {
    const leftCount = getSourcesByBias('left').length + getSourcesByBias('center-left').length;
    const rightCount = getSourcesByBias('right').length + getSourcesByBias('center-right').length;

    // Neither side should have more than 2x the other
    expect(
      leftCount,
      `Left-leaning (${leftCount}) is more than 2x right-leaning (${rightCount})`
    ).toBeLessThanOrEqual(rightCount * 2);
    expect(
      rightCount,
      `Right-leaning (${rightCount}) is more than 2x left-leaning (${leftCount})`
    ).toBeLessThanOrEqual(leftCount * 2);
  });

  it('center sources should exist as neutral anchors', () => {
    const centerSources = getSourcesByBias('center');
    expect(centerSources.length).toBeGreaterThanOrEqual(3);
  });

  it('US sources must span the full spectrum', () => {
    const usSources = getSourcesByRegion('us');
    const usBiases = new Set(usSources.map((s) => s.bias));
    expect(usBiases.has('left') || usBiases.has('center-left'), 'No left-leaning US sources').toBe(true);
    expect(usBiases.has('center'), 'No center US sources').toBe(true);
    expect(usBiases.has('right') || usBiases.has('center-right'), 'No right-leaning US sources').toBe(true);
  });

  it('European sources must have at least left and right representation', () => {
    const europeanRegions = ['uk', 'spain', 'italy', 'france', 'germany'] as const;
    europeanRegions.forEach((region) => {
      const sources = getSourcesByRegion(region);
      if (sources.length >= 2) {
        const biases = sources.map((s) => s.bias);
        const hasLeftish = biases.some((b) => b === 'left' || b === 'center-left');
        const hasRightish = biases.some((b) => b === 'right' || b === 'center-right');
        expect(
          hasLeftish && hasRightish,
          `Region "${region}" lacks left/right balance: [${biases.join(', ')}]`
        ).toBe(true);
      }
    });
  });

  it('trust scores should correlate: wire services (AP, Reuters, AFP) should score highest', () => {
    const wireServices = NEWS_SOURCES.filter((s) =>
      ['reuters', 'ap', 'afp'].includes(s.id)
    );
    const avgWireTrust = wireServices.reduce((sum, s) => sum + s.trustScore, 0) / wireServices.length;
    const avgAllTrust = NEWS_SOURCES.reduce((sum, s) => sum + s.trustScore, 0) / NEWS_SOURCES.length;

    expect(
      avgWireTrust,
      `Wire services avg (${avgWireTrust}) should be higher than overall avg (${avgAllTrust})`
    ).toBeGreaterThan(avgAllTrust);
  });
});
