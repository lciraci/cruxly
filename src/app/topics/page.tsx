import type { Metadata } from 'next';
import TopicsClient from './TopicsClient';

export const metadata: Metadata = {
  title:
    'All News Topics — Compare Media Coverage Across 30+ Outlets | Cruxly',
  description:
    'Browse all news categories on Cruxly. Compare how left, center, and right outlets cover politics, economy, technology, world, health, science, and more.',
  keywords: [
    'news topics',
    'news categories',
    'media bias by topic',
    'compare news outlets',
    'news coverage comparison',
    'politics news comparison',
    'economy news comparison',
    'technology news comparison',
    'world news comparison',
    'health news comparison',
  ],
  alternates: {
    canonical: 'https://cruxly.dev/topics',
  },
  openGraph: {
    title: 'All News Topics — Compare Media Coverage Across 30+ Outlets',
    description:
      'Browse all news categories on Cruxly. See how different outlets cover politics, economy, tech, world, health, and more — side by side.',
    url: 'https://cruxly.dev/topics',
    type: 'website',
    siteName: 'Cruxly',
  },
};

// Categories with rich descriptions (used for SEO content + links)
const CATEGORY_LINKS = [
  {
    label: 'Politics',
    href: '/category/politics',
    icon: '🏛️',
    description:
      'Elections, Congress, executive orders, Supreme Court decisions, and political controversies covered by left, center, and right outlets.',
    keywords: 'Trump, Biden, Congress, elections, policy',
  },
  {
    label: 'Economy',
    href: '/category/economy',
    icon: '📈',
    description:
      'Markets, inflation, Fed policy, jobs reports, trade, and financial news from across the media spectrum.',
    keywords: 'inflation, Fed, markets, jobs, trade',
  },
  {
    label: 'Technology',
    href: '/category/technology',
    icon: '💻',
    description:
      'AI, big tech regulation, startups, cybersecurity, and digital policy covered by tech-focused and political outlets.',
    keywords: 'AI, big tech, regulation, startups, cyber',
  },
  {
    label: 'World',
    href: '/category/world',
    icon: '🌍',
    description:
      'International conflicts, diplomacy, foreign policy, and global news from American, British, and wire-service outlets.',
    keywords: 'Ukraine, Gaza, China, Russia, NATO',
  },
  {
    label: 'Health',
    href: '/category/health',
    icon: '⚕️',
    description:
      'Medical news, healthcare policy, public health debates, and wellness covered across the political spectrum.',
    keywords: 'healthcare, FDA, medicine, public health',
  },
  {
    label: 'Environment',
    href: '/topic/climate-environment',
    icon: '🌱',
    description:
      'Climate change, energy policy, environmental regulation, and conservation from outlets with different perspectives.',
    keywords: 'climate, energy, EPA, environment',
  },
  {
    label: 'Science',
    href: '/topic/science-research-discovery',
    icon: '🔬',
    description:
      'Scientific research, space exploration, and academic discoveries from major science and news publishers.',
    keywords: 'research, NASA, space, discoveries',
  },
  {
    label: 'Culture',
    href: '/topic/culture-society-arts',
    icon: '🎭',
    description:
      'Arts, entertainment, social issues, and cultural debates covered across left, center, and right outlets.',
    keywords: 'arts, entertainment, society',
  },
];

const POPULAR_TOPICS = [
  { name: 'Trump tariffs', slug: 'trump-tariffs' },
  { name: 'Gaza ceasefire', slug: 'gaza-ceasefire' },
  { name: 'AI jobs impact', slug: 'ai-jobs-impact' },
  { name: 'Fed interest rates', slug: 'fed-interest-rates' },
  { name: 'Ukraine NATO', slug: 'ukraine-nato' },
  { name: 'Climate summit', slug: 'climate-summit' },
];

