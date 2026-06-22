import type { Metadata } from 'next';
import { Suspense } from 'react';
import StoryContent, { StoryLoading, type StoryDiversity } from '@/app/story/StoryClient';
import type { EnrichedArticle } from '@/types/news';

// Convert slug to readable topic name
// Example: 'trump-tariffs' → 'Trump Tariffs'
function slugToQuery(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getBaseUrl(): string {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
}

// Fetch the diverse article set once, server-side. ISR-cached for 24h
// (revalidate below), so this runs at most once per topic per day — and it
// doubles as the seed for the interactive comparison, so the client doesn't
// re-fetch on these pages.
async function fetchTopicData(query: string): Promise<{
  articles: EnrichedArticle[];
  diversity: StoryDiversity;
} | null> {
  try {
    const res = await fetch(
      `${getBaseUrl()}/api/news/search?q=${encodeURIComponent(query)}&pageSize=12`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.articles?.length) return null;
    return { articles: data.articles, diversity: data.diversity };
  } catch {
    return null;
  }
}

// Three spectrum buckets, collapsed from the five bias leanings.
const BUCKETS: {
  key: 'liberal' | 'center' | 'conservative';
  label: string;
  biases: string[];
  cls: string;
  title: string;
  body: string;
  fallback: (q: string) => string;
}[] = [
  {
    key: 'liberal',
    label: 'Liberal Sources',
    biases: ['left', 'center-left'],
    cls: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'text-emerald-400',
    body: 'text-emerald-300',
    fallback: q => `Left-leaning outlets and their take on ${q}`,
  },
  {
    key: 'center',
    label: 'Center Sources',
    biases: ['center'],
    cls: 'bg-blue-500/10 border-blue-500/20',
    title: 'text-blue-400',
    body: 'text-blue-300',
    fallback: q => `Mainstream and neutral outlets covering ${q}`,
  },
  {
    key: 'conservative',
    label: 'Conservative Sources',
    biases: ['center-right', 'right'],
    cls: 'bg-rose-500/10 border-rose-500/20',
    title: 'text-rose-400',
    body: 'text-rose-300',
    fallback: q => `Right-leaning outlets reporting on ${q}`,
  },
];

function bucketsFor(articles: EnrichedArticle[]) {
  return BUCKETS.map(b => {
    const inBucket = articles.filter(a => a.sourceBias && b.biases.includes(a.sourceBias));
    return {
      ...b,
      outlets: [...new Set(inBucket.map(a => a.source.name))],
      headline: inBucket[0]?.title,
    };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const query = slugToQuery(slug);

  const title = `${query} — Cruxly`;
  const description = `See how left, center, and right media cover "${query}". Compare 30+ news outlets side by side on Cruxly.`;
  const ogImage = `/api/og?q=${encodeURIComponent(query)}`;
  const canonicalUrl = `https://cruxly.dev/topic/${slug}`;

  return {
    title,
    description,
    metadataBase: new URL('https://cruxly.dev'),
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      siteName: 'Cruxly',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@cruxly',
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export async function generateStaticParams() {
  try {
    // Fetch trending searches at build time
    // This pre-generates the top 10 trending topics as static pages
    const res = await fetch(`${getBaseUrl()}/api/trending`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch trending');
    }

    const data = await res.json();
    const searches: string[] = data.searches || [];

    // Pre-generate top 10 topics
    return searches.slice(0, 10).map((query: string) => ({
      slug: query
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array to use ISR for all routes
    // This is safe — all routes will render on-demand with caching
    return [];
  }
}

// Revalidate ISR every 24 hours
// Top 10 topics are static, others render on-demand and cache for 24h
export const revalidate = 86400;

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const query = slugToQuery(slug);
  const data = await fetchTopicData(query);
  const cards = bucketsFor(data?.articles ?? []);

  return (
    <div className="bg-[#0d1117]">
      {/* The product first — the live comparison across the spectrum. */}
      <Suspense fallback={<StoryLoading />}>
        <StoryContent
          initialQuery={query}
          initialArticles={data?.articles}
          initialDiversity={data?.diversity}
        />
      </Suspense>

      {/* Supporting context for search engines — secondary, below the comparison. */}
      <section className="border-t border-white/[0.06]">
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-zinc-200 mb-2">How outlets cover {query}</h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-3xl">
            Comparing how left, center, and right media outlets cover {query}. See which facts they share and what each side leaves out across 30+ news sources.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map(card => (
              <div key={card.key} className={`p-4 rounded-lg border ${card.cls}`}>
                <div className={`text-sm font-semibold mb-2 ${card.title}`}>{card.label}</div>
                {card.outlets.length > 0 ? (
                  <>
                    <p className={`text-xs mb-2 ${card.body}`}>{card.outlets.join(', ')}</p>
                    {card.headline && (
                      <p className="text-xs text-zinc-500 italic">&ldquo;{card.headline}&rdquo;</p>
                    )}
                  </>
                ) : (
                  <p className={`text-xs ${card.body}`}>{card.fallback(query)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
