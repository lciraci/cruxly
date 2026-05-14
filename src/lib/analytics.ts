import { getSupabaseClient } from './supabase';

type EventType = 'search' | 'analysis' | 'login';

export async function trackEvent(
  event: EventType,
  data: Record<string, unknown>,
  userId?: string | null
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.from('user_events').insert({
      user_id: userId ?? null,
      event,
      data,
    });
  } catch {
    // Analytics must never break the main flow
  }
}
