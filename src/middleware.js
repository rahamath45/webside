import { NextResponse } from 'next/server';

/**
 * Next.js Middleware — Security Headers
 *
 * Injects security headers on EVERY response to guarantee consistency
 * across all route types (pages, API routes, static assets).
 *
 * Fixes:
 *   Finding 5  — Server/technology disclosure suppression
 *   Finding 6  — X-Content-Type-Options consistent across all routes
 *   Finding 7  — X-Frame-Options consistent across all routes
 *   Note B     — Cache-Control directives
 *   Note C     — Clear-Site-Data on signout
 */
export function middleware(request) {
  const response = NextResponse.next();

  // ── Consistent Security Headers (Findings 5, 6, 7) ──
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Finding 5: Suppress server/technology disclosure
  response.headers.set('Server', 'web');
  response.headers.delete('X-Powered-By');

  // ── Cache-Control (Note B) ──
  // Prevent sensitive pages from being cached by proxies or browsers
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // ── Clear-Site-Data on signout (Note C) ──
  // Instructs the browser to purge caches, cookies, and storage on logout
  if (request.nextUrl.pathname === '/api/auth/signout') {
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
  }

  return response;
}

// Apply middleware to all routes for consistent header coverage
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files — served with immutable cache)
     * - _next/image (image optimization files)
     * - favicon.ico (browser requests)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
