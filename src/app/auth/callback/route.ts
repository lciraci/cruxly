import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';

/**
 * `next` comes from the query string, so it must never be able to send a user
 * off-site. A prefix check alone is not enough: URL parsing strips tab/CR/LF,
 * so "/\t/evil.com" would survive one and then resolve to https://evil.com.
 * Strip those first, then resolve against our own origin and keep the result
 * only if it actually stayed on it.
 */
function safeNext(raw: string | null, origin: string): string {
  if (!raw) return '/';
  const cleaned = raw.replace(/[\t\n\r]/g, '');
  if (!cleaned.startsWith('/') || cleaned.startsWith('//') || cleaned.startsWith('/\\')) {
    return '/';
  }
  try {
    const url = new URL(cleaned, origin);
    return url.origin === origin ? `${url.pathname}${url.search}` : '/';
  } catch {
    return '/';
  }
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'), origin);

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

  return NextResponse.redirect(new URL(next, origin));
}
