/**
 * RSS Feed URLs for top news sources.
 * RSS gives us FREE, FULL TEXT articles with no API limits.
 * Multiple feeds per source (general + topic-specific) for better coverage.
 */

export interface RSSFeedConfig {
  sourceId: string; // Must match an id in sources.ts
  feedUrl: string;
  category?: string; // Topic category for smarter matching
}

// Top sources with working RSS feeds, balanced across the political spectrum
// Multiple feeds per source covers different topics
export const RSS_FEEDS: RSSFeedConfig[] = [
  // === LEFT / CENTER-LEFT ===

  // CNN
  { sourceId: 'cnn', feedUrl: 'http://rss.cnn.com/rss/edition_world.rss', category: 'world' },
  { sourceId: 'cnn', feedUrl: 'http://rss.cnn.com/rss/money_news_international.rss', category: 'business' },
  { sourceId: 'cnn', feedUrl: 'http://rss.cnn.com/rss/edition_technology.rss', category: 'technology' },

  // NYT
  { sourceId: 'nyt', feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world' },
  { sourceId: 'nyt', feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml', category: 'environment' },
  { sourceId: 'nyt', feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', category: 'politics' },
  { sourceId: 'nyt', feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'technology' },
  { sourceId: 'nyt', feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'business' },

  // Guardian
  { sourceId: 'guardian', feedUrl: 'https://www.theguardian.com/world/rss', category: 'world' },
  { sourceId: 'guardian', feedUrl: 'https://www.theguardian.com/environment/rss', category: 'environment' },
  { sourceId: 'guardian', feedUrl: 'https://www.theguardian.com/technology/rss', category: 'technology' },
  { sourceId: 'guardian', feedUrl: 'https://www.theguardian.com/us-news/rss', category: 'us-news' },

  // Politico
  { sourceId: 'politico', feedUrl: 'https://rss.politico.com/politics-news.xml', category: 'politics' },
  { sourceId: 'politico', feedUrl: 'https://rss.politico.com/economy.xml', category: 'business' },

  // === CENTER ===

  // Reuters
  { sourceId: 'reuters', feedUrl: 'https://www.rss.reuters.com/news/world', category: 'world' },
  { sourceId: 'reuters', feedUrl: 'https://www.rss.reuters.com/news/technology', category: 'technology' },
  { sourceId: 'reuters', feedUrl: 'https://www.rss.reuters.com/news/business', category: 'business' },

  // AP
  { sourceId: 'ap', feedUrl: 'https://rsshub.app/apnews/topics/apf-topnews', category: 'world' },
  { sourceId: 'ap', feedUrl: 'https://rsshub.app/apnews/topics/apf-politics', category: 'politics' },
  { sourceId: 'ap', feedUrl: 'https://rsshub.app/apnews/topics/apf-science', category: 'science' },
  { sourceId: 'ap', feedUrl: 'https://rsshub.app/apnews/topics/apf-business', category: 'business' },

  // BBC
  { sourceId: 'bbc', feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
  { sourceId: 'bbc', feedUrl: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'environment' },
  { sourceId: 'bbc', feedUrl: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'technology' },
  { sourceId: 'bbc', feedUrl: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'business' },

  // === CENTER-RIGHT / RIGHT ===

  // Fox News
  { sourceId: 'fox', feedUrl: 'https://moxie.foxnews.com/google-publisher/world.xml', category: 'world' },
  { sourceId: 'fox', feedUrl: 'https://moxie.foxnews.com/google-publisher/politics.xml', category: 'politics' },
  { sourceId: 'fox', feedUrl: 'https://moxie.foxnews.com/google-publisher/science.xml', category: 'science' },
  { sourceId: 'fox', feedUrl: 'https://moxie.foxnews.com/google-publisher/tech.xml', category: 'technology' },

  // WSJ
  { sourceId: 'wsj', feedUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', category: 'world' },
  { sourceId: 'wsj', feedUrl: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', category: 'business' },
  { sourceId: 'wsj', feedUrl: 'https://feeds.a.dj.com/rss/RSSWSJD.xml', category: 'technology' },

  // National Review
  { sourceId: 'nationalreview', feedUrl: 'https://www.nationalreview.com/feed/', category: 'politics' },
];

// Get feeds grouped by bias for balanced fetching
export function getFeedsByBias(): Record<string, RSSFeedConfig[]> {
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
