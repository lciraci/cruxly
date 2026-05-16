import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let userId: string | null = null;

    if (token) {
      const { getSupabaseAuthClient } = await import('@/lib/supabase');
      const supabase = getSupabaseAuthClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id ?? null;
      }
    }

    const { event, data } = await request.json();
    await trackEvent(event, data, userId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
