export type BiasLeaning = 'left' | 'center-left' | 'center' | 'center-right' | 'right';
export type SourceRegion = 'us' | 'uk' | 'spain' | 'italy' | 'france' | 'germany' | 'international';

export interface NewsSource {
  id: string;
  name: string;
  domain: string;
  bias: BiasLeaning;
  region: SourceRegion;
  language: string;
  newsApiId?: string; // NewsAPI source identifier
  trustScore: number; // 0-100, based on factual reporting history
  description?: string;
}

// Trusted news sources database
export const NEWS_SOURCES: NewsSource[] = [
  // United States - Left
  {
    id: 'nyt',
    name: 'The New York Times',
    domain: 'nytimes.com',
    bias: 'center-left',
    region: 'us',
    language: 'en',
    newsApiId: 'the-new-york-times',
    trustScore: 88,
    description: 'Leading US newspaper, center-left editorial stance'
  },
  {
    id: 'wapo',
    name: 'The Washington Post',
    domain: 'washingtonpost.com',
    bias: 'center-left',
    region: 'us',
    language: 'en',
    newsApiId: 'the-washington-post',
    trustScore: 85,
    description: 'Major US daily, known for investigative journalism'
  },
  {
    id: 'cnn',
    name: 'CNN',
    domain: 'cnn.com',
    bias: 'left',
    region: 'us',
    language: 'en',
    newsApiId: 'cnn',
    trustScore: 75,
    description: 'Cable news network, left-leaning'
  },
  {
    id: 'politico',
    name: 'Politico',
    domain: 'politico.com',
    bias: 'center-left',
    region: 'us',
    language: 'en',
    newsApiId: 'politico',
    trustScore: 82,
    description: 'Political journalism focused publication'
  },

  // United States - Center
  {
    id: 'reuters',
    name: 'Reuters',
    domain: 'reuters.com',
    bias: 'center',
    region: 'international',
    language: 'en',
    newsApiId: 'reuters',
    trustScore: 95,
    description: 'International news wire service, highly factual'
  },
  {
    id: 'ap',
    name: 'Associated Press',
    domain: 'apnews.com',
    bias: 'center',
    region: 'international',
    language: 'en',
    newsApiId: 'associated-press',
    trustScore: 95,
    description: 'News wire service, gold standard for factual reporting'
  },
  {
    id: 'bbc',
    name: 'BBC News',
    domain: 'bbc.com',
    bias: 'center',
    region: 'uk',
    language: 'en',
    newsApiId: 'bbc-news',
    trustScore: 90,
    description: 'British public broadcaster, internationally respected'
  },
  {
    id: 'axios',
    name: 'Axios',
    domain: 'axios.com',
    bias: 'center',
    region: 'us',
    language: 'en',
    newsApiId: 'axios',
    trustScore: 83,
    description: 'Smart brevity journalism, fact-focused'
  },
  {
    id: 'economist',
    name: 'The Economist',
    domain: 'economist.com',
    bias: 'center',
    region: 'uk',
    language: 'en',
    newsApiId: 'the-economist',
    trustScore: 88,
    description: 'International weekly, free-market perspective'
  },

  // United States - Right
  {
    id: 'fox',
    name: 'Fox News',
    domain: 'foxnews.com',
    bias: 'right',
    region: 'us',
    language: 'en',
    newsApiId: 'fox-news',
    trustScore: 65,
    description: 'Cable news network, right-leaning'
  },
  {
    id: 'wsj',
    name: 'The Wall Street Journal',
    domain: 'wsj.com',
    bias: 'center-right',
    region: 'us',
    language: 'en',
    newsApiId: 'the-wall-street-journal',
    trustScore: 87,
    description: 'Business-focused daily, center-right editorial page'
  },
  {
    id: 'nationalreview',
    name: 'National Review',
    domain: 'nationalreview.com',
    bias: 'right',
    region: 'us',
    language: 'en',
    newsApiId: 'national-review',
    trustScore: 75,
    description: 'Conservative political magazine'
  },

  // United Kingdom
  {
    id: 'guardian',
    name: 'The Guardian',
    domain: 'theguardian.com',
    bias: 'left',
    region: 'uk',
    language: 'en',
    newsApiId: 'the-guardian-uk',
    trustScore: 85,
    description: 'British daily, left-leaning editorial stance'
  },
  {
    id: 'telegraph',
    name: 'The Telegraph',
    domain: 'telegraph.co.uk',
    bias: 'center-right',
    region: 'uk',
    language: 'en',
    newsApiId: 'the-telegraph',
    trustScore: 80,
    description: 'British daily, conservative-leaning'
  },
  {
    id: 'ft',
    name: 'Financial Times',
    domain: 'ft.com',
    bias: 'center-right',
    region: 'uk',
    language: 'en',
    newsApiId: 'financial-times',
    trustScore: 90,
    description: 'International business newspaper'
  },

  // Spain
  {
    id: 'elpais',
    name: 'El País',
    domain: 'elpais.com',
    bias: 'center-left',
    region: 'spain',
    language: 'es',
    trustScore: 82,
    description: 'Leading Spanish newspaper, center-left'
  },
  {
    id: 'elmundo',
    name: 'El Mundo',
    domain: 'elmundo.es',
    bias: 'center-right',
    region: 'spain',
    language: 'es',
    trustScore: 80,
    description: 'Major Spanish daily, center-right'
  },
  {
    id: 'abc-es',
    name: 'ABC',
    domain: 'abc.es',
    bias: 'right',
    region: 'spain',
    language: 'es',
    trustScore: 75,
    description: 'Spanish newspaper, conservative-leaning'
  },

  // Italy
  {
    id: 'repubblica',
    name: 'La Repubblica',
    domain: 'repubblica.it',
    bias: 'center-left',
    region: 'italy',
    language: 'it',
    trustScore: 78,
    description: 'Major Italian daily, center-left'
  },
  {
    id: 'corriere',
    name: 'Corriere della Sera',
    domain: 'corriere.it',
    bias: 'center',
    region: 'italy',
    language: 'it',
    trustScore: 83,
    description: 'Italy\'s leading newspaper, centrist'
  },
  {
    id: 'ilsole24ore',
    name: 'Il Sole 24 Ore',
    domain: 'ilsole24ore.com',
    bias: 'center-right',
    region: 'italy',
    language: 'it',
    trustScore: 85,
    description: 'Italian business newspaper'
  },

  // France
  {
    id: 'lemonde',
    name: 'Le Monde',
    domain: 'lemonde.fr',
    bias: 'center-left',
    region: 'france',
    language: 'fr',
    trustScore: 85,
    description: 'Leading French daily, center-left'
  },
  {
    id: 'lefigaro',
    name: 'Le Figaro',
    domain: 'lefigaro.fr',
    bias: 'center-right',
    region: 'france',
    language: 'fr',
    trustScore: 82,
    description: 'Major French newspaper, center-right'
  },
  {
    id: 'afp',
    name: 'Agence France-Presse',
    domain: 'afp.com',
    bias: 'center',
    region: 'international',
    language: 'fr',
    trustScore: 93,
    description: 'International news wire service'
  },

  // Germany
  {
    id: 'spiegel',
    name: 'Der Spiegel',
    domain: 'spiegel.de',
    bias: 'center-left',
    region: 'germany',
    language: 'de',
    newsApiId: 'der-spiegel',
    trustScore: 84,
    description: 'German weekly news magazine, center-left'
  },
  {
    id: 'welt',
    name: 'Die Welt',
    domain: 'welt.de',
    bias: 'center-right',
    region: 'germany',
    language: 'de',
    trustScore: 81,
    description: 'German daily, center-right'
  },
  {
    id: 'faz',
    name: 'Frankfurter Allgemeine',
    domain: 'faz.net',
    bias: 'center-right',
    region: 'germany',
    language: 'de',
    trustScore: 86,
    description: 'German newspaper, center-right'
  },

  // International/Business
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    domain: 'bloomberg.com',
    bias: 'center',
    region: 'international',
    language: 'en',
    newsApiId: 'bloomberg',
    trustScore: 88,
    description: 'Business and financial news'
  }
];

