// Curated local news RSS feeds by US city.
// TV affiliate feeds are preferred: they return direct publisher URLs, not Google redirect wrappers.

export interface LocalFeed {
  url: string;
  name: string;
}

export interface CityEntry {
  city: string;         // lowercase, matched against the first part of the location string
  stateAliases: string[]; // lowercase — full state name AND abbreviation
  feeds: LocalFeed[];
}

export const LOCAL_CITY_FEEDS: CityEntry[] = [
  // ── Carolinas ─────────────────────────────────────────────────────────────
  {
    city: 'charlotte',
    stateAliases: ['north carolina', 'nc'],
    feeds: [
      { url: 'https://www.wsoctv.com/news/local/rss.xml', name: 'WSOC-TV' },
      { url: 'https://www.wbtv.com/rss', name: 'WBTV' },
      { url: 'https://www.wcnc.com/feeds/rss/news/local', name: 'WCNC' },
    ],
  },
  {
    city: 'raleigh',
    stateAliases: ['north carolina', 'nc'],
    feeds: [
      { url: 'https://www.wral.com/rss/', name: 'WRAL' },
      { url: 'https://abc11.com/feed/', name: 'ABC11 (WTVD)' },
    ],
  },

  // ── Northeast ──────────────────────────────────────────────────────────────
  {
    city: 'new york',
    stateAliases: ['new york', 'ny'],
    feeds: [
      { url: 'https://abc7ny.com/feed/', name: 'ABC7 NY' },
      { url: 'https://nypost.com/feed/', name: 'NY Post' },
    ],
  },
  {
    city: 'boston',
    stateAliases: ['massachusetts', 'ma'],
    feeds: [
      { url: 'https://www.wcvb.com/rss', name: 'WCVB' },
      { url: 'https://whdh.com/feed/', name: 'WHDH' },
    ],
  },
  {
    city: 'philadelphia',
    stateAliases: ['pennsylvania', 'pa'],
    feeds: [
      { url: 'https://6abc.com/feed/', name: '6ABC (WPVI)' },
    ],
  },

  // ── Southeast ─────────────────────────────────────────────────────────────
  {
    city: 'atlanta',
    stateAliases: ['georgia', 'ga'],
    feeds: [
      { url: 'https://www.wsbtv.com/rss/', name: 'WSB-TV' },
      { url: 'https://www.11alive.com/feeds/rss/news/local', name: '11Alive' },
    ],
  },
  {
    city: 'miami',
    stateAliases: ['florida', 'fl'],
    feeds: [
      { url: 'https://www.local10.com/rss', name: 'Local10' },
      { url: 'https://wsvn.com/feed/', name: 'WSVN' },
    ],
  },
  {
    city: 'tampa',
    stateAliases: ['florida', 'fl'],
    feeds: [
      { url: 'https://www.wtsp.com/feeds/rss/news/local', name: 'WTSP' },
      { url: 'https://www.wfla.com/feed/', name: 'WFLA' },
    ],
  },
  {
    city: 'orlando',
    stateAliases: ['florida', 'fl'],
    feeds: [
      { url: 'https://www.wftv.com/feeds/rss/news/local', name: 'WFTV' },
      { url: 'https://www.wesh.com/feeds/rss/news/local', name: 'WESH' },
    ],
  },
  {
    city: 'nashville',
    stateAliases: ['tennessee', 'tn'],
    feeds: [
      { url: 'https://www.newschannel5.com/rss', name: 'NewsChannel 5' },
      { url: 'https://www.wkrn.com/feed/', name: 'WKRN' },
    ],
  },

  // ── Midwest ───────────────────────────────────────────────────────────────
  {
    city: 'chicago',
    stateAliases: ['illinois', 'il'],
    feeds: [
      { url: 'https://wgntv.com/feed/', name: 'WGN-TV' },
      { url: 'https://abc7chicago.com/feed/', name: 'ABC7 Chicago' },
    ],
  },
  {
    city: 'detroit',
    stateAliases: ['michigan', 'mi'],
    feeds: [
      { url: 'https://www.wxyz.com/rss', name: 'WXYZ' },
      { url: 'https://www.clickondetroit.com/rss', name: 'ClickOnDetroit' },
    ],
  },
  {
    city: 'minneapolis',
    stateAliases: ['minnesota', 'mn'],
    feeds: [
      { url: 'https://www.kare11.com/feeds/rss/news/local', name: 'KARE11' },
      { url: 'https://www.fox9.com/feed', name: 'Fox9' },
    ],
  },

  // ── South / Texas ─────────────────────────────────────────────────────────
  {
    city: 'dallas',
    stateAliases: ['texas', 'tx'],
    feeds: [
      { url: 'https://www.wfaa.com/feeds/rss/news/local', name: 'WFAA' },
      { url: 'https://www.fox4news.com/rss', name: 'Fox4 Dallas' },
    ],
  },
  {
    city: 'houston',
    stateAliases: ['texas', 'tx'],
    feeds: [
      { url: 'https://abc13.com/feed/', name: 'ABC13 (KTRK)' },
      { url: 'https://www.khou.com/feeds/rss/news/local', name: 'KHOU' },
    ],
  },
  {
    city: 'san antonio',
    stateAliases: ['texas', 'tx'],
    feeds: [
      { url: 'https://www.ksat.com/rss', name: 'KSAT' },
    ],
  },

  // ── Mountain West ─────────────────────────────────────────────────────────
  {
    city: 'denver',
    stateAliases: ['colorado', 'co'],
    feeds: [
      { url: 'https://www.9news.com/feeds/rss/news/local', name: '9News' },
      { url: 'https://www.thedenverchannel.com/rss', name: 'Denver7' },
    ],
  },
  {
    city: 'phoenix',
    stateAliases: ['arizona', 'az'],
    feeds: [
      { url: 'https://www.azfamily.com/rss', name: 'AZFamily' },
      { url: 'https://www.12news.com/feeds/rss/news/local', name: '12News' },
    ],
  },
  {
    city: 'las vegas',
    stateAliases: ['nevada', 'nv'],
    feeds: [
      { url: 'https://www.8newsnow.com/rss', name: '8News Now' },
    ],
  },

  // ── West Coast ────────────────────────────────────────────────────────────
  {
    city: 'los angeles',
    stateAliases: ['california', 'ca'],
    feeds: [
      { url: 'https://abc7.com/feed/', name: 'ABC7 LA (KABC)' },
      { url: 'https://ktla.com/feed/', name: 'KTLA' },
    ],
  },
  {
    city: 'san francisco',
    stateAliases: ['california', 'ca'],
    feeds: [
      { url: 'https://abc7news.com/feed/', name: 'ABC7 Bay Area' },
      { url: 'https://www.ktvu.com/rss', name: 'KTVU' },
    ],
  },
  {
    city: 'san diego',
    stateAliases: ['california', 'ca'],
    feeds: [
      { url: 'https://www.10news.com/feeds/rss/news/local', name: 'KGTV (10News)' },
      { url: 'https://www.cbs8.com/feeds/rss/news/local', name: 'CBS8' },
    ],
  },
  {
    city: 'seattle',
    stateAliases: ['washington', 'wa'],
    feeds: [
      { url: 'https://www.king5.com/feeds/rss/news/local', name: 'KING5' },
      { url: 'https://komonews.com/feed/', name: 'KOMO' },
    ],
  },
  {
    city: 'portland',
    stateAliases: ['oregon', 'or'],
    feeds: [
      { url: 'https://www.kgw.com/feeds/rss/news/local', name: 'KGW' },
      { url: 'https://katu.com/feed', name: 'KATU' },
    ],
  },
];

