import { NextResponse } from 'next/server';
import axios from 'axios';
import RSSParser from 'rss-parser';
import { getSupabaseClient } from '@/lib/supabase';
import { RSS_FEEDS } from '@/config/rss-feeds';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const rssParser = new RSSParser();

// Trim a raw NewsAPI headline down to a short, searchable topic.
function cleanTitle(raw: string): string {
  // Strip trailing " - Source Name"
  let t = raw.replace(/\s+[-–]\s+[^-–]{1,50}$/, '').trim();
  // If there's a colon, the part before is usually the core topic
  const colon = t.indexOf(':');
  if (colon > 8 && colon < 55) t = t.slice(0, colon).trim();
  // Hard cap at 52 chars, break at word boundary
  if (t.length > 52) t = t.slice(0, 52).replace(/\s\S*$/, '').trim();
  return t;
}

// Live trending from the RSS feeds — free, no API limits, works in production
// (unlike NewsAPI, whose free plan is blocked on deployed servers). Takes the
// most recent couple of headlines from each feed across the spectrum.
async function trendingFromRSS(): Promise<string[]> {
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000; // last 3 days = "trending"

  const perFeed = await Promise.allSettled(
    RSS_FEEDS.map(async (fc) => {
      try {
        const feed = await Promise.race([
          rssParser.parseURL(fc.feedUrl),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
        ]);
        return (feed.items ?? [])
          .filter((it) => {
            const d = new Date(it.isoDate || it.pubDate || '').getTime();
            return isNaN(d) || d > cutoff; // keep recent (or undated) items
          })
          .slice(0, 2)
          .map((it) => it.title || '');
      } catch {
        return [] as string[];
      }
    })
  );

  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of perFeed) {
    if (r.status !== 'fulfilled') continue;
    for (const raw of r.value) {
      const clean = cleanTitle(raw);
      const key = clean.toLowerCase();
      if (clean.length > 8 && !seen.has(key)) {
        seen.add(key);
        out.push(clean);
      }
    }
  }
  return out.slice(0, 6);
}

export async function GET() {
  // ── 1. Real user searches from Supabase (last 7 days) ──────────────────────
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('user_events')
        .select('data')
        .eq('event', 'search')
        .gte('created_at', since);

      if (data && data.length > 0) {
        const counts = new Map<string, number>();
        for (const row of data) {
          const q: string | undefined = row.data?.query;
          const articleCount: number = row.data?.articleCount ?? 0;
          // Only count searches that actually returned results
          if (q && q.trim().length > 2 && articleCount >= 3) {
            const key = q.trim().toLowerCase();
            counts.set(key, (counts.get(key) ?? 0) + 1);
          }
        }

        // Preserve original casing from first qualifying occurrence
        const origCase = new Map<string, string>();
        for (const row of data) {
          const q: string | undefined = row.data?.query;
          const articleCount: number = row.data?.articleCount ?? 0;
          if (q && q.trim().length > 2 && articleCount >= 3) {
            const key = q.trim().toLowerCase();
            if (!origCase.has(key)) origCase.set(key, q.trim());
          }
        }

        const top = [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([key]) => origCase.get(key) ?? key);

        if (top.length >= 3) {
          return NextResponse.json(
            { searches: top, source: 'users' },
            { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=900' } }
          );
        }
      }
    }
  } catch {
    // Fall through to headlines
  }

  // ── 2. Live headlines from RSS feeds (free, works in production) ─────────────
  try {
    const rss = await trendingFromRSS();
    if (rss.length >= 3) {
      return NextResponse.json(
        { searches: rss, source: 'headlines' },
        { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=900' } }
      );
    }
  } catch {
    // Fall through to NewsAPI
  }

  // ── 3. Fallback: top headlines from NewsAPI ─────────────────────────────────
  if (!NEWS_API_KEY) {
    return NextResponse.json({ searches: [], source: 'none' });
  }

  try {
    const categories = ['general', 'business', 'technology', 'health'];
    const results = await Promise.allSettled(
      categories.map(cat =>
        axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
          params: { country: 'us', category: cat, pageSize: 2, apiKey: NEWS_API_KEY },
          timeout: 6000,
        })
      )
    );

    const searches: string[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const a of r.value.data.articles ?? []) {
          if (!a.title || a.title === '[Removed]') continue;
          const clean = cleanTitle(a.title);
          if (clean.length > 5 && !searches.includes(clean)) {
            searches.push(clean);
          }
        }
      }
    }

    return NextResponse.json(
      { searches: searches.slice(0, 6), source: 'headlines' },
      { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=900' } }
    );
  } catch {
    return NextResponse.json({ searches: [], source: 'error' });
  }
}
