'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EnrichedArticle } from '@/types/news';
import { StoryAnalysis } from '@/types/analysis';
import AdBanner from '@/components/AdBanner';

export default function StoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    }>
      <StoryContent />
    </Suspense>
  );
}

function StoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q');

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [articles, setArticles] = useState<EnrichedArticle[]>([]);
  const [analysis, setAnalysis] = useState<StoryAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sources' | 'analysis'>('sources');
  const [diversity, setDiversity] = useState<{
    uniqueSources: number;
    sourceNames: string[];
    biasDistribution: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    if (!query) {
      router.push('/');
      return;
    }

    fetchArticles();
  }, [query]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/news/search?q=${encodeURIComponent(query!)}&pageSize=12`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch news');
      }

      const data = await response.json();
      setArticles(data.articles);
      if (data.diversity) setDiversity(data.diversity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const analyzeArticles = async () => {
    if (articles.length === 0) return;

    try {
      setAnalyzing(true);
      setError(null);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: articles.slice(0, 6), // Limit to 6 for cost/speed
          topic: query,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze articles');
      }

      const data = await response.json();
      setAnalysis(data);
      setActiveTab('analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getBiasColor = (bias?: string) => {
    switch (bias) {
      case 'left': return 'bg-blue-500';
      case 'center-left': return 'bg-blue-300';
      case 'center': return 'bg-gray-400';
      case 'center-right': return 'bg-red-300';
      case 'right': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getBiasLabel = (bias?: string) => {
    return bias?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Cruxly
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {articles.length} sources found
              </span>
              {!analysis && articles.length > 0 && (
                <button
                  onClick={analyzeArticles}
                  disabled={analyzing}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze with AI
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Query Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {query}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Comparing coverage across {diversity?.uniqueSources || '...'} sources
          </p>

          {/* Bias Distribution Bar */}
          {diversity && (
            <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Political Spectrum Coverage:</span>
              </div>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                {diversity.biasDistribution['left'] && (
                  <div className="bg-blue-600" style={{ flex: diversity.biasDistribution['left'] }} title={`Left: ${diversity.biasDistribution['left']}`} />
                )}
                {diversity.biasDistribution['center-left'] && (
                  <div className="bg-blue-300" style={{ flex: diversity.biasDistribution['center-left'] }} title={`Center-Left: ${diversity.biasDistribution['center-left']}`} />
                )}
                {diversity.biasDistribution['center'] && (
                  <div className="bg-gray-400" style={{ flex: diversity.biasDistribution['center'] }} title={`Center: ${diversity.biasDistribution['center']}`} />
                )}
                {diversity.biasDistribution['center-right'] && (
                  <div className="bg-red-300" style={{ flex: diversity.biasDistribution['center-right'] }} title={`Center-Right: ${diversity.biasDistribution['center-right']}`} />
                )}
                {diversity.biasDistribution['right'] && (
                  <div className="bg-red-600" style={{ flex: diversity.biasDistribution['right'] }} title={`Right: ${diversity.biasDistribution['right']}`} />
                )}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex gap-3">
                  {Object.entries(diversity.biasDistribution).map(([bias, count]) => (
                    <span key={bias} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${getBiasColor(bias)}`}></span>
                      {getBiasLabel(bias)}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'sources'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All Sources ({articles.length})
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={!analysis}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'analysis'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              AI Analysis {!analysis && '(Run analysis first)'}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'sources' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {article.source.name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs text-white ${getBiasColor(article.sourceBias)}`}>
                        {getBiasLabel(article.sourceBias)}
                      </span>
                      {article.sourceTrustScore && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Trust: {article.sourceTrustScore}/100
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {article.description}
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      Read full article →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Ad after sources list */}
            <AdBanner slot="SOURCES_BOTTOM_AD" format="horizontal" />
          </>
        )}

        {activeTab === 'analysis' && analysis && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                AI Summary
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Ad after summary */}
            <AdBanner slot="ANALYSIS_TOP_AD" format="horizontal" />

            {/* Consensus Facts */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-6 border border-green-200 dark:border-green-800">
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Consensus Facts
              </h2>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Facts reported by multiple sources across the political spectrum
              </p>
              <div className="space-y-3">
                {analysis.consensusFacts.map((fact, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-800 dark:text-slate-200 font-medium mb-2">
                      {fact.claim}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>{fact.sourceCount} sources</span>
                      <span className={`px-2 py-1 rounded ${
                        fact.confidence === 'high' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        fact.confidence === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                      }`}>
                        {fact.confidence} confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disputed Claims */}
            {analysis.disputedClaims.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-md p-6 border border-yellow-200 dark:border-yellow-800">
                <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Disputed Claims
                </h2>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                  Claims reported by some sources but not others
                </p>
                <div className="space-y-3">
                  {analysis.disputedClaims.map((claim, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4">
                      <p className="text-slate-800 dark:text-slate-200 font-medium mb-2">
                        {claim.claim}
                      </p>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <span>Reported by: {claim.sources.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source-by-Source Analysis */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                Source Analysis
              </h2>
              <div className="space-y-4">
                {analysis.sourceAnalyses.map((sourceAnalysis, idx) => (
                  <details key={idx} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>{sourceAnalysis.sourceName}</span>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-sm ${
                          sourceAnalysis.emotionalTone === 'neutral' ? 'bg-gray-200 dark:bg-gray-600' :
                          sourceAnalysis.emotionalTone === 'positive' ? 'bg-green-200 dark:bg-green-700' :
                          sourceAnalysis.emotionalTone === 'negative' ? 'bg-red-200 dark:bg-red-700' :
                          'bg-blue-200 dark:bg-blue-700'
                        }`}>
                          {sourceAnalysis.emotionalTone}
                        </span>
                        <span className="text-sm font-semibold">
                          Score: {sourceAnalysis.score}/100
                        </span>
                      </div>
                    </summary>
                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Facts:</h4>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                          {sourceAnalysis.factualClaims.map((claim, i) => (
                            <li key={i}>{claim}</li>
                          ))}
                        </ul>
                      </div>
                      {sourceAnalysis.biasIndicators.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Bias Indicators:</h4>
                          <div className="space-y-2">
                            {sourceAnalysis.biasIndicators.map((indicator, i) => (
                              <div key={i} className="bg-white dark:bg-slate-600 rounded p-2">
                                <div className="font-medium text-slate-700 dark:text-slate-200">
                                  {indicator.type.replace(/-/g, ' ')} ({indicator.severity})
                                </div>
                                <div className="text-slate-600 dark:text-slate-400">{indicator.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <a
                        href={sourceAnalysis.articleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-block mt-2"
                      >
                        Read full article →
                      </a>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
