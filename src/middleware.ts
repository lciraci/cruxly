import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function queryToSlug(query: string): string {
  return query
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Redirect /story?q=X to /topic/[slug] with permanent 301 redirect
  // This preserves SEO value from old links
  if (pathname === '/story' && searchParams.has('q')) {
    const q = searchParams.get('q')!;
    const slug = queryToSlug(q);

    const response = NextResponse.redirect(new URL(`/topic/${slug}`, request.url), {
      status: 301, // Permanent redirect - important for SEO
    });
    return response;
  }
}

// Configure which routes trigger the middleware
export const config = {
  matcher: ['/story'],
};
