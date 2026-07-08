import { NextResponse } from 'next/server';
import axios from 'axios';
import RSSParser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseClient } from '@/lib/supabase';
import { RSS_FEEDS } from '@/config/rss-feeds';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const rssParser = new RSSParser();
const anthropic = new Anthropic();

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

// Reject ads/promos and vague fragments that sneak into RSS feeds
// (e.g. "0% intro APR…", "It's official").
const AD_RE = /\bAPR\b|%\s*off|\bcoupon\b|\bsponsored\b|shop now|\bdiscount(s|ed)?\b|save \$\d|\bgift card\b|\bdeal of the\b/i;
function isJunkHeadline(t: string): boolean {
  if (t.length < 15) return true;
  if (t.split(/\s+/).filter(Boolean).length < 3) return true;
  return AD_RE.test(t);
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
      if (!isJunkHeadline(clean) && !seen.has(key)) {
        seen.add(key);
        out.push(clean);
      }
    }
  }
  return out.slice(0, 18);
}

// Ask Claude Haiku to distill raw headlines into short, searchable trending
// topics (2-4 words). Returns [] on any failure so the caller can fall back.
async function generalizeTopics(headlines: string[]): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY || headlines.length === 0) return [];
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: [
        {
          type: 'text',
          text:
            'You turn news headlines into short, searchable trending topics. Given a list of current headlines, return the 6 most distinct stories as concise topic labels of 2-4 words each (e.g. "NATO Europe", "Iran sanctions", "Trump tariffs"). Each must be specific enough to return relevant news when searched, but generic enough to read as a clean chip — no full sentences, no trailing punctuation, no editorializing. Return ONLY a JSON array of 6 strings.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: `Headlines:\n${headlines.map((h) => `- ${h}`).join('\n')}` }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const json = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is string => typeof s === 'string')
      .map((s) => s.trim())
      .filter((s) => s.length >= 3 && s.length <= 40)
      .slice(0, 6);
  } catch {
    return [];
  }
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

        // Require ≥2 searches so one-off / test queries don't count as "trending"
        const top = [...counts.entries()]
          .filter(([, c]) => c >= 2)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([key]) => origCase.get(key) ?? key);

        if (top.length >= 3) {
          const generic = await generalizeTopics(top);
          const searches = generic.length >= 3 ? generic : top.slice(0, 6);
          return NextResponse.json(
            { searches, source: 'users' },
            { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=900' } }
          );
        }
      }
    }
  } catch {
    // Fall through to headlines
  }

  // ── 2. Live headlines from RSS, distilled into short topics by Claude ────────
  try {
    const headlines = await trendingFromRSS();
    if (headlines.length >= 3) {
      const generic = await generalizeTopics(headlines);
      const searches = generic.length >= 3 ? generic : headlines.slice(0, 6);
      return NextResponse.json(
        { searches, source: 'headlines' },
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
