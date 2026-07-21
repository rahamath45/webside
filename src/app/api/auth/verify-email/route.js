import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/verify-email?error=missing_token', request.url));
    }

    // Verify token
    const { rows } = await pool.query(
      `SELECT id, email_verified, verification_token_expires 
       FROM users 
       WHERE verification_token = $1`,
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid_token', request.url));
    }

    const user = rows[0];

    if (user.email_verified) {
      return NextResponse.redirect(new URL('/verify-email?status=already_verified', request.url));
    }

    if (new Date() > new Date(user.verification_token_expires)) {
      return NextResponse.redirect(new URL('/verify-email?error=expired_token', request.url));
    }

    // Mark as verified and clear token
    await pool.query(
      `UPDATE users 
       SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL 
       WHERE id = $1`,
      [user.id]
    );

    return NextResponse.redirect(new URL('/verify-email?status=success', request.url));

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/verify-email?error=server_error', request.url));
  }
}
