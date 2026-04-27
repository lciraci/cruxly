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

const trendingTopics = [
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

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pt-16 sm:pt-24 pb-12 sm:pb-16">
        <header className="mb-10 sm:mb-14">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="block text-zinc-100">One story.</span>
            <span className="block text-amber-400">Every side.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-md leading-relaxed">
            Search any topic and instantly see how different outlets frame it,
            what facts they share, and what they&apos;re each leaving out.
          </p>
        </header>

        {/* ── Search ───────────────────────────────────────────────────── */}
        <div className="max-w-2xl mb-16 sm:mb-20">
          <form onSubmit={handleSearch} className="relative">
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
          <div className="mt-4">
            {locationEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).elements.namedItem('loc') as HTMLInputElement;
                  const val = input.value.trim();
                  if (val) { saveLocation(val); fetchLocalNews(val); setLocationEditing(false); }
                }}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  name="loc"
                  type="text"
                  defaultValue={location}
                  placeholder="Enter city, e.g. Charlotte, NC"
                  autoFocus
                  className="px-3 py-2 text-sm rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 w-56"
                />
                <button type="submit" className="px-4 py-2 text-sm bg-amber-400 hover:bg-amber-300 text-zinc-900 rounded-lg font-medium transition-colors">Go</button>
                <button type="button" onClick={() => setLocationEditing(false)} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
              </form>
            ) : location ? (
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-zinc-300">{location}</span>
                <button onClick={() => setLocationEditing(true)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">change</button>
                <button onClick={() => { saveLocation(''); setLocalNews([]); }} className="text-xs text-zinc-500 hover:text-rose-400 transition-colors">remove</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={detectLocation}
                  disabled={geoStatus === 'loading'}
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {geoStatus === 'loading' ? 'Detecting…' : geoStatus === 'denied' ? 'Location denied' : 'Add local news'}
                </button>
                <span className="text-zinc-700 text-xs">·</span>
                <button onClick={() => setLocationEditing(true)} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">enter manually</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Local News ───────────────────────────────────────────────── */}
      {(localNewsLoading || localNews.length > 0) && (
        <div className="container mx-auto px-4 pb-14">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-5">
            Local — {location}
          </p>
          {localNewsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse h-20 rounded-lg bg-white/[0.03] border border-white/[0.05]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
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

      {/* ── Trending ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pb-20">
        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-5">
          Trending now
        </p>
        <div className="max-w-2xl divide-y divide-white/[0.04]">
          {trendingTopics.map((t, i) => (
            <button
              key={t.topic}
              onClick={() => router.push(`/story?q=${encodeURIComponent(t.topic)}`)}
              className="w-full flex items-center gap-5 py-4 text-left group hover:bg-white/[0.02] transition-colors px-3 -mx-3 rounded-lg"
            >
              <span className="text-xs font-mono text-zinc-700 w-5 shrink-0 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded border border-white/[0.08] text-zinc-400 shrink-0 tracking-wide">
                {t.category.toUpperCase()}
              </span>
              <span className="text-zinc-300 text-sm sm:text-base group-hover:text-zinc-100 transition-colors flex-1 font-medium">
                {t.topic}
              </span>
              <svg className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
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
