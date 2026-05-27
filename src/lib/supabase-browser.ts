import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _instance: SupabaseClient | null = null;

export const supabaseBrowser = (() => {
  if (typeof window === 'undefined') return null as any;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null as any;
  if (!_instance) _instance = createClient(url, key);
  return _instance;
})();
