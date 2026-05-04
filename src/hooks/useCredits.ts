'use client';

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

export function useCredits(session: Session | null) {
  const [credits, setCredits] = useState<number | null>(null);

  const fetchCredits = async () => {
    if (!session) { setCredits(null); return; }
    const res = await fetch('/api/credits/balance', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCredits(data.credits);
    }
  };

  useEffect(() => { fetchCredits(); }, [session]);

  return { credits, refetch: fetchCredits };
}
