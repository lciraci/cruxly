import { NextRequest, NextResponse } from 'next/server';
import { fetchAllRSSArticles } from '@/lib/rss-articles';
import { archiveArticles, archiveCount } from '@/lib/article-archive';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Daily archive ingestion: pull every configured RSS feed and store whatever
// the feeds currently expose (no age cutoff — the archive wants everything).
// Guarantees the archive grows even on days with no search traffic.
export async function GET(req: NextRequest) {
  // Protect the endpoint: when CRON_SECRET is set, Vercel Cron sends it as a
  // Bearer token. Reject anything that doesn't match.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const articles = await fetchAllRSSArticles();
  const { stored, error } = await archiveArticles(articles);
  const total = await archiveCount();

  return NextResponse.json({
    ok: error === null,
    fetched: articles.length,
    newlyArchived: stored,
    totalInArchive: total,
    archiveError: error,
    timestamp: new Date().toISOString(),
  });
}
