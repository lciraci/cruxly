'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EnrichedArticle } from '@/types/news';
import { StoryAnalysis } from '@/types/analysis';
import AdBanner from '@/components/AdBanner';
import { SkeletonGrid, SkeletonBiasBar } from '@/components/SkeletonCard';

export default function StoryPage() {
  return (
    <Suspense fallback={<StoryLoading />}>
      <StoryContent />
    </Suspense>
  );
}

function StoryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <SkeletonBiasBar />
        </div>
        <SkeletonGrid count={6} />
      </div>
    </div>
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
  const [errorType, setErrorType] = useState<'search' | 'analysis'>('search');
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
      setErrorType('search');
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
          articles: articles.slice(0, 6),
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
      setErrorType('analysis');
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

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {query}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Searching across 30+ sources...
            </p>
            <SkeletonBiasBar />
          </div>
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error && errorType === 'search') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchArticles}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Query Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                {query}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
                Comparing coverage across {diversity?.uniqueSources || '...'} sources
              </p>
            </div>

            {/* Analyze button — mobile friendly */}
            {!analysis && articles.length > 0 && (
              <button
                onClick={analyzeArticles}
                disabled={analyzing}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                {analyzing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
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

          {/* Bias Distribution Bar */}
          {diversity && (
            <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Political Spectrum:</span>
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
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                {Object.entries(diversity.biasDistribution).map(([bias, count]) => (
                  <span key={bias} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${getBiasColor(bias)}`}></span>
                    <span className="hidden sm:inline">{getBiasLabel(bias)}:</span>
                    <span className="sm:hidden">{getBiasLabel(bias).replace('Center ', 'C-')}:</span>
                    {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Analysis error banner (inline, not full-page) */}
        {error && errorType === 'analysis' && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">
                Analysis failed: {error}
              </p>
            </div>
            <button
              onClick={() => { setError(null); analyzeArticles(); }}
              className="px-4 py-1.5 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-1 sm:gap-4 -mb-px">
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 sm:px-4 py-2.5 font-medium text-sm sm:text-base border-b-2 transition-colors ${
                activeTab === 'sources'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sources ({articles.length})
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={!analysis}
              className={`px-3 sm:px-4 py-2.5 font-medium text-sm sm:text-base border-b-2 transition-colors ${
                activeTab === 'analysis'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              AI Analysis {!analysis && <span className="hidden sm:inline text-xs ml-1">(run analysis first)</span>}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'sources' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {articles.map((article, idx) => (
                <article
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col"
                >
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt=""
                      className="w-full h-40 sm:h-48 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center flex-wrap gap-1.5 mb-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {article.source.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs text-white ${getBiasColor(article.sourceBias)}`}>
                        {getBiasLabel(article.sourceBias)}
                      </span>
                      {article.sourceTrustScore && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Trust: {article.sourceTrustScore}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-1">
                      {article.description}
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium inline-flex items-center gap-1"
                    >
                      Read full article
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Ad after sources list */}
            <AdBanner slot="SOURCES_BOTTOM_AD" format="horizontal" />
          </>
        )}

        {activeTab === 'analysis' && analysis && (
          <div className="space-y-6 sm:space-y-8">
            {/* Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                AI Summary
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                {analysis.summary}
              </p>
            </div>

            {/* Ad after summary */}
            <AdBanner slot="ANALYSIS_TOP_AD" format="horizontal" />

            {/* Consensus Facts */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-4 sm:p-6 border border-green-200 dark:border-green-800">
              <h2 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Consensus Facts
              </h2>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Facts reported by multiple sources across the political spectrum
              </p>
              <div className="space-y-3">
                {analysis.consensusFacts.map((fact, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4">
                    <p className="text-slate-800 dark:text-slate-200 font-medium mb-2 text-sm sm:text-base">
                      {fact.claim}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      <span>{fact.sourceCount} sources</span>
                      <span className={`px-2 py-0.5 rounded ${
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-md p-4 sm:p-6 border border-yellow-200 dark:border-yellow-800">
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Disputed Claims
                </h2>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                  Claims reported by some sources but not others
                </p>
                <div className="space-y-3">
                  {analysis.disputedClaims.map((claim, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4">
                      <p className="text-slate-800 dark:text-slate-200 font-medium mb-2 text-sm sm:text-base">
                        {claim.claim}
                      </p>
                      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        <span>Reported by: {claim.sources.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source-by-Source Analysis */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                Source Analysis
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {analysis.sourceAnalyses.map((sourceAnalysis, idx) => (
                  <details key={idx} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4 group">
                    <summary className="cursor-pointer font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2">
                      <span className="text-sm sm:text-base">{sourceAnalysis.sourceName}</span>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm ${
                          sourceAnalysis.emotionalTone === 'neutral' ? 'bg-gray-200 dark:bg-gray-600' :
                          sourceAnalysis.emotionalTone === 'positive' ? 'bg-green-200 dark:bg-green-700' :
                          sourceAnalysis.emotionalTone === 'negative' ? 'bg-red-200 dark:bg-red-700' :
                          'bg-blue-200 dark:bg-blue-700'
                        }`}>
                          {sourceAnalysis.emotionalTone}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">
                          {sourceAnalysis.score}/100
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
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-2"
                      >
                        Read full article
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
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
