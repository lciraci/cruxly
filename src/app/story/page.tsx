'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EnrichedArticle } from '@/types/news';
import { StoryAnalysis, NarrativeDrift } from '@/types/analysis';
import AdBanner from '@/components/AdBanner';
import { SkeletonGrid, SkeletonBiasBar } from '@/components/SkeletonCard';

function timeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  if (isNaN(date)) return '';
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StoryPage() {
  return (
    <Suspense fallback={<StoryLoading />}>
      <StoryContent />
    </Suspense>
  );
}

// ─── Story DNA ────────────────────────────────────────────────────────────────

function DriftBadge({ score }: { score: number }) {
  const cls =
    score >= 50 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
    score >= 20 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  const label = score >= 50 ? 'High drift' : score >= 20 ? 'Moderate' : 'Stable';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-semibold ${cls}`}>
      <span className="font-bold">{score}</span>
      <span className="font-normal opacity-80">{label}</span>
    </span>
  );
}

function ClaimList({ claims, color }: { claims: string[]; color: 'green' | 'red' | 'yellow' | 'blue' }) {
  if (claims.length === 0) return <p className="text-sm text-zinc-600 italic">None detected</p>;
  const styles = {
    green:  'bg-emerald-500/8 border-emerald-500/20 text-emerald-300',
    red:    'bg-rose-500/8 border-rose-500/20 text-rose-300',
    yellow: 'bg-amber-500/8 border-amber-500/20 text-amber-300',
    blue:   'bg-blue-500/8 border-blue-500/20 text-blue-300',
  };
  return (
    <ul className="space-y-2">
      {claims.map((c, i) => (
        <li key={i} className={`text-sm px-3 py-2 rounded-lg border ${styles[color]}`}>{c}</li>
      ))}
    </ul>
  );
}

function StoryDNA({ drift, topic, snapshotCount }: { drift: NarrativeDrift; topic: string; snapshotCount: number }) {
  const firstDate = new Date(drift.firstSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const prevDate  = new Date(drift.previousTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const prevTime  = new Date(drift.previousTimestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const totalChanges = drift.gainedConsensus.length + drift.lostConsensus.length + drift.newDisputed.length + drift.resolvedDisputed.length;

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-1">
              Story DNA
            </h2>
            <p className="text-zinc-500 text-sm">
              Tracking &ldquo;{topic}&rdquo; since {firstDate}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <DriftBadge score={drift.driftScore} />
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">{snapshotCount}</div>
              <div className="text-xs text-zinc-500">analyses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">{drift.daysSinceFirst}</div>
              <div className="text-xs text-zinc-500">{drift.daysSinceFirst === 1 ? 'day' : 'days'}</div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 text-xs text-zinc-600">
          <span className="shrink-0">{firstDate}</span>
          <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${
              drift.driftScore >= 50 ? 'bg-rose-500' : drift.driftScore >= 20 ? 'bg-amber-400' : 'bg-emerald-500'
            }`} style={{ width: `${Math.max(8, drift.driftScore)}%` }} />
          </div>
          <span className="shrink-0">Now</span>
        </div>
        {totalChanges === 0 && (
          <p className="mt-4 text-sm text-zinc-500 italic">
            No significant narrative changes since the previous analysis ({prevDate} {prevTime}).
          </p>
        )}
      </div>

      {totalChanges > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-4">
            <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-1.5 text-sm">
              <span className="text-emerald-400">+</span> New consensus facts
              <span className="ml-auto text-xs font-normal text-zinc-600">{drift.gainedConsensus.length}</span>
            </h3>
            <ClaimList claims={drift.gainedConsensus} color="green" />
          </div>
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-4">
            <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-1.5 text-sm">
              <span className="text-rose-400">−</span> Dropped from consensus
              <span className="ml-auto text-xs font-normal text-zinc-600">{drift.lostConsensus.length}</span>
            </h3>
            <ClaimList claims={drift.lostConsensus} color="red" />
          </div>
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-4">
            <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-1.5 text-sm">
              <span className="text-amber-400">!</span> Newly disputed
              <span className="ml-auto text-xs font-normal text-zinc-600">{drift.newDisputed.length}</span>
            </h3>
            <ClaimList claims={drift.newDisputed} color="yellow" />
          </div>
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-4">
            <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-1.5 text-sm">
              <span className="text-blue-400">✓</span> Disputes resolved
              <span className="ml-auto text-xs font-normal text-zinc-600">{drift.resolvedDisputed.length}</span>
            </h3>
            <ClaimList claims={drift.resolvedDisputed} color="blue" />
          </div>
        </div>
      )}

      <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-5">
        <h3 className="font-bold text-zinc-200 mb-4 text-sm">Narrative comparison</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-2">First · {firstDate}</div>
            <p className="text-sm text-zinc-400 leading-relaxed bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
              {drift.firstSummary}
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-400/70 uppercase tracking-wide mb-2">Latest · now</div>
            <p className="text-sm text-zinc-400 leading-relaxed bg-amber-400/[0.04] rounded-lg p-3 border border-amber-400/20">
              {drift.previousSummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryLoading() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-64 bg-white/[0.06] rounded mb-2" />
          <div className="h-5 w-48 bg-white/[0.04] rounded" />
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
  const [activeTab, setActiveTab] = useState<'sources' | 'analysis' | 'dna' | 'clusters'>('sources');
  const [notice, setNotice] = useState<string | null>(null);
  const [clusters, setClusters] = useState<any[]>([]);
  const [clusteringLoading, setClusteringLoading] = useState(false);
  const [diversity, setDiversity] = useState<{
    uniqueSources: number;
    sourceNames: string[];
    biasDistribution: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    if (!query) { router.push('/'); return; }
    fetchArticles();
  }, [query]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      setNotice(null);
      const savedLocation = typeof window !== 'undefined' ? localStorage.getItem('cruxly-location') || '' : '';
      let url = `/api/news/search?q=${encodeURIComponent(query!)}&pageSize=12`;
      if (savedLocation) url += `&location=${encodeURIComponent(savedLocation)}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch news');
      }
      const data = await response.json();
      setArticles(data.articles);
      if (data.diversity) setDiversity(data.diversity);
      if (data.notice) setNotice(data.notice);
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
        body: JSON.stringify({ articles: articles.slice(0, 6), topic: query }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze articles');
      }
      const data = await response.json();
      setAnalysis(data);
      setActiveTab(data.drift ? 'dna' : 'analysis');
      clusterArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setErrorType('analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const clusterArticles = async () => {
    if (articles.length === 0 || !query) return;
    try {
      setClusteringLoading(true);
      const response = await fetch('/api/clustering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles, query }),
      });
      if (response.ok) {
        const data = await response.json();
        setClusters(data.clusters || []);
      }
    } catch { /* clustering is optional */ } finally {
      setClusteringLoading(false);
    }
  };

  const getBiasBorderColor = (bias?: string) => {
    switch (bias) {
      case 'left': return 'border-l-blue-500';
      case 'center-left': return 'border-l-blue-400';
      case 'center': return 'border-l-zinc-500';
      case 'center-right': return 'border-l-rose-400';
      case 'right': return 'border-l-rose-500';
      default: return 'border-l-zinc-700';
    }
  };

  const getBiasDotColor = (bias?: string) => {
    switch (bias) {
      case 'left': return 'bg-blue-500';
      case 'center-left': return 'bg-blue-400';
      case 'center': return 'bg-zinc-500';
      case 'center-right': return 'bg-rose-400';
      case 'right': return 'bg-rose-500';
      default: return 'bg-zinc-700';
    }
  };

  const getBiasLabel = (bias?: string) =>
    bias?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-') || 'Unknown';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">{query}</h1>
            <p className="text-zinc-500 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Searching across 30+ sources…
            </p>
            <SkeletonBiasBar />
          </div>
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (error && errorType === 'search') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/[0.03] rounded-2xl border border-white/[0.07] p-8 text-center">
          <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-100 mb-2">Something went wrong</h2>
          <p className="text-zinc-400 mb-6 text-sm">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={fetchArticles} className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-900 rounded-lg font-semibold transition-colors text-sm">
              Try Again
            </button>
            <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 rounded-lg font-medium transition-colors text-sm">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-6 sm:py-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-1">{query}</h1>
              <p className="text-zinc-500 text-sm">
                {diversity?.uniqueSources || '…'} sources · {articles.length} articles
              </p>
            </div>
            {!analysis && articles.length > 0 && (
              <button
                onClick={analyzeArticles}
                disabled={analyzing}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-900 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shrink-0 text-sm"
              >
                {analyzing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Analyze with AI
                  </>
                )}
              </button>
            )}
          </div>

          {/* Bias spectrum bar */}
          {diversity && (
            <div className="bg-white/[0.03] rounded-lg p-3 sm:p-4 border border-white/[0.06]">
              <p className="text-xs text-zinc-600 uppercase tracking-widest font-semibold mb-2">Political spectrum</p>
              <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mb-2">
                {diversity.biasDistribution['left'] && (
                  <div className="bg-blue-600 rounded-l-full" style={{ flex: diversity.biasDistribution['left'] }} />
                )}
                {diversity.biasDistribution['center-left'] && (
                  <div className="bg-blue-400" style={{ flex: diversity.biasDistribution['center-left'] }} />
                )}
                {diversity.biasDistribution['center'] && (
                  <div className="bg-zinc-500" style={{ flex: diversity.biasDistribution['center'] }} />
                )}
                {diversity.biasDistribution['center-right'] && (
                  <div className="bg-rose-400" style={{ flex: diversity.biasDistribution['center-right'] }} />
                )}
                {diversity.biasDistribution['right'] && (
                  <div className="bg-rose-600 rounded-r-full" style={{ flex: diversity.biasDistribution['right'] }} />
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                {Object.entries(diversity.biasDistribution).map(([bias, count]) => (
                  <span key={bias} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${getBiasDotColor(bias)}`} />
                    {getBiasLabel(bias)}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Analysis error ──────────────────────────────────────────── */}
        {error && errorType === 'analysis' && (
          <div className="mb-6 bg-rose-500/8 border border-rose-500/20 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-rose-300 flex-1">Analysis failed: {error}</p>
            <button onClick={() => { setError(null); analyzeArticles(); }} className="text-xs px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg transition-colors shrink-0">
              Retry
            </button>
          </div>
        )}

        {/* ── Notice ─────────────────────────────────────────────────── */}
        {notice && (
          <div className="mb-4 bg-amber-500/8 border border-amber-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-300">{notice}</p>
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <div className="mb-6 border-b border-white/[0.06]">
          <div className="flex gap-0 -mb-px">
            {[
              { id: 'sources', label: `Sources (${articles.length})`, disabled: false },
              { id: 'analysis', label: 'AI Analysis', disabled: !analysis },
              { id: 'dna', label: 'Story DNA', disabled: !analysis?.drift },
              ...(clusters.length > 0 ? [{ id: 'clusters', label: `Stories (${clusters.length})`, disabled: false }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                disabled={tab.disabled}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-400'
                    : tab.disabled
                      ? 'border-transparent text-zinc-700 cursor-not-allowed'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
                {tab.id === 'dna' && analysis?.drift && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    analysis.drift.driftScore >= 50 ? 'bg-rose-500/20 text-rose-400' :
                    analysis.drift.driftScore >= 20 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {analysis.drift.driftScore}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sources tab ────────────────────────────────────────────── */}
        {activeTab === 'sources' && (
          <>
            {articles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-zinc-300 font-semibold mb-1">No articles found</p>
                <p className="text-zinc-600 text-sm max-w-xs">Try different keywords or a broader topic.</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-5 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-white/[0.08] hover:border-white/[0.16] rounded-lg transition-all"
                >
                  Back to home
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article, idx) => (
                <article
                  key={idx}
                  className={`bg-white/[0.03] rounded-lg border border-white/[0.06] border-l-4 ${getBiasBorderColor(article.sourceBias)} hover:bg-white/[0.05] hover:border-white/[0.1] transition-all overflow-hidden flex flex-col`}
                >
                  {article.urlToImage && (
                    <img src={article.urlToImage} alt="" className="w-full h-36 sm:h-44 object-cover opacity-80" loading="lazy" />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center flex-wrap gap-1.5 mb-3">
                      <span className="text-sm font-semibold text-zinc-300">{article.source.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getBiasDotColor(article.sourceBias)}`} />
                      <span className="text-xs text-zinc-600">{getBiasLabel(article.sourceBias)}</span>
                      {article.publishedAt && (
                        <span className="text-xs text-zinc-700 ml-auto">{timeAgo(article.publishedAt)}</span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-zinc-200 mb-2 line-clamp-3 flex-1 leading-snug">
                      {article.title}
                    </h3>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400/70 hover:text-amber-400 text-xs font-medium inline-flex items-center gap-1 transition-colors mt-2"
                    >
                      Read full article
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <AdBanner slot="SOURCES_BOTTOM_AD" format="horizontal" />
          </>
        )}

        {/* ── DNA tab ────────────────────────────────────────────────── */}
        {activeTab === 'dna' && analysis?.drift && (
          <StoryDNA drift={analysis.drift} topic={query!} snapshotCount={analysis.snapshotCount ?? 1} />
        )}

        {/* ── Clusters tab ───────────────────────────────────────────── */}
        {activeTab === 'clusters' && (
          <div className="space-y-4">
            {clusteringLoading && (
              <div className="text-center py-12 text-zinc-500 text-sm">Grouping stories…</div>
            )}
            {!clusteringLoading && clusters.map((cluster) => (
              <div key={cluster.storyId} className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-zinc-100 mb-1">{cluster.title}</h3>
                  <p className="text-sm text-zinc-500">{cluster.articles.length} sources covering this story</p>
                </div>
                <div className="mb-4 p-3 bg-blue-500/[0.06] rounded-lg border border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-400/70 uppercase tracking-wide mb-1">Common theme</p>
                  <p className="text-sm text-blue-300">{cluster.commonTheme}</p>
                </div>
                <div className="mb-4 p-3 bg-amber-500/[0.06] rounded-lg border border-amber-500/20">
                  <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wide mb-1">How it&apos;s framed differently</p>
                  <p className="text-sm text-amber-300">{cluster.framingDifference}</p>
                </div>
                {cluster.keyDifferences.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Key differences</p>
                    <ul className="space-y-1.5">
                      {cluster.keyDifferences.map((diff: string, i: number) => (
                        <li key={i} className="text-sm text-zinc-400 flex gap-2">
                          <span className="text-amber-400 shrink-0">·</span>
                          {diff}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-t border-white/[0.05] pt-3">
                  <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {cluster.articles.map((article: any, i: number) => (
                      <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.15] transition-colors">
                        {article.source} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Analysis tab ───────────────────────────────────────────── */}
        {activeTab === 'analysis' && analysis && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-5 sm:p-6">
              <h2 className="text-base font-bold text-zinc-100 mb-3">AI Summary</h2>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">{analysis.summary}</p>
            </div>

            <AdBanner slot="ANALYSIS_TOP_AD" format="horizontal" />

            {/* Consensus Facts */}
            <div className="bg-emerald-500/[0.04] rounded-xl border border-emerald-500/20 p-5 sm:p-6">
              <h2 className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Consensus Facts
              </h2>
              <p className="text-xs text-emerald-400/60 mb-4">Reported across multiple sources regardless of bias</p>
              <div className="space-y-3">
                {analysis.consensusFacts.map((fact, idx) => (
                  <div key={idx} className="bg-white/[0.03] rounded-lg p-3 sm:p-4 border border-white/[0.05]">
                    <p className="text-zinc-200 font-medium mb-2 text-sm">{fact.claim}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span>{fact.sourceCount} sources</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        fact.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
                        fact.confidence === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-zinc-500/10 text-zinc-400'
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
              <div className="bg-amber-500/[0.04] rounded-xl border border-amber-500/20 p-5 sm:p-6">
                <h2 className="text-base font-bold text-amber-400 mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Disputed Claims
                </h2>
                <p className="text-xs text-amber-400/60 mb-4">Reported by some sources but not others</p>
                <div className="space-y-3">
                  {analysis.disputedClaims.map((claim, idx) => (
                    <div key={idx} className="bg-white/[0.03] rounded-lg p-3 sm:p-4 border border-white/[0.05]">
                      <p className="text-zinc-200 font-medium mb-2 text-sm">{claim.claim}</p>
                      <p className="text-xs text-zinc-500">Reported by: {claim.sources.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source-by-Source */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.07] p-5 sm:p-6">
              <h2 className="text-base font-bold text-zinc-100 mb-4">Source Analysis</h2>
              <div className="space-y-2">
                {analysis.sourceAnalyses.map((sa, idx) => (
                  <details key={idx} className="bg-white/[0.03] rounded-lg border border-white/[0.05] group">
                    <summary className="cursor-pointer px-4 py-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-zinc-200">{sa.sourceName}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          sa.emotionalTone === 'neutral' ? 'bg-zinc-500/10 text-zinc-400' :
                          sa.emotionalTone === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                          sa.emotionalTone === 'negative' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {sa.emotionalTone}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400">{sa.score}/100</span>
                        <svg className="w-4 h-4 text-zinc-600 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </summary>
                    <div className="px-4 pb-4 space-y-3 text-sm border-t border-white/[0.05] pt-3">
                      <div>
                        <h4 className="font-semibold text-zinc-400 mb-1.5 text-xs uppercase tracking-wide">Key Facts</h4>
                        <ul className="space-y-1">
                          {sa.factualClaims.map((claim, i) => (
                            <li key={i} className="text-zinc-400 flex gap-2">
                              <span className="text-zinc-700 shrink-0">·</span>{claim}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {sa.biasIndicators.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-zinc-400 mb-1.5 text-xs uppercase tracking-wide">Bias Indicators</h4>
                          <div className="space-y-2">
                            {sa.biasIndicators.map((indicator, i) => (
                              <div key={i} className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
                                <div className="text-xs font-medium text-zinc-300 mb-0.5">
                                  {indicator.type.replace(/-/g, ' ')} · <span className="text-zinc-500">{indicator.severity}</span>
                                </div>
                                <div className="text-xs text-zinc-500">{indicator.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <a href={sa.articleUrl} target="_blank" rel="noopener noreferrer"
                        className="text-amber-400/70 hover:text-amber-400 text-xs inline-flex items-center gap-1 transition-colors">
                        Read full article
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