const faqs = [
  {
    q: 'How do I find news topics on Cruxly?',
    a: 'Browse all news categories on this page — Politics, Economy, Technology, World, Health, Environment, Science, and Culture. Each category shows how 30+ outlets across the political spectrum cover recent stories. You can also search any topic directly from the homepage.',
  },
  {
    q: 'Which news categories show the most media bias?',
    a: 'Political and world-affairs stories typically show the largest gaps between left and right coverage. Economic and health stories often show more consensus on facts but different framing. Technology coverage varies by topic — AI regulation and tech censorship debates tend to be more polarized than product news.',
  },
  {
    q: 'Can I see trending stories within each category?',
    a: 'Yes. Each category page (Politics, Economy, etc.) features popular topics within that domain. Click any topic to see side-by-side coverage from outlets like CNN, Fox News, MSNBC, Wall Street Journal, AP, Reuters, and 25+ others.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'All News Topics — Cruxly',
      description:
        'Browse all news categories on Cruxly: politics, economy, technology, world, health, environment, science, culture. Compare media coverage across 30+ outlets.',
      url: 'https://cruxly.dev/topics',
      publisher: {
        '@type': 'Organization',
        name: 'Cruxly',
        url: 'https://cruxly.dev',
      },
      hasPart: CATEGORY_LINKS.map((cat) => ({
        '@type': 'WebPage',
        name: `${cat.label} News Coverage`,
        url: `https://cruxly.dev${cat.href}`,
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Cruxly',
          item: 'https://cruxly.dev',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Topics',
          item: 'https://cruxly.dev/topics',
        },
      ],
    },
  ],
};

export default function TopicsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-6">
          <a href="/" className="hover:text-amber-400">Cruxly</a>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Topics</span>
        </nav>

        {/* Server-rendered SEO header */}
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-3">
            All News Topics &mdash; Compare Coverage Across 30+ Outlets
          </h1>
          <p className="text-lg text-zinc-400 max-w-3xl leading-relaxed">
            Browse every news category on Cruxly. See how left-leaning,
            centrist, and conservative outlets cover politics, economy,
            technology, world affairs, health, and more &mdash; side by side.
          </p>
        </header>

        {/* SEO: server-rendered category grid with rich descriptions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">
            News Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORY_LINKS.map((cat) => (
              <a
                key={cat.label}
                href={cat.href}
                className="block p-5 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/50 border border-zinc-800 hover:border-amber-400/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors mb-1">
                      {cat.label} News Coverage
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-2">
                      {cat.description}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Topics: <span className="text-zinc-400">{cat.keywords}</span>
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Popular topics quick-links (server-rendered for SEO) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">
            Popular Topics Right Now
          </h2>
          <div className="flex flex-wrap gap-3">
            {POPULAR_TOPICS.map((topic) => (
              <a
                key={topic.slug}
                href={`/topic/${topic.slug}`}
                className="px-4 py-2 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:text-amber-200 transition-colors text-sm font-medium"
              >
                {topic.name} →
              </a>
            ))}
          </div>
        </section>

        {/* Why this matters — SEO content */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            Why Browse News by Topic on Cruxly?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <h3 className="font-semibold text-emerald-300 mb-2">
                30+ Outlets, One View
              </h3>
              <p className="text-sm text-emerald-300/80 leading-relaxed">
                CNN, Fox News, MSNBC, AP, Reuters, NYT, WSJ, BBC, and more &mdash;
                all in one side-by-side comparison.
              </p>
            </div>
            <div className="p-5 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <h3 className="font-semibold text-blue-300 mb-2">
                Spot Media Bias Patterns
              </h3>
              <p className="text-sm text-blue-300/80 leading-relaxed">
                See what each outlet emphasizes, what they leave out, and how
                their framing differs on the same story.
              </p>
            </div>
            <div className="p-5 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <h3 className="font-semibold text-purple-300 mb-2">
                Find Consensus Facts
              </h3>
              <p className="text-sm text-purple-300/80 leading-relaxed">
                When left, center, and right agree on a fact, that&#x2019;s a
                strong signal it&#x2019;s well-verified.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800"
              >
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                  {faq.q}
                </h3>
                <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live dynamic content — client-side article previews */}
        <TopicsClient />
      </div>
    </div>
  );
}
