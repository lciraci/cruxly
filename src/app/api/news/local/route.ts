import { NextRequest, NextResponse } from 'next/server';
import RSSParser from 'rss-parser';
import { findFeedsForLocation, cleanDescription, parseTitle, LocalFeed } from '@/lib/local-feeds';

const rssParser = new RSSParser();
const FEED_TIMEOUT_MS = 5000;

// ── Google News locale map (used only in fallback) ────────────────────────────
const LOCALE_MAP: Record<string, { hl: string; gl: string; ceid: string }> = {
  IT: { hl: 'it', gl: 'IT', ceid: 'IT:it' },
  FR: { hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
  DE: { hl: 'de', gl: 'DE', ceid: 'DE:de' },
  ES: { hl: 'es', gl: 'ES', ceid: 'ES:es' },
  MX: { hl: 'es', gl: 'MX', ceid: 'MX:es' },
  AR: { hl: 'es', gl: 'AR', ceid: 'AR:es' },
  BR: { hl: 'pt', gl: 'BR', ceid: 'BR:pt' },
  PT: { hl: 'pt', gl: 'PT', ceid: 'PT:pt' },
  GB: { hl: 'en', gl: 'GB', ceid: 'GB:en' },
  AU: { hl: 'en', gl: 'AU', ceid: 'AU:en' },
  CA: { hl: 'en', gl: 'CA', ceid: 'CA:en' },
  IN: { hl: 'en', gl: 'IN', ceid: 'IN:en' },
  JP: { hl: 'ja', gl: 'JP', ceid: 'JP:ja' },
  KR: { hl: 'ko', gl: 'KR', ceid: 'KR:ko' },
  NL: { hl: 'nl', gl: 'NL', ceid: 'NL:nl' },
  PL: { hl: 'pl', gl: 'PL', ceid: 'PL:pl' },
  RU: { hl: 'ru', gl: 'RU', ceid: 'RU:ru' },
};
const DEFAULT_LOCALE = { hl: 'en', gl: 'US', ceid: 'US:en' };

function localeFromLocation(location: string) {
  const last = location.trim().split(',').pop()?.trim().toUpperCase() ?? '';
  return LOCALE_MAP[last] ?? DEFAULT_LOCALE;
}

function buildGeoQuery(location: string): string {
  const parts = location.split(',').map(s => s.trim()).filter(Boolean);
  const last = parts[parts.length - 1];
  const withoutCountry = last.length <= 2 ? parts.slice(0, -1) : parts;
  return withoutCountry.slice(0, 2).join(' ');
}

// ── Feed fetching ─────────────────────────────────────────────────────────────

async function fetchFeedSafely(feed: LocalFeed): Promise<RSSParser.Output<{}> | null> {
  try {
    return await Promise.race([
      rssParser.parseURL(feed.url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), FEED_TIMEOUT_MS)
      ),
    ]);
  } catch {
    return null;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json({ error: 'location parameter is required' }, { status: 400 });
  }

  try {
    const curatedFeeds = findFeedsForLocation(location);

    if (curatedFeeds.length > 0) {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const feedResults = await Promise.all(curatedFeeds.map(fetchFeedSafely));

      const seen = new Set<string>();
      const articles = [];

      for (let i = 0; i < feedResults.length; i++) {
        const feed = feedResults[i];
        if (!feed) continue;
        const feedName = curatedFeeds[i].name;

        for (const item of feed.items || []) {
          const url = item.link || '';
          if (!url || seen.has(url)) continue;

          const dateStr = item.pubDate || item.isoDate;
          if (!dateStr) continue;
          const ts = new Date(dateStr).getTime();
          if (isNaN(ts) || ts < sevenDaysAgo) continue;

          seen.add(url);
          const { title } = parseTitle(item.title || '');
          if (!title) continue;

          articles.push({
            title,
            url,
            publishedAt: dateStr,
            source: { name: feedName, id: null },
            description: cleanDescription(item.contentSnippet || item.content, title),
            urlToImage: null,
            author: null,
            content: null,
          });
        }
      }

      articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      if (articles.length > 0) {
        return NextResponse.json({ articles: articles.slice(0, 10), location, source: 'curated' });
      }
      // No articles from curated feeds (all down?) → fall through to Google News
    }

    // ── Google News fallback ─────────────────────────────────────────────────
    const { hl, gl, ceid } = localeFromLocation(location);
    const geoQuery = encodeURIComponent(buildGeoQuery(location));
    const feedUrl = `https://news.google.com/rss/search?q=${geoQuery}&hl=${hl}&gl=${gl}&ceid=${ceid}`;

    const feed = await rssParser.parseURL(feedUrl);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const articles = (feed.items || [])
      .filter((item) => {
        const dateStr = item.pubDate || item.isoDate;
        if (!dateStr) return false;
        const ts = new Date(dateStr).getTime();
        return !isNaN(ts) && ts >= sevenDaysAgo;
      })
      .slice(0, 10)
      .map((item) => {
        const { title, sourceSuffix } = parseTitle(item.title || '');
        return {
          title,
          url: item.link || '',
          publishedAt: item.pubDate || item.isoDate || '',
          source: { name: sourceSuffix || 'Unknown', id: null },
          description: cleanDescription(item.contentSnippet || item.content, title),
          urlToImage: null,
          author: null,
          content: null,
        };
      });

    return NextResponse.json({ articles, location, source: 'google' });

  } catch (err) {
    console.error('Local news fetch failed:', err);
    return NextResponse.json({ error: 'Failed to fetch local news' }, { status: 500 });
  }
}
