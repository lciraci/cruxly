import RSSParser from 'rss-parser';
import { getSourceById } from '@/config/sources';
import { RSS_FEEDS } from '@/config/rss-feeds';
import { EnrichedArticle } from '@/types/news';

const rssParser = new RSSParser();

// ---------------------------------------------------------------------------
// RSS Feed Fetching — free, full text, no API limits
// Fetches every configured feed in parallel; feeds that fail or time out are
// simply skipped. Pass maxAgeDays to drop older items (search wants recent
// coverage); omit it to keep everything the feeds expose (archive ingestion).
// ---------------------------------------------------------------------------
export async function fetchAllRSSArticles(maxAgeDays?: number): Promise<EnrichedArticle[]> {
  const allArticles: EnrichedArticle[] = [];
  const cutoff = maxAgeDays ? Date.now() - maxAgeDays * 24 * 60 * 60 * 1000 : null;

  const feedPromises = RSS_FEEDS.map(async (feedConfig) => {
    try {
      // Race the parse against a hard 5-second timeout
      const feed = await Promise.race([
        rssParser.parseURL(feedConfig.feedUrl),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ]);

      const source = getSourceById(feedConfig.sourceId);
      if (!source || !feed.items) return [];

      return feed.items
        .slice(0, 15)
        .map((item): EnrichedArticle => ({
          source: { id: source.newsApiId || source.id, name: source.name },
          author: item.creator || item['dc:creator'] || null,
          title: item.title || '',
          description: item.contentSnippet || item.content?.substring(0, 300) || null,
          url: item.link || '',
          urlToImage: item.enclosure?.url || null,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          content: item.content || item['content:encoded'] || null,
          sourceBias: source.bias,
          sourceTrustScore: source.trustScore,
          sourceRegion: source.region,
        }))
        .filter(article => {
          const pubDate = new Date(article.publishedAt).getTime();
          if (isNaN(pubDate)) return false;
          return cutoff === null || pubDate > cutoff;
        });
    } catch (_err) {
      // RSS feed failed — that's fine, we have other sources
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  }

  return allArticles;
}
