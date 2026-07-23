import { getSupabaseClient } from './supabase';
import { EnrichedArticle } from '@/types/news';

export interface ArchiveResult {
  stored: number;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Article archive — persists every article Cruxly sees into Supabase so the
// searchable history grows beyond the few days RSS feeds expose.
// Insert-only (ignoreDuplicates): a URL is stored once, first_seen_at kept.
// Must never break the caller — always resolves; error is reported, not thrown.
// ---------------------------------------------------------------------------
export async function archiveArticles(articles: EnrichedArticle[]): Promise<ArchiveResult> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { stored: 0, error: 'supabase client unavailable' };
    if (articles.length === 0) return { stored: 0, error: null };

    // Deduplicate by URL within the batch — Postgres rejects multi-row
    // upserts that touch the same key twice
    const byUrl = new Map<string, EnrichedArticle>();
    for (const a of articles) {
      if (a.url && a.title && !isNaN(new Date(a.publishedAt).getTime())) {
        if (!byUrl.has(a.url)) byUrl.set(a.url, a);
      }
    }
    if (byUrl.size === 0) return { stored: 0, error: null };

    const rows = [...byUrl.values()].map(a => ({
      url: a.url,
      title: a.title.slice(0, 500),
      description: a.description?.slice(0, 2000) ?? null,
      content: a.content?.slice(0, 20000) ?? null,
      source_id: a.source.id ?? null,
      source_name: a.source.name,
      source_bias: a.sourceBias ?? null,
      source_trust_score: a.sourceTrustScore ?? null,
      source_region: a.sourceRegion ?? null,
      author: a.author?.slice(0, 200) ?? null,
      image_url: a.urlToImage ?? null,
      published_at: new Date(a.publishedAt).toISOString(),
    }));

    const { error, count } = await supabase
      .from('news_articles')
      .upsert(rows, { onConflict: 'url', ignoreDuplicates: true, count: 'exact' });

    if (error) return { stored: 0, error: error.message };
    return { stored: count ?? 0, error: null };
  } catch (e) {
    return { stored: 0, error: e instanceof Error ? e.message : 'unknown error' };
  }
}

// Total rows currently in the archive (null if unavailable)
export async function archiveCount(): Promise<number | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { count, error } = await supabase
      .from('news_articles')
      .select('url', { count: 'exact', head: true });
    return error ? null : count;
  } catch {
    return null;
  }
}
