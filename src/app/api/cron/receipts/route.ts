import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import type { EnrichedArticle } from '@/types/news';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = 'https://cruxly.dev';

const isLeft = (b?: string) => b === 'left' || b === 'center-left';
const isRight = (b?: string) => b === 'right' || b === 'center-right';

async function topicArticles(query: string): Promise<EnrichedArticle[]> {
  try {
    const res = await fetch(
      `${BASE}/api/news/search?q=${encodeURIComponent(query)}&pageSize=12`,
      { cache: 'no-store', signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles ?? []) as EnrichedArticle[];
  } catch {
    return [];
  }
}

// Build a "receipt" for one topic: the same story, framed differently across
// the spectrum. Needs at least two distinct outlets from different sides.
function buildReceipt(topic: string, articles: EnrichedArticle[]): string | null {
  const left = articles.find((a) => isLeft(a.sourceBias) && a.title);
  const center = articles.find((a) => a.sourceBias === 'center' && a.title);
  const right = articles.find((a) => isRight(a.sourceBias) && a.title);
  const picks = [left, center, right].filter(Boolean) as EnrichedArticle[];
  if (picks.length < 2) return null;
  const lines = picks.map((a) => `• ${a.source.name}: “${a.title}”`);
  return `[${topic}]\n${lines.join('\n')}`;
}

export async function GET(req: NextRequest) {
  // Protect the endpoint: when CRON_SECRET is set, Vercel Cron sends it as a
  // Bearer token. Reject anything that doesn't match.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1) Trending topics (fallback to a static set if the API is unavailable)
  let topics: string[] = [];
  try {
    const r = await fetch(`${BASE}/api/trending`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (r.ok) topics = (await r.json()).searches ?? [];
  } catch {
    /* ignore — fallback below */
  }
  if (topics.length === 0) {
    topics = ['Trump tariffs', 'Gaza ceasefire', 'Fed interest rates', 'Ukraine NATO', 'AI jobs impact'];
  }

  // 2) Fetch coverage for up to 6 topics in parallel
  const candidates = topics.slice(0, 6);
  const coverage = await Promise.all(
    candidates.map(async (t) => buildReceipt(t, await topicArticles(t)))
  );

  // 3) Keep the 3 strongest receipts (clearest cross-spectrum contrast)
  const receipts = coverage.filter((r): r is string => r !== null).slice(0, 3);

  if (receipts.length === 0) {
    return NextResponse.json({ ok: false, reason: 'No divergent stories found this run.' });
  }

  const draft = [
    "This week's media bias receipts 🧾",
    '',
    receipts.join('\n\n'),
    '',
    'Full receipts → cruxly.dev',
  ].join('\n');

  // 4) Store as a draft for review — drafts mode never auto-posts anywhere.
  let stored = false;
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('receipt_drafts').insert({ content: draft, status: 'draft' });
    stored = !error;
  }

  return NextResponse.json({ ok: true, stored, draft });
}
