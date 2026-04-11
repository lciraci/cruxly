'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const router = useRouter();

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
    'Trump tariffs China',
    'AI regulation technology',
    'Climate change policy',
    'Ukraine war NATO',
    'Global inflation economy',
  ];

  const handleTrendingClick = (topic: string) => {
    router.push(`/story?q=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cruxly
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">
            The crux of the story.
          </p>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Compare news from multiple sources across the political spectrum.
            AI-powered fact extraction and bias detection.
          </p>
        </header>

        {/* Search */}
        <div className="max-w-3xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any news topic..."
              className="w-full px-6 py-4 text-lg rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Trending Topics */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">
            Trending Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTrendingClick(topic)}
                className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700 text-left group"
              >
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {topic}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Click to analyze coverage across sources
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Multi-Source</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Compare coverage from left, center, and right-leaning sources
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">AI Analysis</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Fact extraction, bias detection, and source scoring
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Verified Truth</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Identify consensus facts and disputed claims
            </p>
          </div>
        </div>

        {/* Pro Waitlist */}
        <div className="max-w-2xl mx-auto mt-24">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-2">
              Cruxly Pro is coming
            </h2>
            <p className="text-blue-100 mb-6">
              Unlimited AI analyses, email alerts, PDF reports, and more.
              Join the waitlist to get early access and 50% off.
            </p>

            {waitlistStatus === 'success' ? (
              <div className="bg-white/20 rounded-lg p-4">
                <p className="font-semibold">You're on the list!</p>
                <p className="text-sm text-blue-100 mt-1">We'll email you when Pro launches.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="flex gap-3 max-w-md mx-auto">
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
        <footer className="mt-24 text-center text-slate-500 dark:text-slate-400 space-y-2">
          <p>
            Cruxly helps you see through media bias by comparing trusted sources across the political spectrum.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="/about" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              About
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
