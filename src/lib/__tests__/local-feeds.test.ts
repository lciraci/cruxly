import { describe, it, expect } from 'vitest';
import {
  LOCAL_CITY_FEEDS,
  findFeedsForLocation,
  cleanDescription,
  parseTitle,
} from '@/lib/local-feeds';

// ─── Data integrity ───────────────────────────────────────────────────────────

describe('LOCAL_CITY_FEEDS — data integrity', () => {
  it('has at least 20 city entries', () => {
    expect(LOCAL_CITY_FEEDS.length).toBeGreaterThanOrEqual(20);
  });

  it('every entry has at least one feed', () => {
    LOCAL_CITY_FEEDS.forEach(entry => {
      expect(entry.feeds.length, `${entry.city} has no feeds`).toBeGreaterThan(0);
    });
  });

  it('every feed URL starts with https://', () => {
    LOCAL_CITY_FEEDS.forEach(entry => {
      entry.feeds.forEach(feed => {
        expect(feed.url, `${entry.city} / ${feed.name}`).toMatch(/^https:\/\//);
      });
    });
  });

  it('every feed has a non-empty name', () => {
    LOCAL_CITY_FEEDS.forEach(entry => {
      entry.feeds.forEach(feed => {
        expect(feed.name.trim(), `${entry.city} feed missing name`).not.toBe('');
      });
    });
  });

  it('every entry has at least one state alias', () => {
    LOCAL_CITY_FEEDS.forEach(entry => {
      expect(entry.stateAliases.length, `${entry.city} has no state aliases`).toBeGreaterThan(0);
    });
  });

  it('city names and state aliases are all lowercase', () => {
    LOCAL_CITY_FEEDS.forEach(entry => {
      expect(entry.city).toBe(entry.city.toLowerCase());
      entry.stateAliases.forEach(alias => {
        expect(alias, `alias of ${entry.city}`).toBe(alias.toLowerCase());
      });
    });
  });

  it('each city+state pair is unique (no duplicate entries)', () => {
    const keys = LOCAL_CITY_FEEDS.map(e => `${e.city}|${e.stateAliases[0]}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });
});

// ─── findFeedsForLocation ─────────────────────────────────────────────────────

describe('findFeedsForLocation — city matching', () => {
  it('matches Charlotte with Nominatim full string', () => {
    const feeds = findFeedsForLocation('Charlotte, North Carolina, US');
    expect(feeds.length).toBeGreaterThan(0);
    expect(feeds.some(f => ['WSOC-TV', 'WBTV', 'WCNC'].includes(f.name))).toBe(true);
  });

  it('matches Charlotte with NC abbreviation', () => {
    const feeds = findFeedsForLocation('Charlotte, NC');
    expect(feeds.length).toBeGreaterThan(0);
  });

  it('matches Charlotte with NC, US', () => {
    const feeds = findFeedsForLocation('Charlotte, NC, US');
    expect(feeds.length).toBeGreaterThan(0);
  });

  it('matches New York City', () => {
    const feeds = findFeedsForLocation('New York City, New York, US');
    expect(feeds.length).toBeGreaterThan(0);
    expect(feeds.some(f => f.name.includes('ABC7'))).toBe(true);
  });

  it('matches "New York, New York, US" (city entered without "City")', () => {
    const feeds = findFeedsForLocation('New York, New York, US');
    expect(feeds.length).toBeGreaterThan(0);
  });

  it('does NOT match Buffalo (same state as NYC but different city)', () => {
    const feeds = findFeedsForLocation('Buffalo, New York, US');
    expect(feeds).toEqual([]);
  });

  it('matches Atlanta, GA', () => {
    const feeds = findFeedsForLocation('Atlanta, Georgia, US');
    expect(feeds.some(f => f.name === 'WSB-TV' || f.name === '11Alive')).toBe(true);
  });

  it('matches Chicago, IL', () => {
    const feeds = findFeedsForLocation('Chicago, Illinois, US');
    expect(feeds.length).toBeGreaterThan(0);
  });

  it('matches Los Angeles, CA', () => {
    const feeds = findFeedsForLocation('Los Angeles, California, US');
    expect(feeds.some(f => f.name.includes('ABC7') || f.name === 'KTLA')).toBe(true);
  });

  it('matches Los Angeles with CA abbreviation', () => {
    const feeds = findFeedsForLocation('Los Angeles, CA, US');
    expect(feeds.length).toBeGreaterThan(0);
  });

  it('matches Seattle, WA', () => {
    const feeds = findFeedsForLocation('Seattle, Washington, US');
    expect(feeds.some(f => f.name === 'KING5' || f.name === 'KOMO')).toBe(true);
  });

  it('matches Portland, Oregon but not Portland, Maine', () => {
    const oregonFeeds = findFeedsForLocation('Portland, Oregon, US');
    const maineFeeds  = findFeedsForLocation('Portland, Maine, US');
    expect(oregonFeeds.length).toBeGreaterThan(0);
    expect(maineFeeds).toEqual([]);
  });

  it('does not confuse Dallas and Houston (both Texas)', () => {
    const dallas  = findFeedsForLocation('Dallas, Texas, US');
    const houston = findFeedsForLocation('Houston, Texas, US');
    expect(dallas.some(f => f.name === 'WFAA')).toBe(true);
    expect(dallas.some(f => f.name === 'KHOU')).toBe(false);
    expect(houston.some(f => f.name.includes('KTRK') || f.name.includes('ABC13'))).toBe(true);
    expect(houston.some(f => f.name === 'WFAA')).toBe(false);
  });

  it('does not confuse San Antonio and Dallas (both Texas)', () => {
    const sa    = findFeedsForLocation('San Antonio, Texas, US');
    const dallas = findFeedsForLocation('Dallas, Texas, US');
    expect(sa.some(f => f.name === 'KSAT')).toBe(true);
    expect(sa.some(f => f.name === 'WFAA')).toBe(false);
    expect(dallas.some(f => f.name === 'KSAT')).toBe(false);
  });

  it('returns empty for an unknown city', () => {
    expect(findFeedsForLocation('Podunk, Wyoming, US')).toEqual([]);
  });

  it('returns empty for an empty string', () => {
    expect(findFeedsForLocation('')).toEqual([]);
  });

  it('is case-insensitive', () => {
    const lower = findFeedsForLocation('charlotte, north carolina, us');
    const upper = findFeedsForLocation('CHARLOTTE, NORTH CAROLINA, US');
    expect(lower.length).toBe(upper.length);
    expect(lower.map(f => f.url)).toEqual(upper.map(f => f.url));
  });
});

// ─── cleanDescription ─────────────────────────────────────────────────────────

describe('cleanDescription', () => {
  it('returns null for null / undefined / empty', () => {
    expect(cleanDescription(null, 'title')).toBeNull();
    expect(cleanDescription(undefined, 'title')).toBeNull();
    expect(cleanDescription('', 'title')).toBeNull();
  });

  it('strips HTML tags', () => {
    const result = cleanDescription(
      '<p>Emergency crews responded to a <b>major water main</b> break in south Charlotte.</p>',
      'Water main break'
    );
    expect(result).toBe('Emergency crews responded to a major water main break in south Charlotte.');
  });

  it('returns null for text shorter than 40 chars', () => {
    expect(cleanDescription('Too short.', 'title')).toBeNull();
  });

  it('returns null when description echoes the title', () => {
    const title = 'Water main break shuts down south Charlotte road';
    const desc  = 'water main break shuts down south charlotte road and emergency crews are on scene';
    expect(cleanDescription(desc, title)).toBeNull();
  });

  it('returns description when it adds new information', () => {
    const title = 'Water main break shuts down road';
    const desc  = 'Emergency crews responded Friday morning to a major leak on South Boulevard, closing the road to all traffic for three hours.';
    expect(cleanDescription(desc, title)).toBe(desc);
  });
});

// ─── parseTitle ───────────────────────────────────────────────────────────────

describe('parseTitle', () => {
  it('strips a trailing source name from the title', () => {
    const { title, sourceSuffix } = parseTitle('Water main break shuts down road - WSOC-TV');
    expect(title).toBe('Water main break shuts down road');
    expect(sourceSuffix).toBe('WSOC-TV');
  });

  it('handles titles with no source suffix', () => {
    const { title, sourceSuffix } = parseTitle('Water main break shuts down road');
    expect(title).toBe('Water main break shuts down road');
    expect(sourceSuffix).toBeNull();
  });

  it('preserves internal hyphens in the title', () => {
    const { title } = parseTitle('Man killed in hit-and-run crash on I-85 - WBTV');
    expect(title).toBe('Man killed in hit-and-run crash on I-85');
  });

  it('does NOT strip suffix that starts with a common word (not a brand)', () => {
    const { title, sourceSuffix } = parseTitle('Charlotte road closes - the community responds');
    expect(title).toBe('Charlotte road closes - the community responds');
    expect(sourceSuffix).toBeNull();
  });

  it('does NOT strip long suffix (likely part of the title)', () => {
    const long = 'This is a very long source name that exceeds forty characters easily';
    const { sourceSuffix } = parseTitle(`Some headline - ${long}`);
    expect(sourceSuffix).toBeNull();
  });

  it('trims surrounding whitespace', () => {
    const { title } = parseTitle('  Article about Charlotte   ');
    expect(title).toBe('Article about Charlotte');
  });
});
