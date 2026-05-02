import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { name, email, type, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  }

  const { error } = await supabase
    .from('contact_messages')
    .insert({ name: name.trim(), email: email.trim(), type, message: message.trim() });

  if (error) {
    return NextResponse.json({ error: 'Failed to save message.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
