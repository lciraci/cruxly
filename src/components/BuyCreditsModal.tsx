'use client';

import { useState } from 'react';
import { X, Zap, Loader2 } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface BuyCreditsModalProps {
  session: Session;
  onClose: () => void;
}

export default function BuyCreditsModal({ session, onClose }: BuyCreditsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/credits/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-white/[0.10] rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors">
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4">
          <Zap size={20} className="text-amber-400" />
        </div>

        <h2 className="text-lg font-bold text-zinc-100 mb-1">Get more analyses</h2>
        <p className="text-sm text-zinc-400 mb-6">You&apos;re out of credits. Top up to keep going.</p>

        <div className="flex items-center justify-between p-4 rounded-xl border border-amber-400/20 bg-amber-400/5 mb-5">
          <div>
            <p className="font-bold text-zinc-100">100 Cruxly Analyses</p>
            <p className="text-xs text-zinc-400 mt-0.5">Pay once, use anytime</p>
          </div>
          <span className="text-xl font-black text-amber-400">$9.99</span>
        </div>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <button
          onClick={handleBuy} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-900 font-bold rounded-xl transition-colors"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? 'Redirecting…' : 'Buy 100 credits — $9.99'}
        </button>

        <p className="text-center text-xs text-zinc-600 mt-3">Powered by Stripe · Secure checkout</p>
      </div>
    </div>
  );
}
