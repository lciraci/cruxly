'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign in state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siShowPw, setSiShowPw] = useState(false);

  // Sign up state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suEmailConfirm, setSuEmailConfirm] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suPasswordConfirm, setSuPasswordConfirm] = useState('');
  const [suShowPw, setSuShowPw] = useState(false);

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'verify'>('idle');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email: siEmail, password: siPassword });
    if (error) { setError(error.message); setStatus('error'); }
    else { onSuccess(); onClose(); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (suEmail !== suEmailConfirm) { setError('Emails do not match.'); return; }
    if (suPassword !== suPasswordConfirm) { setError('Passwords do not match.'); return; }
    if (suPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setStatus('loading');
    const { error } = await supabaseBrowser.auth.signUp({
      email: suEmail,
      password: suPassword,
      options: { data: { full_name: suName.trim() } },
    });
    if (error) { setError(error.message); setStatus('error'); }
    else { setStatus('verify'); }
  };

  const switchTab = (t: 'signin' | 'signup') => {
    setTab(t);
    setError('');
    setStatus('idle');
  };

  if (status === 'verify') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-sm bg-zinc-900 border border-white/[0.10] rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-5">
            <Mail size={22} className="text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-zinc-100 mb-2">Check your inbox</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We sent a confirmation link to <span className="text-zinc-200 font-medium">{suEmail}</span>.
            Click it to activate your account and claim your free analysis.
          </p>
          <button onClick={onClose} className="mt-6 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-white/[0.10] rounded-2xl shadow-2xl overflow-hidden">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors z-10">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-zinc-100">
            {tab === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {tab === 'signin' ? 'Sign in to access Cruxly Analysis.' : 'Get 1 free Cruxly Analysis on signup.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-1 p-1 bg-white/[0.04] rounded-lg">
            {(['signin', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t ? 'bg-amber-400 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.07] text-sm font-medium text-zinc-200 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* ── SIGN IN FORM ── */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <Field icon={<Mail size={14} />} type="email" placeholder="Email" value={siEmail} onChange={setSiEmail} />
              <PasswordField
                placeholder="Password"
                value={siPassword} onChange={setSiPassword}
                show={siShowPw} onToggle={() => setSiShowPw(v => !v)}
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <SubmitButton loading={status === 'loading'} label="Sign in" />
            </form>
          )}

          {/* ── SIGN UP FORM ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <Field icon={<User size={14} />} type="text" placeholder="Full name" value={suName} onChange={setSuName} required />
              <Field icon={<Mail size={14} />} type="email" placeholder="Email" value={suEmail} onChange={setSuEmail} />
              <Field icon={<Mail size={14} />} type="email" placeholder="Confirm email" value={suEmailConfirm} onChange={setSuEmailConfirm} />
              <PasswordField
                placeholder="Password (min. 6 characters)"
                value={suPassword} onChange={setSuPassword}
                show={suShowPw} onToggle={() => setSuShowPw(v => !v)}
              />
              <PasswordField
                placeholder="Confirm password"
                value={suPasswordConfirm} onChange={setSuPasswordConfirm}
                show={suShowPw} onToggle={() => setSuShowPw(v => !v)}
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <SubmitButton loading={status === 'loading'} label="Create account" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, type, placeholder, value, onChange, required = true }: {
  icon: React.ReactNode; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</span>
      <input
        required={required} type={type} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 transition-colors"
      />
    </div>
  );
}

function PasswordField({ placeholder, value, onChange, show, onToggle }: {
  placeholder: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void;
}) {
  return (
    <div className="relative">
      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input
        required type={show ? 'text' : 'password'} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)} minLength={6}
        className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 transition-colors"
      />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit" disabled={loading}
      className="flex items-center justify-center gap-2 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-900 font-semibold rounded-lg transition-colors text-sm"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {loading ? 'Please wait…' : label}
    </button>
  );
}
