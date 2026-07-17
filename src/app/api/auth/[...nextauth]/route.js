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

      const rateLimit = authRateLimiter.check(ip);

      if (!rateLimit.success) {
        // Finding 1 (prev): Rate Limiting on Auth Endpoints
        return NextResponse.json(
          { error: 'Too many login attempts, please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000)),
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

