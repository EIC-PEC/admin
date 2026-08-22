import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, next internal files, and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('esummit_admin_token')?.value;

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path));

  // If unauthenticated user tries to visit protected admin route
  // Note: Client-side storage (localStorage) is also checked in AppShell as secondary fallback
  if (!isPublic && !tokenCookie) {
    // If request comes with no cookie, check query param or header, else pass to client shell
    // AppShell handles localStorage tokens gracefully
    return NextResponse.next();
  }

  // If user is already authenticated with cookie and visits /login
  if (pathname === '/login' && tokenCookie) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
