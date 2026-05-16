'use client';

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

interface UsageData {
  unlimited?: boolean;
  used?: number;
  limit?: number;
  freeRemaining?: number;
  paidCredits?: number;
}

interface UsageCounterProps {
  session: Session | null;
  onUpgradeClick?: () => void;
}

export default function UsageCounter({ session, onUpgradeClick }: UsageCounterProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    if (!session?.access_token) { setUsage(null); return; }
    fetch('/api/credits/usage', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUsage(data); })
      .catch(() => {});
  }, [session]);

  if (!usage || usage.unlimited) return null;

  if (usage.paidCredits && usage.paidCredits > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
        <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-semibold text-amber-400">{usage.paidCredits}</span>
        <span className="text-xs text-zinc-500">credits</span>
      </div>
    );
  }

  if (usage.freeRemaining === 0) {
    return (
      <button
        onClick={onUpgradeClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors group"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-xs text-rose-400 font-medium group-hover:text-rose-300 transition-colors">
          Limit reached · Upgrade
        </span>
      </button>
    );
  }

  const used = (usage.limit ?? 5) - (usage.freeRemaining ?? 0);
  const limit = usage.limit ?? 5;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: limit }).map((_, i) => {
          const isUsed = i < used;
          const isWarning = (usage.freeRemaining ?? 0) <= 1 && isUsed && i === used - 1;
          return (
            <span
              key={i}
              className={`block h-1.5 w-4 rounded-full transition-colors ${
                isUsed
                  ? isWarning ? 'bg-rose-400' : 'bg-amber-400'
                  : 'bg-white/[0.08]'
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs text-zinc-500">
        <span className={`font-semibold ${(usage.freeRemaining ?? 0) <= 1 ? 'text-rose-400' : 'text-zinc-300'}`}>
          {usage.freeRemaining}
        </span>
        {' '}free {(usage.freeRemaining ?? 0) === 1 ? 'analysis' : 'analyses'} left
      </span>
    </div>
  );
}
