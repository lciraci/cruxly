import { NextRequest, NextResponse } from 'next/server';
import RSSParser from 'rss-parser';

const rssParser = new RSSParser();

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

// Location strings from Nominatim arrive as "City, State, CC" — extract the trailing 2-letter country code
function localeFromLocation(location: string) {
  const last = location.trim().split(',').pop()?.trim().toUpperCase() ?? '';
  return LOCALE_MAP[last] ?? DEFAULT_LOCALE;
}

function cleanDescription(raw: string | undefined | null, title: string): string | null {
  if (!raw) return null;
  const text = raw.replace(/<[^>]+>/g, '').trim();
  if (text.length < 40) return null;
  // Google News contentSnippet is usually "Title - Source Name" — skip if it just repeats the title
  const titleWords = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 50);
  const textWords = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  if (textWords.startsWith(titleWords)) return null;
  return text;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json(
      { error: 'location parameter is required' },
      { status: 400 }
    );
  }

  try {
    const { hl, gl, ceid } = localeFromLocation(location);
    const geoQuery = encodeURIComponent(location);
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
      .slice(0, 8)
      .map((item) => {
        // Google News titles often end with " - Source Name"
        const titleParts = (item.title || '').split(' - ');
        const sourceName = titleParts.length > 1 ? titleParts.pop()!.trim() : 'Unknown';
        const title = titleParts.join(' - ').trim();

        return {
          title,
          url: item.link || '',
          publishedAt: item.pubDate || item.isoDate || '',
          source: { name: sourceName, id: null },
          description: cleanDescription(item.contentSnippet || item.content, title),
          urlToImage: null,
          author: null,
          content: null,
        };
      });

    return NextResponse.json({ articles, location });
  } catch (err) {
    console.error('Local news fetch failed:', err);
    return NextResponse.json(
      { error: 'Failed to fetch local news' },
      { status: 500 }
    );
  }
}
