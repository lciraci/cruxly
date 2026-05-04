'use client';

import { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'verify'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    if (tab === 'signin') {
      const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setStatus('error'); }
      else { onSuccess(); onClose(); }
    } else {
      const { error } = await supabaseBrowser.auth.signUp({ email, password });
      if (error) { setError(error.message); setStatus('error'); }
      else { setStatus('verify'); }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-white/[0.10] rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors">
          <X size={18} />
        </button>

        {status === 'verify' ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
              <Mail size={20} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100 mb-2">Check your email</h2>
            <p className="text-sm text-zinc-400">We sent a confirmation link to <span className="text-zinc-200">{email}</span>. Click it to activate your account and get your free analysis.</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-zinc-100 mb-1">
              {tab === 'signin' ? 'Sign in to Cruxly' : 'Create your account'}
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              {tab === 'signin' ? 'Welcome back.' : 'Get 1 free Cruxly Analysis on signup.'}
            </p>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/[0.04] rounded-lg mb-5">
              {(['signin', 'signup'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    tab === t ? 'bg-amber-400 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  required type="email" placeholder="Email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 transition-colors"
                />
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  required type="password" placeholder="Password" minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 transition-colors"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit" disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-900 font-semibold rounded-lg transition-colors text-sm"
              >
                {status === 'loading' && <Loader2 size={14} className="animate-spin" />}
                {tab === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
