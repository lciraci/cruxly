'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnrichedArticle } from '@/types/news';
import TopicCard from '@/components/TopicCard';

const CATEGORIES = [
  { label: 'Politics', query: 'US politics Congress' },
  { label: 'Economy', query: 'global economy markets' },
  { label: 'Technology', query: 'technology AI innovation' },
  { label: 'World', query: 'international world news' },
  { label: 'Environment', query: 'climate environment' },
  { label: 'Health', query: 'health medicine' },
  { label: 'Science', query: 'science research discovery' },
  { label: 'Culture', query: 'culture society arts' },
];

interface CategoryData {
  articles: EnrichedArticle[];
  diversity?: {
    uniqueSources: number;
    sourceNames: string[];
    biasDistribution: Record<string, number>;
  };
  loading: boolean;
  error?: string;
}

export default function TopicsPage() {
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<Record<string, CategoryData>>(
    Object.fromEntries(
      CATEGORIES.map(cat => [cat.label, { articles: [], loading: true }])
    )
  );

  useEffect(() => {
    // Fetch articles for all categories in parallel
    CATEGORIES.forEach(cat => {
      fetch(`/api/news/search?q=${encodeURIComponent(cat.query)}&pageSize=4`)
        .then(r => r.ok ? r.json() : Promise.reject('Failed to fetch'))
        .then(data => {
          setCategoryData(prev => ({
            ...prev,
            [cat.label]: {
              articles: data.articles || [],
              diversity: data.diversity,
              loading: false,
            },
          }));
        })
        .catch(err => {
          setCategoryData(prev => ({
            ...prev,
            [cat.label]: {
              articles: [],
              loading: false,
              error: err,
            },
          }));
        });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-3">
            Browse All Topics
          </h1>
          <p className="text-zinc-400 max-w-2xl">
            Explore news across categories. See how different outlets cover the same stories and discover what matters to you.
          </p>
        </div>

        {/* Featured Section */}
        {categoryData['Technology']?.articles?.length > 0 && (
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-4">
              Featured
            </p>
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.07] p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🚀</span>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100">Technology</h2>
                  {categoryData['Technology'].diversity && (
                    <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mt-2 max-w-xs">
                      {categoryData['Technology'].diversity.biasDistribution['left'] && (
                        <div className="bg-blue-600 rounded-l-full" style={{ flex: categoryData['Technology'].diversity.biasDistribution['left'] }} />
                      )}
                      {categoryData['Technology'].diversity.biasDistribution['center-left'] && (
                        <div className="bg-blue-400" style={{ flex: categoryData['Technology'].diversity.biasDistribution['center-left'] }} />
                      )}
                      {categoryData['Technology'].diversity.biasDistribution['center'] && (
                        <div className="bg-zinc-500" style={{ flex: categoryData['Technology'].diversity.biasDistribution['center'] }} />
                      )}
                      {categoryData['Technology'].diversity.biasDistribution['center-right'] && (
                        <div className="bg-rose-400" style={{ flex: categoryData['Technology'].diversity.biasDistribution['center-right'] }} />
                      )}
                      {categoryData['Technology'].diversity.biasDistribution['right'] && (
                        <div className="bg-rose-600 rounded-r-full" style={{ flex: categoryData['Technology'].diversity.biasDistribution['right'] }} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {categoryData['Technology'].loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/[0.05] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : categoryData['Technology'].articles.length > 0 ? (
                <div className="space-y-3">
                  {categoryData['Technology'].articles.slice(0, 3).map((article, idx) => (
                    <a
                      key={idx}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors mb-1">
                            {article.title}
                          </h4>
                          <p className="text-xs text-zinc-500">{article.source.name}</p>
                        </div>
                        <span className="shrink-0 text-amber-400 text-lg">↗</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 italic">No articles found for this topic.</p>
              )}

              <button
                onClick={() => router.push(`/story?q=${encodeURIComponent('technology AI innovation')}`)}
                className="mt-5 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold rounded-lg transition-colors text-sm"
              >
                See all technology articles
              </button>
            </div>
          </div>
        )}

        {/* All Topics Grid */}
        <div>
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-6">
            All categories
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CATEGORIES.filter(cat => cat.label !== 'Technology').map(cat => (
              <TopicCard
                key={cat.label}
                category={cat.label}
                articles={categoryData[cat.label]?.articles || []}
                biasDistribution={categoryData[cat.label]?.diversity?.biasDistribution}
                isLoading={categoryData[cat.label]?.loading}
                onViewAll={query => router.push(`/story?q=${encodeURIComponent(query)}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
