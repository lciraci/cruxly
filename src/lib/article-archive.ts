import { getSupabaseClient } from './supabase';
import { EnrichedArticle } from '@/types/news';

// ---------------------------------------------------------------------------
// Article archive — persists every article Cruxly sees into Supabase so the
// searchable history grows beyond the few days RSS feeds expose.
// Insert-only (ignoreDuplicates): a URL is stored once, first_seen_at kept.
// Must never break the caller — always resolves, returns rows written.
// ---------------------------------------------------------------------------
export async function archiveArticles(articles: EnrichedArticle[]): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase || articles.length === 0) return 0;

    // Deduplicate by URL within the batch — Postgres rejects multi-row
    // upserts that touch the same key twice
    const byUrl = new Map<string, EnrichedArticle>();
    for (const a of articles) {
      if (a.url && a.title && !isNaN(new Date(a.publishedAt).getTime())) {
        if (!byUrl.has(a.url)) byUrl.set(a.url, a);
      }
    }
    if (byUrl.size === 0) return 0;

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

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
