/**
 * Next.js Middleware for Route Protection
 * =======================================
 *
 * BEST PRACTICE: Use middleware for route protection because:
 * - Runs at the edge (faster than server components)
 * - Executes before rendering (prevents flash of protected content)
 * - Can protect multiple routes at once
 * - Works with both server and client components
 *
 * NOTE: Middleware runs in Edge Runtime, which doesn't support Prisma.
 * We check for the session cookie directly instead of calling auth API.
 * Full session validation happens in server components/pages.
 *
 * This middleware protects all routes that require authentication.
 * Routes under (authenticated) route group are automatically protected.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for better-auth session cookie
  // Better-auth uses 'better-auth.session_token' as the default cookie name
  // Check for the cookie (better-auth may use different naming in some versions)
  const sessionToken =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('better-auth_session_token') ||
    Array.from(request.cookies.getAll()).find(
      (cookie) =>
        cookie.name.includes('better-auth') && cookie.name.includes('session'),
    );

  // Define protected routes
  const protectedRoutes = ['/notes'];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Define public auth routes (login, signup, etc.)
  const authRoutes = ['/login', '/signup'];

  // If accessing protected route without auth cookie, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter so user can return after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user (has session cookie) tries to access auth pages, redirect to default protected route
  if (authRoutes.some((route) => pathname.startsWith(route)) && sessionToken) {
    // Check if there's a redirect param, otherwise go to notes
    const redirect = request.nextUrl.searchParams.get('redirect');
    if (redirect && redirect.startsWith('/')) {
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    return NextResponse.redirect(new URL('/notes', request.url));
  }

  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (but we can add them if needed)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
