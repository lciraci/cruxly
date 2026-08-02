'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/** sessionStorage key holding the page to return to after an OAuth round trip. */
export const RETURN_KEY = 'cruxly:return-to';

/**
 * OAuth leaves the app entirely, and where the provider drops the user back is
 * not entirely ours to decide: Supabase only honours `redirectTo` when it
 * matches its Redirect URL allow-list, and otherwise falls back to the
 * project's Site URL — which lands everyone on "/" no matter what `next` we
 * attached.
 *
 * So we also remember the page locally before leaving, and once a session
 * exists we finish the trip ourselves. Belt and braces: whichever of the two
 * survives, the user ends up back where they were.
 */
export default function PostAuthReturn() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;

    let target: string | null = null;
    try {
      target = sessionStorage.getItem(RETURN_KEY);
      // Consume it immediately — a leftover value must never fire twice.
      if (target) sessionStorage.removeItem(RETURN_KEY);
    } catch {
      return; // storage unavailable (private mode) — nothing to restore
    }
    if (!target) return;

    // Same-origin paths only, mirroring the guard in /auth/callback.
    if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return;

    if (target !== `${window.location.pathname}${window.location.search}`) {
      router.replace(target);
    }
  }, [user, loading, router]);

  return null;
}
