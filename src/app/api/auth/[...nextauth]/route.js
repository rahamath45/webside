import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { authRateLimiter } from '@/lib/rate-limit';

const handler = NextAuth(authOptions);

export async function POST(req, ctx) {
  // Only rate limit the credentials callback endpoint
  if (req.url.includes('/api/auth/callback/credentials')) {
    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
               
    const rateLimit = authRateLimiter.check(ip);
    
    if (!rateLimit.success) {
      // Finding 3: Rate Limiting on Auth Endpoints
      return NextResponse.json(
        { error: 'Too many login attempts, please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000) } }
      );
    }
  }
  
  return handler(req, ctx);
}

export { handler as GET };
