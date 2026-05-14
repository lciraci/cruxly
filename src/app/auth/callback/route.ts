import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.session?.user) {
      trackEvent('login', {
        method: data.session.user.app_metadata?.provider ?? 'email',
      }, data.session.user.id).catch(() => {});
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
