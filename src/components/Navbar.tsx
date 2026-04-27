'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/story?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isHome = pathname === '/';

  return (
    <nav className="bg-[#0d1117]/95 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center shrink-0 group"
          >
            <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              Cruxly<span className="text-amber-400">.</span>
            </span>
          </button>

          {/* Desktop: Search bar (hidden on homepage) */}
          {!isHome && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any topic..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
                />
              </div>
            </form>
          )}

          {/* Desktop: Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/about" label="About" currentPath={pathname} />
            <NavLink href="/privacy" label="Privacy" currentPath={pathname} />
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile: dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {!isHome && (
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any topic..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/50"
                  />
                </div>
              </form>
            )}
            <div className="flex flex-col gap-1">
              <MobileNavLink href="/" label="Home" currentPath={pathname} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink href="/about" label="About" currentPath={pathname} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink href="/privacy" label="Privacy" currentPath={pathname} onClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, label, currentPath }: { href: string; label: string; currentPath: string }) {
  const router = useRouter();
  const isActive = currentPath === href;
  return (
    <button
      onClick={() => router.push(href)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        isActive ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  );
}

function MobileNavLink({ href, label, currentPath, onClick }: { href: string; label: string; currentPath: string; onClick: () => void }) {
  const router = useRouter();
  const isActive = currentPath === href;
  return (
    <button
      onClick={() => { router.push(href); onClick(); }}
      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
      }`}
    >
      {label}
    </button>
  );
}
