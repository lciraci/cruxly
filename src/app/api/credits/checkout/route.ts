import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAuthClient } from '@/lib/supabase';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const supabase = getSupabaseAuthClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
      maxNetworkRetries: 0,
    });

    // Derive base URL from the incoming request so it's always correct regardless of env vars
    const reqOrigin = new URL(req.url).origin;
    const appUrl = reqOrigin.includes('localhost')
      ? (process.env.NEXT_PUBLIC_APP_URL || 'https://cruxly-woad.vercel.app')
      : reqOrigin;

    console.log('Checkout: appUrl =', appUrl, '| key prefix =', process.env.STRIPE_SECRET_KEY?.slice(0, 12));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: 999,
          product_data: {
            name: '100 Cruxly Analyses',
            description: 'Pay-as-you-go access to Cruxly AI analysis. 100 credits, never expire.',
          },
        },
        quantity: 1,
      }],
      metadata: { userId: user.id },
      success_url: `${appUrl}/?credits=success`,
      cancel_url: `${appUrl}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    const stripeErr = err as { type?: string; code?: string; statusCode?: number; message?: string };
    return NextResponse.json(
      {
        error: stripeErr.message ?? 'Checkout failed',
        stripeType: stripeErr.type,
        stripeCode: stripeErr.code,
        stripeStatus: stripeErr.statusCode,
      },
      { status: 500 }
    );
  }
}
