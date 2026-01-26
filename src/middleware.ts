import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to enforce authentication on admin routes.
 *
 * - Admin routes require Microsoft Easy Auth (checked via x-ms-client-principal header)
 * - Portal routes are unauthenticated at platform level (JWT validation in route handlers)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Portal routes - allow through (JWT auth handled in route handlers)
  if (pathname.startsWith('/portal') || pathname.startsWith('/api/portal')) {
    return NextResponse.next();
  }

  // Static assets and Next.js internals - allow through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Easy Auth endpoints - allow through
  if (pathname.startsWith('/.auth')) {
    return NextResponse.next();
  }

  // Admin routes - require Easy Auth
  const isAdminRoute =
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/clients') ||
    pathname.startsWith('/timesheets') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/api/');

  if (isAdminRoute) {
    // Check for Easy Auth header (set by Azure when user is authenticated)
    const principal = request.headers.get('x-ms-client-principal');

    if (!principal) {
      // Not authenticated - redirect to Easy Auth login
      const loginUrl = new URL('/.auth/login/aad', request.url);
      loginUrl.searchParams.set('post_login_redirect_uri', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
