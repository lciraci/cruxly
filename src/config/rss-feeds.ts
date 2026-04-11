/**
 * RSS Feed URLs for top news sources.
 * RSS gives us FREE, FULL TEXT articles with no API limits.
 * This is the primary data source; NewsAPI is the fallback.
 */

export interface RSSFeedConfig {
  sourceId: string; // Must match an id in sources.ts
  feedUrl: string;
  category?: string; // Some sources have category-specific feeds
}

// Top sources with working RSS feeds, balanced across the political spectrum
export const RSS_FEEDS: RSSFeedConfig[] = [
  // === LEFT / CENTER-LEFT ===
  {
    sourceId: 'cnn',
    feedUrl: 'http://rss.cnn.com/rss/edition_world.rss',
  },
  {
    sourceId: 'nyt',
    feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  },
  {
    sourceId: 'guardian',
    feedUrl: 'https://www.theguardian.com/world/rss',
  },
  {
    sourceId: 'politico',
    feedUrl: 'https://rss.politico.com/politics-news.xml',
  },

  // === CENTER ===
  {
    sourceId: 'reuters',
    feedUrl: 'https://www.rss.reuters.com/news/world',
  },
  {
    sourceId: 'ap',
    feedUrl: 'https://rsshub.app/apnews/topics/apf-topnews',
  },
  {
    sourceId: 'bbc',
    feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  },

  // === CENTER-RIGHT / RIGHT ===
  {
    sourceId: 'fox',
    feedUrl: 'https://moxie.foxnews.com/google-publisher/world.xml',
  },
  {
    sourceId: 'wsj',
    feedUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
  },
  {
    sourceId: 'nationalreview',
    feedUrl: 'https://www.nationalreview.com/feed/',
  },
];

// Get feeds grouped by bias for balanced fetching
export function getFeedsByBias(): Record<string, RSSFeedConfig[]> {
  // We import sources dynamically to avoid circular deps
  // This function is called at runtime
  return {
    'left-center-left': RSS_FEEDS.filter((f) =>
      ['cnn', 'nyt', 'guardian', 'politico', 'wapo'].includes(f.sourceId)
    ),
    center: RSS_FEEDS.filter((f) =>
      ['reuters', 'ap', 'bbc', 'axios'].includes(f.sourceId)
    ),
    'right-center-right': RSS_FEEDS.filter((f) =>
      ['fox', 'wsj', 'nationalreview', 'telegraph'].includes(f.sourceId)
    ),
  };
}
