import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import * as OTPAuth from 'otpauth';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await pool.query('SELECT totp_enabled FROM users WHERE id = $1', [session.user.id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (rows[0].totp_enabled) {
      return NextResponse.json({ error: 'MFA is already enabled' }, { status: 400 });
    }

    // Generate a secure secret
    const secret = new OTPAuth.Secret({ size: 20 });
    const secretBase32 = secret.base32;

    const totp = new OTPAuth.TOTP({
      issuer: 'Registry Portal',
      label: session.user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });

    const uri = totp.toString();

    // Generate 8 backup codes
    const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex'));

    // Temporarily store the secret in the database, but don't enable it until verified
    await pool.query(
      'UPDATE users SET totp_secret = $1, totp_backup_codes = $2 WHERE id = $3',
      [secretBase32, backupCodes, session.user.id]
    );

    return NextResponse.json({
      secret: secretBase32,
      uri: uri,
      backupCodes: backupCodes
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