/**
 * Find curated RSS feeds for a location string from Nominatim
 * e.g. "Charlotte, North Carolina, US" or "Charlotte, NC".
 *
 * We parse city (first comma-part) and state (remaining parts) separately
 * so that "Buffalo, New York" doesn't accidentally match the New York City entry.
 */
export function findFeedsForLocation(location: string): LocalFeed[] {
  if (!location) return [];
  const parts = location.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return [];

  const cityPart = parts[0];
  const statePart = parts.slice(1).join(' ');

  const match = LOCAL_CITY_FEEDS.find(entry => {
    const cityMatch =
      cityPart === entry.city ||
      cityPart.includes(entry.city) ||
      entry.city.includes(cityPart);
    if (!cityMatch) return false;
    return entry.stateAliases.some(alias => statePart.includes(alias));
  });

  return match?.feeds ?? [];
}

/** Strip HTML tags and reject snippets that just echo the title. */
export function cleanDescription(raw: string | undefined | null, title: string): string | null {
  if (!raw) return null;
  const text = raw.replace(/<[^>]+>/g, '').trim();
  if (text.length < 40) return null;
  const titleWords = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 50);
  const textWords = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  if (textWords.startsWith(titleWords)) return null;
  return text;
}

/**
 * Some RSS feeds append " - Source Name" to the title.
 * Strip the suffix only if it looks like a brand name (short, doesn't start with a common word).
 */
export function parseTitle(raw: string): { title: string; sourceSuffix: string | null } {
  const trimmed = raw.trim();
  const parts = trimmed.split(' - ');
  if (parts.length > 1) {
    const last = parts[parts.length - 1].trim();
    if (last.length < 40 && !/^(the|a|an|is|was|are|and|but)\b/i.test(last)) {
      return { title: parts.slice(0, -1).join(' - ').trim(), sourceSuffix: last };
    }
  }
  return { title: trimmed, sourceSuffix: null };
}
