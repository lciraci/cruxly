'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, session, loading, signOut } = useAuth();
  const { credits, refetch } = useCredits(session);

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
    <>
      <nav className="bg-[#0d1117]/95 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button onClick={() => router.push('/')} className="flex items-center shrink-0 group">
              <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                Cruxly<span className="text-amber-400">.</span>
              </span>
            </button>

            {/* Desktop: Search bar */}
            {!isHome && (
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search any topic..."
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
                  />
                </div>
              </form>
            )}

            {/* Desktop: Nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/about" label="About" currentPath={pathname} />
              <NavLink href="/privacy" label="Privacy" currentPath={pathname} />

              {!loading && (
                <>
                  {user ? (
                    <div className="relative ml-2 flex items-center gap-2">
                      {/* Credits badge */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-400">
                        <Zap size={11} />
                        {credits ?? '—'}
                      </div>
                      {/* User avatar */}
                      <button
                        onClick={() => setShowUserMenu(v => !v)}
                        className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-xs font-bold text-amber-400 hover:bg-amber-400/30 transition-colors"
                      >
                        {user.email?.[0].toUpperCase()}
                      </button>
                      {showUserMenu && (
                        <div className="absolute right-0 top-10 w-44 bg-zinc-900 border border-white/[0.10] rounded-xl shadow-xl py-1 z-50">
                          <p className="px-3 py-2 text-xs text-zinc-500 truncate">{user.email}</p>
                          <div className="h-px bg-white/[0.06] my-1" />
                          <button
                            onClick={() => { signOut(); setShowUserMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
                          >
                            <LogOut size={13} /> Sign out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAuth(true)}
                      className="ml-2 px-3 py-1.5 text-sm font-semibold rounded-lg border border-amber-400/40 text-amber-400 hover:bg-amber-400/10 transition-colors"
                    >
                      Sign in
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3">
              {!isHome && (
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
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
                {user ? (
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-amber-400 hover:bg-amber-400/10 transition-colors"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { refetch(); }}
        />
      )}
    </>
  );
}

function NavLink({ href, label, currentPath }: { href: string; label: string; currentPath: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        currentPath === href ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  );
}

function MobileNavLink({ href, label, currentPath, onClick }: { href: string; label: string; currentPath: string; onClick: () => void }) {
  const router = useRouter();
  return (
    <button
      onClick={() => { router.push(href); onClick(); }}
      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        currentPath === href ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
      }`}
    >
      {label}
    </button>
  );
}
