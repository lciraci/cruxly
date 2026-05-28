import type { Metadata } from 'next';
import { Suspense } from 'react';
import StoryContent, { StoryLoading } from '@/app/story/StoryClient';

// Convert slug to readable topic name
// Example: 'trump-tariffs' → 'Trump Tariffs'
function slugToQuery(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/trending`, {
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

  return (
    <Suspense fallback={<StoryLoading />}>
      <StoryContent initialQuery={query} />
    </Suspense>
  );
}
