'use client';

import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabaseBrowser.auth.signOut();

  return { user, session, loading, signOut };
}