// Helper functions
export function getSourcesByBias(bias: BiasLeaning): NewsSource[] {
  return NEWS_SOURCES.filter(source => source.bias === bias);
}

export function getSourcesByRegion(region: SourceRegion): NewsSource[] {
  return NEWS_SOURCES.filter(source => source.region === region);
}

export function getSourceById(id: string): NewsSource | undefined {
  return NEWS_SOURCES.find(source => source.id === id);
}

export function getSourcesByLanguage(language: string): NewsSource[] {
  return NEWS_SOURCES.filter(source => source.language === language);
}

// Get diverse set of sources (mix of biases) for a given region
export function getDiverseSourceSet(region?: SourceRegion, limit: number = 6): NewsSource[] {
  let sources = region ? getSourcesByRegion(region) : NEWS_SOURCES;

  // Ensure we have representation from different biases
  const biases: BiasLeaning[] = ['left', 'center-left', 'center', 'center-right', 'right'];
  const diverseSources: NewsSource[] = [];

  biases.forEach(bias => {
    const sourcesWithBias = sources.filter(s => s.bias === bias);
    if (sourcesWithBias.length > 0) {
      // Pick highest trust score for this bias
      const bestSource = sourcesWithBias.sort((a, b) => b.trustScore - a.trustScore)[0];
      diverseSources.push(bestSource);
    }
  });

  return diverseSources.slice(0, limit);
}

// Get NewsAPI-compatible source IDs
export function getNewsApiSourceIds(): string[] {
  return NEWS_SOURCES
    .filter(source => source.newsApiId)
    .map(source => source.newsApiId!);
}
