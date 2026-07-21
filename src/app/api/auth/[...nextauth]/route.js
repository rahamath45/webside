import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { authRateLimiter } from '@/lib/rate-limit';

const handler = NextAuth(authOptions);

export async function POST(req, ctx) {
  try {
    // Only apply rate limit and Content-Type checks to the credentials callback
    if (req.url.includes('/api/auth/callback/credentials')) {
      // Finding 2: Strictly validate Content-Type header on credentials endpoint
      const contentType = req.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded')) {
        return NextResponse.json(
          { error: 'Unsupported Media Type' },
          { status: 415 }
        );
      }

      // Get IP for rate limiting
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 req.headers.get('x-real-ip') ||
                 'unknown';

      // F-14 Fix: IP-based progressive throttling
      const ipLimit = authRateLimiter.check(`ip:${ip}`);

      // F-14 Fix: Account-based limits alongside IP-based limits
      // Extract email from the request body for account-based limiting
      let accountLimit = { success: true, retryAfter: 0 };
      try {
        const clonedReq = req.clone();
        const body = await clonedReq.json();
        if (body?.email) {
          accountLimit = authRateLimiter.check(`account:${body.email.trim().toLowerCase()}`);
        }
      } catch (_) { /* ignore parse errors */ }

      // Use the stricter of the two limits
      const rateLimit = (!ipLimit.success || !accountLimit.success)
        ? (ipLimit.retryAfter >= accountLimit.retryAfter ? ipLimit : accountLimit)
        : ipLimit;

      if (!rateLimit.success) {
        return NextResponse.json(
          { error: `Too many login attempts. Please try again in ${rateLimit.retryAfter} seconds.` },
          {
            status: 429,
            headers: {
              'Retry-After': String(rateLimit.retryAfter),
            },
          }
        );
      }
    }

    return handler(req, ctx);
  } catch (error) {
    // Finding 3: Graceful error handling — never expose unhandled server errors
    console.error('NextAuth handler error:', error);
    return NextResponse.json(
      { error: 'Authentication service error' },
      { status: 500 }
    );
  }
}

export { handler as GET };

