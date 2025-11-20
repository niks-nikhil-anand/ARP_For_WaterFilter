import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Role-Based Route Protection Middleware
 *
 * This middleware protects routes based on user roles by:
 * 1. Verifying the auth-token cookie
 * 2. Checking if the user has the required role for the route
 * 3. Redirecting unauthorized users to /auth
 *
 * Route Protection Rules:
 * - /admin/*     → SUPERADMIN only
 * - /shop/*      → ADMIN or SUPERADMIN
 * - /agent/*     → AGENT only
 * - /auth/*      → Public (accessible without login)
 * - All other    → Protected (requires valid token)
 */

// Define role-based route access rules
const ROUTE_ACCESS_RULES = {
  '/admin': ['SUPERADMIN'],
  '/shop': ['ADMIN', 'SUPERADMIN'],
  '/agent': ['AGENT'],
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/admin',
  '/auth/admin/signup',
  '/auth/agent',
  '/auth/user',
  '/',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
] as const;

/**
 * Check if a path matches a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Get required roles for a given pathname
 */
function getRequiredRoles(pathname: string): string[] | null {
  // Check each protected route pattern
  for (const [route, roles] of Object.entries(ROUTE_ACCESS_RULES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

/**
 * Main Middleware Function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  try {
    // Get auth-token from cookies
    const token = request.cookies.get('auth-token')?.value;

    // If no token, redirect to auth page
    if (!token) {
      console.log(`[Middleware] No token found for ${pathname}, redirecting to /auth/admin`);
      const url = request.nextUrl.clone();
      url.pathname = '/auth/admin';
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('error', 'authentication_required');
      return NextResponse.redirect(url);
    }

    // Verify JWT token
    const decoded = await verifyToken(token);

    // If token is invalid or expired, redirect to auth
    if (!decoded || !decoded.role) {
      console.log(`[Middleware] Invalid token for ${pathname}, redirecting to /auth/admin`);
      const url = request.nextUrl.clone();
      url.pathname = '/auth/admin';
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('error', 'invalid_token');

      // Clear the invalid cookie
      const response = NextResponse.redirect(url);
      response.cookies.delete('auth-token');
      return response;
    }

    // Get required roles for the current route
    const requiredRoles = getRequiredRoles(pathname);

    // If route requires specific roles, check user's role
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = decoded.role;
      const hasAccess = requiredRoles.includes(userRole);

      if (!hasAccess) {
        console.log(
          `[Middleware] Access denied for ${pathname}. User role: ${userRole}, Required: ${requiredRoles.join(', ')}`
        );

        const url = request.nextUrl.clone();
        url.pathname = '/auth/admin';
        url.searchParams.set('error', 'access_denied');
        url.searchParams.set('message', `This page requires ${requiredRoles.join(' or ')} privileges`);
        return NextResponse.redirect(url);
      }
    }

    // User is authenticated and authorized - allow request
    console.log(`[Middleware] Access granted for ${pathname} (Role: ${decoded.role})`);

    // Add user info to headers for use in pages/components
    const response = NextResponse.next();
    response.headers.set('x-user-id', decoded.id.toString());
    response.headers.set('x-user-email', decoded.email);
    response.headers.set('x-user-role', decoded.role);

    return response;
  } catch (error) {
    // If any error occurs during verification, redirect to auth
    console.error('[Middleware] Error:', error);

    const url = request.nextUrl.clone();
    url.pathname = '/auth/admin';
    url.searchParams.set('error', 'authentication_error');

    const response = NextResponse.redirect(url);
    response.cookies.delete('auth-token');
    return response;
  }
}

/**
 * Middleware Configuration
 * Specify which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes (API routes handle their own auth)
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml, /robots.txt (static files)
     */
    '/((?!api|_next/static|_next/image|_vercel|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
