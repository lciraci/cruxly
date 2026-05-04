import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });

    const supabase = getSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    // Upsert: add 100 credits
    const { data: existing } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('user_credits')
        .update({ credits: existing.credits + 100, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('user_credits')
        .insert({ user_id: userId, credits: 100 });
    }
  }

  return NextResponse.json({ received: true });
}
