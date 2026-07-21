import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { hashPassword } from '@/lib/password';
import pool from '@/lib/db';
import { validateEmail } from '@/lib/email-validator';
import { isValidString, validateAndSanitize, FIELD_LIMITS } from '@/lib/sanitize';
import { sendSignupOtpEmail } from '@/lib/email-sender';
import { authRateLimiter } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    // Finding 1: Rate limiting on signup endpoint (F-14: progressive throttling)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const rateLimit = authRateLimiter.check(`ip:${ip}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { message: `Too many requests. Please try again in ${rateLimit.retryAfter} seconds.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
          },
        }
      );
    }

    // Finding 13: Strictly validate Content-Type header
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { message: 'Unsupported Media Type: Only application/json is allowed' },
        { status: 415 }
      );
    }

    // Finding 3: Graceful handling of malformed JSON
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { message: 'Bad Request: Invalid or malformed JSON body' },
        { status: 400 }
      );
    }

    // Finding 14: Mass Assignment Protection
    // Strict whitelist: Only allow name, email, password
    const allowedKeys = ['name', 'email', 'password'];
    const bodyKeys = Object.keys(body);
    const hasExtraKeys = bodyKeys.some(key => !allowedKeys.includes(key));
    
    if (hasExtraKeys) {
      return NextResponse.json(
        { message: 'Bad Request: Unrecognized fields provided' },
        { status: 400 }
      );
    }
    // Type Confusion check (Finding 8, 12):
    // Reject objects, arrays, numbers, booleans — only accept strings
    if (!isValidString(body.name) || !isValidString(body.email) || !isValidString(body.password)) {
      return NextResponse.json(
        { message: 'Invalid input: name, email, and password must be non-empty strings' },
        { status: 400 }
      );
    }

    // Input Length Validation (Finding 9)
    const nameCheck = validateAndSanitize(body.name, FIELD_LIMITS.name);
    if (!nameCheck.valid) {
      return NextResponse.json(
        { message: `Name ${nameCheck.error}` },
        { status: 400 }
      );
    }

    const emailCheck = validateAndSanitize(body.email, FIELD_LIMITS.email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { message: `Email ${emailCheck.error}` },
        { status: 400 }
      );
    }

    const passwordCheck = validateAndSanitize(body.password, FIELD_LIMITS.password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { message: `Password ${passwordCheck.error}` },
        { status: 400 }
      );
    }

    // Use sanitized values from this point (Finding 7: XSS stripped)
    const name = nameCheck.sanitized;
    // Finding 4: Trim and canonicalize email to prevent whitespace bypasses
    const email = emailCheck.sanitized.trim().toLowerCase();
    const password = body.password; // Don't strip HTML from password — it gets hashed anyway

    // Email format validation (Finding 2)
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password complexity check (Finding 1)
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!complexityRegex.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    
    // Check if user already exists in main users table
    const existingUser = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existingUser.rowCount > 0) {
      // User Enumeration Fix (Finding 11): 
      // Return success even if email is registered to prevent probing
      return NextResponse.json(
        { message: 'If this email is not already registered, an OTP has been sent. Please check your email.' },
        { status: 200 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Upsert into pending_users table (handles resending OTPs)
    await pool.query(
      `INSERT INTO pending_users (email, name, password, otp, expires_at) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO UPDATE SET 
       name = EXCLUDED.name, 
       password = EXCLUDED.password, 
       otp = EXCLUDED.otp, 
       expires_at = EXCLUDED.expires_at`,
      [email, name, hashedPassword, otp, tokenExpires]
    );

    // Send the OTP email
    sendSignupOtpEmail(email, name, otp).catch(console.error);

    // Always return 200 with generic message
    return NextResponse.json(
      { message: 'If this email is not already registered, an OTP has been sent. Please check your email.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
