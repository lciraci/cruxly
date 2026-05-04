import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseClient()!;
  const { data } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({ credits: data?.credits ?? 0 });
}
