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
      const res = await fetch(
        `/api/news/local?location=${encodeURIComponent(loc)}`
      );
      if (res.ok) {
        const data = await res.json();
        setLocalNews(data.articles || []);
      }
    } catch {
      // silently fail — local news is optional
    } finally {
      setLocalNewsLoading(false);
    }
  }, []);

  // Load saved location from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cruxly-location');
    if (saved) {
      setLocation(saved);
      fetchLocalNews(saved);
    }
  }, [fetchLocalNews]);

  // Auto-refresh local news every 5 minutes
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
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
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
          const parts = [city, state, country].filter(Boolean);
          const locationName = parts.join(', ');
          saveLocation(locationName);
          fetchLocalNews(locationName);
          setGeoStatus('idle');
        } catch {
          setGeoStatus('error');
        }
      },
      (err) => {
        setGeoStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/story?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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

      if (response.ok) {
        setWaitlistStatus('success');
        setEmail('');
      } else {
        setWaitlistStatus('error');
      }
    } catch (_err) {
      setWaitlistStatus('error');
    }
  };

  const trendingTopics = [
    {
      topic: 'Trump tariffs China',
      description: 'Trade war escalation and economic impact across global markets',
      category: 'Economy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: {
        border: 'border-l-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
        tag: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
        hover: 'hover:border-l-amber-400',
      },
      featured: true,
    },
    {
      topic: 'AI regulation technology',
      description: 'Global AI policy and safety frameworks',
      category: 'Technology',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: {
        border: 'border-l-violet-500',
        bg: 'bg-violet-50 dark:bg-violet-950/20',
        icon: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
        tag: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
        hover: 'hover:border-l-violet-400',
      },
    },
    {
      topic: 'Climate change policy',
      description: 'Environmental legislation and agreements',
      category: 'Environment',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: {
        border: 'border-l-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        tag: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
        hover: 'hover:border-l-emerald-400',
      },
    },
    {
      topic: 'Ukraine war NATO',
      description: 'Conflict developments and alliance dynamics',
      category: 'Geopolitics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: {
        border: 'border-l-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-950/20',
        icon: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
        tag: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
        hover: 'hover:border-l-rose-400',
      },
    },
    {
      topic: 'Global inflation economy',
      description: 'Cost of living and monetary policy',
      category: 'Finance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: {
        border: 'border-l-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-950/20',
        icon: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
        tag: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
        hover: 'hover:border-l-indigo-400',
      },
    },
  ];

  const handleTrendingClick = (topic: string) => {
    router.push(`/story?q=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Hero */}
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            The crux of the story.
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto px-2">
            Compare news from multiple sources across the political spectrum.
            AI-powered fact extraction and bias detection.
          </p>
        </header>

        {/* Search */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16 px-2">
          <form onSubmit={handleSearch} className="relative">
            <svg
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any news topic..."
              className="w-full pl-12 sm:pl-14 pr-24 sm:pr-28 py-3.5 sm:py-4 text-base sm:text-lg rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors text-sm sm:text-base"
            >
              Search
            </button>
          </form>

          {/* Location selector */}
          <div className="mt-4 sm:mt-5">
            {locationEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).elements.namedItem('loc') as HTMLInputElement;
                  const val = input.value.trim();
                  if (val) {
                    saveLocation(val);
                    fetchLocalNews(val);
                    setLocationEditing(false);
                  }
                }}
                className="flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  name="loc"
                  type="text"
                  defaultValue={location}
                  placeholder="Enter city, e.g. Charlotte, NC"
                  autoFocus
                  className="px-4 py-2.5 text-sm sm:text-base rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 w-64"
                />
                <button type="submit" className="px-5 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-colors">
                  Go
                </button>
                <button
                  type="button"
                  onClick={() => setLocationEditing(false)}
                  className="px-3 py-2.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : location ? (
              <div className="flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-white/10 dark:bg-slate-800/60 border border-slate-200/30 dark:border-slate-700/50 backdrop-blur-sm">
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-base font-medium text-slate-700 dark:text-slate-200">
                  {location}
                </span>
                <button
                  onClick={() => setLocationEditing(true)}
                  className="text-sm text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  title="Change location"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => { saveLocation(''); setGeoStatus('idle'); setLocalNews([]); }}
                  className="text-sm text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove location"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={detectLocation}
                  disabled={geoStatus === 'loading'}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {geoStatus === 'loading'
                    ? 'Detecting...'
                    : geoStatus === 'denied'
                      ? 'Location denied — check browser settings'
                      : geoStatus === 'error'
                        ? 'Try again'
                        : 'Detect my location'}
                </button>
                <span className="text-slate-400 text-sm">or</span>
                <button
                  onClick={() => setLocationEditing(true)}
                  className="text-sm sm:text-base text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  enter it manually
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Local News */}
        {(localNewsLoading || localNews.length > 0) && (
          <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
            <div className="flex items-center gap-2 mb-4 sm:mb-6 px-1">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Local News
              </h2>
            </div>

            {localNewsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mt-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {localNews.map((article, idx) => (
                  <a
                    key={idx}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-0.5 p-4 flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                        {article.source.name}
                      </span>
                      {article.publishedAt && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                          {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-blue-600">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
                        {article.description}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trending Topics */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 px-1">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Trending Now
            </h2>
          </div>

          {/* Featured topic — first card larger */}
          {trendingTopics.filter(t => t.featured).map(({ topic, description, category, icon, color }) => (
            <button
              key={topic}
              onClick={() => handleTrendingClick(topic)}
              className={`w-full mb-4 p-5 sm:p-7 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 border-l-4 ${color.border} ${color.hover} ${color.bg} border border-slate-200/60 dark:border-slate-700/60 text-left group`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${color.icon} flex items-center justify-center shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color.tag}`}>
                      {category}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {topic}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                    {description}
                  </p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0 mt-1 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}

          {/* Rest of topics in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {trendingTopics.filter(t => !t.featured).map(({ topic, description, category, icon, color }) => (
              <button
                key={topic}
                onClick={() => handleTrendingClick(topic)}
                className={`p-4 sm:p-5 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 border-l-4 ${color.border} ${color.hover} ${color.bg} border border-slate-200/60 dark:border-slate-700/60 text-left group`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${color.icon} flex items-center justify-center shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color.tag}`}>
                      {category}
                    </span>
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 mt-1.5 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {topic}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Multi-Source</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Compare coverage from left, center, and right-leaning sources
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">AI Analysis</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Fact extraction, bias detection, and source scoring
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Verified Truth</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Identify consensus facts and disputed claims
            </p>
          </div>
        </div>

        {/* Pro Waitlist */}
        <div className="max-w-2xl mx-auto mt-16 sm:mt-24">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-center text-white shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Cruxly Pro is coming
            </h2>
            <p className="text-blue-100 mb-6 text-sm sm:text-base">
              Unlimited AI analyses, email alerts, PDF reports, and more.
              Join the waitlist to get early access and 50% off.
            </p>

            {waitlistStatus === 'success' ? (
              <div className="bg-white/20 rounded-lg p-4">
                <p className="font-semibold">You&apos;re on the list!</p>
                <p className="text-sm text-blue-100 mt-1">We&apos;ll email you when Pro launches.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === 'loading'}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                >
                  {waitlistStatus === 'loading' ? '...' : 'Join'}
                </button>
              </form>
            )}
            {waitlistStatus === 'error' && (
              <p className="text-red-200 mt-3 text-sm">Something went wrong. Try again.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 sm:mt-24 text-center text-slate-500 dark:text-slate-400 space-y-2 pb-8">
          <p className="text-sm sm:text-base px-4">
            Cruxly helps you see through media bias by comparing trusted sources across the political spectrum.
          </p>
        </footer>
      </div>
    </div>
  );
}
