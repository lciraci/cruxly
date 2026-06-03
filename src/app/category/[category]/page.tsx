import type { Metadata } from 'next';

// Category definitions with rich SEO content
const CATEGORIES = {
  politics: {
    name: 'Politics',
    description:
      'Compare how left, center, and right media outlets cover political news, elections, policy, and government across 30+ news sources.',
    seoIntro:
      'Political news is one of the most heavily biased categories in modern media. From elections and Congressional debates to executive orders and Supreme Court decisions, every outlet frames political stories through their editorial lens.',
    leftOutlets: 'MSNBC, CNN, NPR, Washington Post, New York Times',
    rightOutlets: 'Fox News, National Review, Washington Examiner, NY Post',
    centerOutlets: 'AP, Reuters, BBC, Wall Street Journal',
    icon: '🏛️',
    relatedTopics: [
      'Trump tariffs',
      'Ukraine NATO',
      'US politics Congress',
      'elections policy',
    ],
  },
  economy: {
    name: 'Economy',
    description:
      'Compare media coverage of economic news, markets, inflation, trade, and financial trends across 30+ outlets from across the political spectrum.',
    seoIntro:
      'Economic news coverage often reveals stark differences between outlets. Liberal sources may emphasize income inequality and worker impact, while conservative sources focus on market performance and business effects. Center sources stick to numbers and forecasts.',
    leftOutlets: 'MSNBC, CNN Business, NPR, NYT Business',
    rightOutlets: 'Fox Business, WSJ Opinion, National Review',
    centerOutlets: 'AP, Reuters, Bloomberg, WSJ News',
    icon: '📈',
    relatedTopics: [
      'Fed interest rates',
      'global economy markets',
      'inflation economy',
      'markets trade',
    ],
  },
  technology: {
    name: 'Technology',
    description:
      'Compare how different outlets cover tech industry news, AI, innovation, big tech regulation, and digital policy across the political spectrum.',
    seoIntro:
      'Tech industry coverage spans business reporting, regulatory analysis, and cultural impact stories. Liberal outlets often focus on worker rights and AI ethics, while conservative outlets may emphasize free speech concerns and government overreach. Trade publications focus on the products themselves.',
    leftOutlets: 'Wired, The Verge, CNN Business, Washington Post Tech',
    rightOutlets: 'Fox Business, NY Post Tech, National Review',
    centerOutlets: 'Reuters Tech, AP Technology, WSJ Tech',
    icon: '💻',
    relatedTopics: [
      'AI jobs impact',
      'technology AI innovation',
      'AI regulation',
      'big tech policy',
    ],
  },
  world: {
    name: 'World',
    description:
      'Compare international news coverage, global conflicts, diplomacy, and world affairs across 30+ outlets with different geopolitical perspectives.',
    seoIntro:
      'World news coverage varies dramatically by outlet. Different sources prioritize different regions, frame conflicts differently, and quote different sources. Comparing American, British, and global wire-service coverage reveals how the same international event can be told completely differently.',
    leftOutlets: 'MSNBC World, CNN International, NPR, Guardian',
    rightOutlets: 'Fox World, NY Post, Washington Times',
    centerOutlets: 'AP, Reuters, BBC, Al Jazeera English',
    icon: '🌍',
    relatedTopics: [
      'Gaza ceasefire',
      'international world news',
      'global conflict',
      'diplomacy news',
    ],
  },
  health: {
    name: 'Health',
    description:
      'Compare media coverage of medical news, health policy, wellness, and healthcare debates across left, center, and right outlets.',
    seoIntro:
      'Health and medical news coverage often reflects deeper political divides — from healthcare policy and drug pricing to public health debates. Comparing left, center, and right coverage of health stories reveals both the science consensus and the political framing.',
    leftOutlets: 'MSNBC Health, CNN Health, NPR Health',
    rightOutlets: 'Fox Health, NY Post Health, National Review',
    centerOutlets: 'AP Health, Reuters Health, BBC Health',
    icon: '⚕️',
    relatedTopics: [
      'health medicine',
      'healthcare policy',
      'medical news',
      'wellness coverage',
    ],
  },
};

type CategoryKey = keyof typeof CATEGORIES;

