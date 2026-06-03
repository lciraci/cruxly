import type { Metadata } from 'next';
import { Suspense } from 'react';

// Category definitions
const CATEGORIES = {
  politics: {
    name: 'Politics',
    description: 'How different outlets cover political news, elections, policy, and government',
    icon: '🏛️',
    relatedTopics: ['Trump tariffs', 'Ukraine NATO', 'US politics Congress', 'elections policy'],
  },
  economy: {
    name: 'Economy',
    description: 'Economic news, markets, inflation, trade, and financial trends across outlets',
    icon: '📈',
    relatedTopics: ['Fed interest rates', 'global economy markets', 'inflation economy', 'markets trade'],
  },
  technology: {
    name: 'Technology',
    description: 'Tech industry coverage, AI, innovation, and digital policy from all perspectives',
    icon: '💻',
    relatedTopics: ['AI jobs impact', 'technology AI innovation', 'AI regulation', 'big tech policy'],
  },
  world: {
    name: 'World',
    description: 'International affairs, global conflicts, diplomacy, and world news coverage',
    icon: '🌍',
    relatedTopics: ['Gaza ceasefire', 'international world news', 'global conflict', 'diplomacy news'],
  },
  health: {
    name: 'Health',
    description: 'Medical news, health policy, wellness, and healthcare coverage across outlets',
    icon: '⚕️',
    relatedTopics: ['health medicine', 'healthcare policy', 'medical news', 'wellness coverage'],
  },
};

type CategoryKey = keyof typeof CATEGORIES;

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

  const title = `${categoryData.name} News Coverage Comparison — Cruxly`;
  const description = categoryData.description;

  return {
    title,
    description,
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

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return (
    <CategoryPageContent params={params} />
  );
}

async function CategoryPageContent({
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

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <div className="container mx-auto px-4 py-12 border-b border-white/[0.06]">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{categoryData.icon}</span>
          <div>
            <h1 className="text-4xl font-bold text-zinc-100 mb-2">
              {categoryData.name}
            </h1>
            <p className="text-lg text-zinc-400">
              {categoryData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-emerald-300 mb-2">Multi-Source Comparison</h3>
            <p className="text-sm text-emerald-300/80">
              See how 30+ outlets across the political spectrum cover {categoryData.name.toLowerCase()} stories
            </p>
          </div>

          <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Identify Bias Patterns</h3>
            <p className="text-sm text-blue-300/80">
              Understand what facts are shared, what's emphasized, and what's left out
            </p>
          </div>

          <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Find Common Ground</h3>
            <p className="text-sm text-purple-300/80">
              Discover consensus facts and areas of genuine disagreement
            </p>
          </div>
        </div>

        {/* Related Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">Popular {categoryData.name} Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryData.relatedTopics.map((topic) => (
              <a
                key={topic}
                href={`/topic/${topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                className="p-4 rounded-lg border border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 text-2xl">→</span>
                  <span className="font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
                    {topic}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 text-center">
          <h3 className="text-xl font-bold text-zinc-100 mb-3">
            Ready to compare {categoryData.name.toLowerCase()} coverage?
          </h3>
          <p className="text-zinc-400 mb-6">
            Search any {categoryData.name.toLowerCase()} topic to see how different outlets frame the story
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold rounded-lg transition-colors"
          >
            Search Topics
          </a>
        </div>
      </div>
    </div>
  );
}
