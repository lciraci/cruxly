'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HowItWorks from '@/components/HowItWorks';

interface LocalArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: { name: string; id: string | null };
  description: string | null;
}

const POPULAR_SEARCHES = [
  'Trump tariffs',
  'Gaza ceasefire',
  'AI jobs impact',
  'Fed interest rates',
  'Ukraine NATO',
  'Climate summit',
];

const TOP_CATEGORIES = [
  { label: 'Politics', query: 'US politics Congress' },
  { label: 'Economy', query: 'global economy markets' },
  { label: 'Technology', query: 'technology AI innovation' },
  { label: 'World', query: 'international world news' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [locationEditing, setLocationEditing] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'denied' | 'error'>('idle');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const router = useRouter();

  const saveLocation = (value: string) => {
    setLocation(value);
    localStorage.setItem('cruxly-location', value);
  };

  useEffect(() => {
    const saved = localStorage.getItem('cruxly-location');
    if (saved) setLocation(saved);
  }, []);

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

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: HERO - Search & Value Prop
          ══════════════════════════════════════════════════════════════ */}
      <div className="border-b border-white/[0.06]">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-black tracking-widest text-zinc-100 uppercase mb-2">
              CRUXLY<span className="text-amber-400">.</span>
            </h1>
            <div className="flex justify-center">
              <div className="h-px w-16 bg-amber-400/40" />
            </div>
          </div>

          {/* Headline & Subheading */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              See Every Side of the Story
            </h2>
            <p className="text-lg text-zinc-400">
              Search any topic and instantly compare how 30+ outlets across the political spectrum cover it—
              <span className="text-zinc-300 font-semibold"> left, center, and right</span>.
            </p>
          </div>

          {/* Search & Location */}
          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full relative">
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

            {/* Popular Searches */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-xs text-zinc-600 self-center shrink-0">Others search:</span>
              {POPULAR_SEARCHES.map((q) => (
                <button
                  key={q}
                  onClick={() => router.push(`/story?q=${encodeURIComponent(q)}`)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-100 hover:border-white/[0.16] hover:bg-white/[0.06] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Location Selector */}
            <div className="w-full flex justify-center">
              {locationEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as HTMLFormElement).elements.namedItem('loc') as HTMLInputElement;
                    const val = input.value.trim();
                    if (val) { saveLocation(val); setLocationEditing(false); }
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative">
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
                      className="pl-9 pr-3 py-2 text-sm rounded-lg border border-white/[0.1] bg-white/[0.04] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 text-sm bg-amber-400 hover:bg-amber-300 text-zinc-900 rounded-lg font-semibold transition-colors shrink-0">Save</button>
                  <button type="button" onClick={() => setLocationEditing(false)} className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300 rounded-lg border border-white/[0.06] transition-all shrink-0">Cancel</button>
                </form>
              ) : location ? (
                <div className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border border-amber-400/25 bg-amber-400/[0.07]">
                  <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-amber-200">{location}</span>
                  <button
                    onClick={() => setLocationEditing(true)}
                    className="p-1 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => saveLocation('')}
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 justify-center">
                  <button
                    onClick={detectLocation}
                    disabled={geoStatus === 'loading'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 disabled:opacity-50 transition-all text-sm font-medium"
                  >
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {geoStatus === 'loading' ? 'Detecting…' : 'Add local news'}
                  </button>
                  <button
                    onClick={() => setLocationEditing(true)}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
                  >
                    Enter city manually
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: HOW IT WORKS - Explain Value
          ══════════════════════════════════════════════════════════════ */}
      <HowItWorks />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: EXPLORE BY TOPIC - CTA
          ══════════════════════════════════════════════════════════════ */}
      <div className="border-t border-white/[0.06]">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-2xl">
            <div className="bg-gradient-to-br from-amber-400/10 to-amber-400/5 rounded-2xl border border-amber-400/20 p-8 sm:p-10 hover:border-amber-400/40 transition-all">
              <h3 className="text-2xl font-bold text-zinc-100 mb-3">Browse All Topics</h3>
              <p className="text-zinc-400 mb-6">
                Explore news organized by category. Discover how different outlets cover the same stories in Politics, Economy, Technology, and more.
              </p>
              <button
                onClick={() => router.push('/topics')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold rounded-lg transition-colors"
              >
                Explore Topics →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: QUICK CATEGORIES - Top 4
          ══════════════════════════════════════════════════════════════ */}
      <div className="border-t border-white/[0.06]">
        <div className="container mx-auto px-4 py-12 sm:py-14">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-6">
            Popular categories
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TOP_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => router.push(`/story?q=${encodeURIComponent(cat.query)}`)}
                className="group flex items-center justify-between px-5 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-400/25 transition-all text-left"
              >
                <span className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">
                  {cat.label}
                </span>
                <svg className="w-4 h-4 text-zinc-700 group-hover:text-amber-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: WAITLIST - Pro Features
          ══════════════════════════════════════════════════════════════ */}
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
              <span className="font-medium">You're on the list — we'll email you when Pro launches.</span>
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

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════════ */}
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
