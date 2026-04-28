'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface LocalArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: { name: string; id: string | null };
  description: string | null;
}

const FALLBACK_TOPICS = [
  { topic: 'Trump tariffs China', category: 'Economy' },
  { topic: 'AI regulation technology', category: 'Tech' },
  { topic: 'Ukraine war NATO', category: 'Geopolitics' },
  { topic: 'Climate change policy', category: 'Environment' },
  { topic: 'Global inflation economy', category: 'Finance' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [locationEditing, setLocationEditing] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'denied' | 'error'>('idle');
  const [localNews, setLocalNews] = useState<LocalArticle[]>([]);
  const [localNewsLoading, setLocalNewsLoading] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [trendingTopics, setTrendingTopics] = useState(FALLBACK_TOPICS);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const router = useRouter();

  const fetchLocalNews = useCallback(async (loc: string) => {
    if (!loc) return;
    setLocalNewsLoading(true);
    try {
      const res = await fetch(`/api/news/local?location=${encodeURIComponent(loc)}`);
      if (res.ok) {
        const data = await res.json();
        setLocalNews(data.articles || []);
      }
    } catch {
      // local news is optional
    } finally {
      setLocalNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('cruxly-location');
    if (saved) { setLocation(saved); fetchLocalNews(saved); }
  }, [fetchLocalNews]);

  useEffect(() => {
    fetch('/api/news/trending')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.trending?.length) setTrendingTopics(data.trending);
      })
      .catch(() => {/* keep fallback */})
      .finally(() => setTrendingLoading(false));
  }, []);

  const locationRef = useRef(location);
  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => {
    if (!location) return;
    const id = setInterval(() => fetchLocalNews(locationRef.current), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [location, fetchLocalNews]);

  const saveLocation = (value: string) => {
    setLocation(value);
    localStorage.setItem('cruxly-location', value);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const state = addr.state || '';
          const country = addr.country_code?.toUpperCase() || '';
          const locationName = [city, state, country].filter(Boolean).join(', ');
          saveLocation(locationName);
          fetchLocalNews(locationName);
          setGeoStatus('idle');
        } catch { setGeoStatus('error'); }
      },
      (err) => setGeoStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/story?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setWaitlistStatus('loading');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setWaitlistStatus(response.ok ? 'success' : 'error');
      if (response.ok) setEmail('');
    } catch { setWaitlistStatus('error'); }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">

      {/* ── Split Hero ───────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pt-16 sm:pt-24 pb-16">
        <div className="flex flex-col lg:flex-row lg:gap-0">

          {/* Left: Brand + Search */}
          <div className="flex-1 lg:pr-16 lg:border-r lg:border-white/[0.06] pb-12 lg:pb-0">
            {/* Wordmark */}
            <div className="mb-8 sm:mb-10">
              <span className="text-6xl sm:text-8xl md:text-9xl font-black tracking-widest text-zinc-100 uppercase leading-none select-none">
                CRUXLY<span className="text-amber-400">.</span>
              </span>
              <div className="mt-3 h-px w-24 bg-amber-400/40" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug mb-4 text-zinc-200">
              Stop reading one side of the story.
            </h2>
            <p className="text-base sm:text-lg text-zinc-500 max-w-md leading-relaxed mb-10">
              Type any topic, get every major outlet&apos;s take — where they agree,
              where they spin, and what none of them want you to notice.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative max-w-lg">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Trump tariffs, Ukraine war, climate bill…"
                className="w-full pl-12 pr-28 py-4 text-base rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-900 rounded-lg font-semibold transition-colors text-sm"
              >
                Search
              </button>
            </form>

            {/* Location */}
            <div className="mt-5">
              {locationEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as HTMLFormElement).elements.namedItem('loc') as HTMLInputElement;
                    const val = input.value.trim();
                    if (val) { saveLocation(val); fetchLocalNews(val); setLocationEditing(false); }
                  }}
                  className="flex items-center gap-2 max-w-lg"
                >
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      name="loc"
                      type="text"
                      defaultValue={location}
                      placeholder="City, state — e.g. Charlotte, NC"
                      autoFocus
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-white/[0.1] bg-white/[0.04] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2.5 text-sm bg-amber-400 hover:bg-amber-300 text-zinc-900 rounded-lg font-semibold transition-colors shrink-0">Save</button>
                  <button type="button" onClick={() => setLocationEditing(false)} className="px-3 py-2.5 text-sm text-zinc-500 hover:text-zinc-300 rounded-lg border border-white/[0.06] hover:border-white/[0.12] transition-all shrink-0">Cancel</button>
                </form>
              ) : location ? (
                /* Active location chip */
                <div className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07]">
                  <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-amber-200">{location}</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      onClick={() => setLocationEditing(true)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
                      aria-label="Edit location"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { saveLocation(''); setLocalNews([]); }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-400/[0.08] transition-all"
                      aria-label="Remove location"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                /* No location — two clear actions */
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={detectLocation}
                    disabled={geoStatus === 'loading'}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.16] text-zinc-300 disabled:opacity-50 transition-all text-sm font-medium"
                  >
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {geoStatus === 'loading' ? 'Detecting location…' : geoStatus === 'denied' ? 'Location access denied' : 'Add local news'}
                  </button>
                  <button
                    onClick={() => setLocationEditing(true)}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2 decoration-zinc-700 hover:decoration-zinc-500"
                  >
                    Enter city manually
                  </button>
                </div>
              )}
            </div>

            {/* Local News */}
            {(localNewsLoading || localNews.length > 0) && (
              <div className="mt-10">
                <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-4">
                  Local — {location}
                </p>
                {localNewsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse h-20 rounded-lg bg-white/[0.03] border border-white/[0.05]" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                    {localNews.map((article, idx) => (
                      <a
                        key={idx}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-medium text-amber-400/80">{article.source.name}</span>
                          {article.publishedAt && (
                            <span className="text-xs text-zinc-600 ml-auto">
                              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm text-zinc-300 group-hover:text-zinc-100 line-clamp-2 leading-snug transition-colors">
                          {article.title}
                        </h3>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Trending */}
          <div className="lg:w-[42%] lg:pl-16 pt-2">
            <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-6">
              Trending now
            </p>
            <div className="divide-y divide-white/[0.05]">
              {trendingTopics.map((t, i) => {
                const shortTitle = t.topic.length > 80
                  ? t.topic.slice(0, 77).trimEnd() + '…'
                  : t.topic;
                const cleanTitle = shortTitle.replace(/\s[-–]\s[^-–]{2,30}$/, '');
                // Extract key terms for search (named entities + long words, max 5)
                const searchQuery = (() => {
                  const words = cleanTitle.split(/\s+/).filter(w => w.replace(/[^\w]/g, '').length > 2);
                  const key = words.filter(w => /^[A-Z]/.test(w) || w.length > 5);
                  return (key.length >= 2 ? key : words).slice(0, 5).join(' ');
                })();
                return (
                  <button
                    key={i}
                    onClick={() => router.push(`/story?q=${encodeURIComponent(searchQuery)}`)}
                    className="w-full text-left py-5 group hover:bg-white/[0.02] transition-colors -mx-3 px-3 rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-xs font-mono text-zinc-700 w-6 shrink-0 tabular-nums pt-1">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-zinc-500 tracking-widest uppercase mb-1.5">
                          {t.category}
                        </p>
                        <p className="text-zinc-200 text-base sm:text-lg font-semibold leading-snug group-hover:text-white transition-colors">
                          {cleanTitle}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-zinc-700 group-hover:text-amber-400 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── Waitlist ─────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06]">
        <div className="container mx-auto px-4 py-16 sm:py-20 max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-amber-400/70 uppercase mb-4">
            Coming soon
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3">
            Cruxly Pro
          </h2>
          <p className="text-zinc-400 mb-8 text-sm sm:text-base max-w-md">
            Unlimited AI analyses, email alerts for stories you follow, PDF reports, and narrative drift tracking. Join the waitlist for 50% off at launch.
          </p>

          {waitlistStatus === 'success' ? (
            <div className="flex items-center gap-3 text-amber-400">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">You&apos;re on the list — we&apos;ll email you when Pro launches.</span>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={waitlistStatus === 'loading'}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-900 font-semibold rounded-lg transition-colors text-sm shrink-0"
              >
                {waitlistStatus === 'loading' ? '…' : 'Join waitlist'}
              </button>
            </form>
          )}
          {waitlistStatus === 'error' && (
            <p className="text-rose-400 mt-3 text-sm">Something went wrong. Try again.</p>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-zinc-600 font-bold text-sm">Cruxly<span className="text-amber-400">.</span></span>
          <p className="text-xs text-zinc-600 text-center">
            See through media bias — compare trusted sources across the political spectrum.
          </p>
        </div>
      </footer>
    </div>
  );
}
