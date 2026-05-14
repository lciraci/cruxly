import type { Metadata } from 'next';
import { Suspense } from 'react';
import StoryContent, { StoryLoading } from './StoryClient';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q;
  if (!query) return { title: 'Cruxly — One story. Every side.' };

  const title = `${query} — Cruxly`;
  const description = `See how left, center, and right media cover "${query}". Compare 30+ news outlets side by side on Cruxly.`;
  const ogImage = `/api/og?q=${encodeURIComponent(query)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function StoryPage() {
  return (
    <Suspense fallback={<StoryLoading />}>
      <StoryContent />
    </Suspense>
  );
}
