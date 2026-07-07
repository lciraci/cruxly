import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import ReceiptsClient from './ReceiptsClient';

export const metadata: Metadata = {
  title: 'Receipt drafts — Cruxly admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export type Draft = { id: string; content: string; status: string; created_at: string };

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">Receipt drafts</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Weekly &ldquo;media bias receipts&rdquo; — copy, tweak, post. Nothing is auto-posted.
        </p>
        {children}
      </div>
    </div>
  );
}

export default async function ReceiptsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return (
      <Shell>
        <p className="text-sm text-zinc-400">
          Set the <code className="text-amber-400">CRON_SECRET</code> environment variable in Vercel to
          protect and use this page.
        </p>
      </Shell>
    );
  }

  if (key !== secret) {
    return (
      <Shell>
        <p className="text-sm text-zinc-400">
          Unauthorized. Append <code className="text-amber-400">?key=YOUR_CRON_SECRET</code> to the URL.
        </p>
      </Shell>
    );
  }

  const supabase = getSupabaseClient();
  let drafts: Draft[] = [];
  if (supabase) {
    const { data } = await supabase
      .from('receipt_drafts')
      .select('id, content, status, created_at')
      .order('created_at', { ascending: false })
      .limit(30);
    drafts = (data as Draft[]) ?? [];
  }

  return (
    <Shell>
      <ReceiptsClient drafts={drafts} />
    </Shell>
  );
}