function queryToSlug(query: string): string {
  return query
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryData = CATEGORIES[category as CategoryKey];

  if (!categoryData) {
    return { title: 'Category Not Found' };
  }

  // Keyword-rich title for category searches
  const title = `${categoryData.name} News Coverage — Compare Media Bias Across Left, Center & Right Outlets`;
  const description = categoryData.description;

  return {
    title,
    description,
    keywords: [
      `${categoryData.name.toLowerCase()} news`,
      `${categoryData.name.toLowerCase()} media bias`,
      `${categoryData.name.toLowerCase()} news comparison`,
      `${categoryData.name.toLowerCase()} left vs right`,
      `${categoryData.name.toLowerCase()} news outlets`,
      `compare ${categoryData.name.toLowerCase()} news`,
      'media bias comparison',
      'news bias by category',
    ],
    metadataBase: new URL('https://cruxly.dev'),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://cruxly.dev/category/${category}`,
      siteName: 'Cruxly',
      images: [{ url: '/api/og', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://cruxly.dev/category/${category}`,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({
    category,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryData = CATEGORIES[category as CategoryKey];

  if (!categoryData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-red-400">Category not found</h1>
      </div>
    );
  }

  const canonicalUrl = `https://cruxly.dev/category/${category}`;
  const categoryLower = categoryData.name.toLowerCase();

  // Other categories for cross-linking
  const otherCategories = Object.entries(CATEGORIES).filter(
    ([key]) => key !== category
  );

  // FAQ for rich snippets
  const faqs = [
    {
      q: `How do different outlets cover ${categoryLower} news?`,
      a: `${categoryData.seoIntro} Cruxly tracks 30+ outlets across the political spectrum — including ${categoryData.leftOutlets} on the left, ${categoryData.centerOutlets} in the center, and ${categoryData.rightOutlets} on the right — so you can compare how each covers the same ${categoryLower} stories.`,
    },
    {
      q: `Which outlets cover ${categoryLower} the most?`,
      a: `Major outlets across the spectrum provide extensive ${categoryLower} coverage. Left-leaning: ${categoryData.leftOutlets}. Center: ${categoryData.centerOutlets}. Right-leaning: ${categoryData.rightOutlets}. Each outlet brings a different framing, source selection, and emphasis to ${categoryLower} stories.`,
    },
    {
      q: `Is ${categoryLower} news biased?`,
      a: `All news coverage has some perspective — that's normal. The key is recognizing each outlet's lens. For ${categoryLower} stories, comparing coverage from left, center, and right helps you identify consensus facts and spot where outlets disagree. This is exactly what Cruxly is built for.`,
    },
  ];

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${categoryData.name} News Coverage Comparison`,
        description: categoryData.description,
        url: canonicalUrl,
        about: categoryData.name,
        publisher: {
          '@type': 'Organization',
          name: 'Cruxly',
          url: 'https://cruxly.dev',
        },
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
            name: categoryData.name,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="container mx-auto px-4 py-12 border-b border-white/[0.06]">
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-6">
          <a href="/" className="hover:text-amber-400">Cruxly</a>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">{categoryData.name}</span>
        </nav>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{categoryData.icon}</span>
          <div>
            <h1 className="text-4xl font-bold text-zinc-100 mb-2">
              {categoryData.name} News Coverage Comparison
            </h1>
            <p className="text-lg text-zinc-400">{categoryData.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Intro section */}
        <section className="mb-12">
          <p className="text-zinc-300 leading-relaxed text-lg">
            {categoryData.seoIntro}
          </p>
        </section>

        {/* Outlet breakdown */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">
            Outlets Covering {categoryData.name} News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <h3 className="text-sm font-semibold text-emerald-400 mb-3">
                Left-Leaning {categoryData.name} Outlets
              </h3>
              <p className="text-sm text-emerald-300/90 leading-relaxed">
                {categoryData.leftOutlets}
              </p>
            </div>
            <div className="p-5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h3 className="text-sm font-semibold text-blue-400 mb-3">
                Center {categoryData.name} Outlets
              </h3>
              <p className="text-sm text-blue-300/90 leading-relaxed">
                {categoryData.centerOutlets}
              </p>
            </div>
            <div className="p-5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <h3 className="text-sm font-semibold text-rose-400 mb-3">
                Conservative {categoryData.name} Outlets
              </h3>
              <p className="text-sm text-rose-300/90 leading-relaxed">
                {categoryData.rightOutlets}
              </p>
            </div>
          </div>
        </section>

        {/* Why this matters */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            Why Compare {categoryData.name} News Across Outlets?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">
                See All Perspectives
              </h3>
              <p className="text-sm text-emerald-300/80">
                Read how 30+ outlets across the political spectrum cover{' '}
                {categoryLower} stories — side by side.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">
                Spot {categoryData.name} Media Bias
              </h3>
              <p className="text-sm text-blue-300/80">
                Understand what facts are shared, what&#x2019;s emphasized, and
                what&#x2019;s left out.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">
                Find Common Ground
              </h3>
              <p className="text-sm text-purple-300/80">
                Discover consensus facts about {categoryLower} and areas of
                genuine disagreement.
              </p>
            </div>
          </div>
        </section>

        {/* Popular topics in this category */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">
            Popular {categoryData.name} Topics to Compare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryData.relatedTopics.map((topic) => (
              <a
                key={topic}
                href={`/topic/${queryToSlug(topic)}`}
                className="p-4 rounded-lg border border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 text-2xl">→</span>
                  <div>
                    <div className="font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
                      {topic}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Compare {topic.toLowerCase()} news coverage
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FAQ — rich snippets */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">
            {categoryData.name} News Coverage FAQ
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800"
              >
                <h3 className="text-lg font-semibold text-zinc-200 mb-3">
                  {faq.q}
                </h3>
                <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">
            Compare Coverage in Other Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {otherCategories.map(([key, cat]) => (
              <a
                key={key}
                href={`/category/${key}`}
                className="p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 transition-colors text-center"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm font-semibold text-zinc-300">
                  {cat.name}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="p-8 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 text-center">
          <h2 className="text-xl font-bold text-zinc-100 mb-3">
            Ready to compare {categoryLower} coverage?
          </h2>
          <p className="text-zinc-400 mb-6">
            Search any {categoryLower} topic to see how 30+ outlets frame the
            story differently.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold rounded-lg transition-colors"
          >
            Search {categoryData.name} Topics →
          </a>
        </div>
      </div>
    </div>
  );
}
