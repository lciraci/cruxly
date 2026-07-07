'use client';

import { useState } from 'react';
import type { Draft } from './page';

export default function ReceiptsClient({ drafts }: { drafts: Draft[] }) {
  if (drafts.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No drafts yet. The cron runs weekly — or hit{' '}
        <code className="text-amber-400">/api/cron/receipts</code> to generate one now.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {drafts.map((d) => (
        <DraftCard key={d.id} draft={d} />
      ))}
    </div>
  );
}

function DraftCard({ draft }: { draft: Draft }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const date = new Date(draft.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500">
          {date} · {draft.status}
        </span>
        <button
          onClick={copy}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-sm text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
        {draft.content}
      </pre>
    </div>
  );
}
