import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import * as OTPAuth from 'otpauth';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const { rows } = await pool.query('SELECT totp_secret, totp_enabled FROM users WHERE id = $1', [session.user.id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = rows[0];

    if (user.totp_enabled) {
      return NextResponse.json({ error: 'MFA is already enabled' }, { status: 400 });
    }

    if (!user.totp_secret) {
      return NextResponse.json({ error: 'MFA setup not initiated' }, { status: 400 });
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'Registry Portal',
      label: session.user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.totp_secret),
    });

    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Enable MFA
    await pool.query('UPDATE users SET totp_enabled = TRUE WHERE id = $1', [session.user.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MFA verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
