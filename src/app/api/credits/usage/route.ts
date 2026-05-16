import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuthClient, getSupabaseClient } from '@/lib/supabase';

const ADMIN_EMAIL = 'lucio.ciraci94@gmail.com';
const FREE_LIMIT = 5;

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const supabase = getSupabaseAuthClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (user.email === ADMIN_EMAIL) {
    return NextResponse.json({ unlimited: true });
  }

  const db = getSupabaseClient();
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

  const [{ count: used }, { data: creditsRow }] = await Promise.all([
    db.from('user_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event', 'analysis'),
    db.from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single(),
  ]);

  const usedCount = used ?? 0;
  const paidCredits = creditsRow?.credits ?? 0;
  const freeRemaining = Math.max(0, FREE_LIMIT - usedCount);

  return NextResponse.json({
    unlimited: false,
    used: usedCount,
    limit: FREE_LIMIT,
    freeRemaining,
    paidCredits,
  });
}
