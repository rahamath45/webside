import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authRateLimiter } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = authRateLimiter.check(`ip:${ip}`);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { message: `Too many requests. Please try again in ${rateLimit.retryAfter} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }

    const { email, otp } = await request.json();

    if (!email || !otp || otp.length !== 6) {
      return NextResponse.json({ message: 'Invalid email or OTP.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check pending_users table
    const result = await pool.query(
      'SELECT * FROM pending_users WHERE email = $1 AND otp = $2',
      [normalizedEmail, otp]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Invalid or expired OTP.' }, { status: 400 });
    }

    const pendingUser = result.rows[0];

    // Check if expired
    if (new Date() > new Date(pendingUser.expires_at)) {
      await pool.query('DELETE FROM pending_users WHERE email = $1', [normalizedEmail]);
      return NextResponse.json({ message: 'OTP has expired. Please sign up again.' }, { status: 400 });
    }

    // Move to main users table
    await pool.query('BEGIN');
    try {
      await pool.query(
        `INSERT INTO users (name, email, password, email_verified) 
         VALUES ($1, $2, $3, TRUE) 
         ON CONFLICT (email) DO NOTHING`,
        [pendingUser.name, pendingUser.email, pendingUser.password]
      );
      
      await pool.query('DELETE FROM pending_users WHERE email = $1', [normalizedEmail]);
      await pool.query('COMMIT');
    } catch (e) {
      await pool.query('ROLLBACK');
      throw e;
    }

    return NextResponse.json({ message: 'Account verified and created successfully.' }, { status: 200 });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
