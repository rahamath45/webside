import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import pool from '@/lib/db';
import { validateEmail } from '@/lib/email-validator';
import { isValidString, validateAndSanitize, FIELD_LIMITS } from '@/lib/sanitize';
import { sendWelcomeEmail, sendAlreadyRegisteredEmail } from '@/lib/email-sender';
export async function POST(request) {
  try {
    // Finding 13: Strictly validate Content-Type header
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { message: 'Unsupported Media Type: Only application/json is allowed' },
        { status: 415 }
      );
    }

    const body = await request.json();

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
    const email = emailCheck.sanitized;
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

    // Check if email already exists — parameterized query prevents SQL injection.
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    const hashedPassword = await hashPassword(password);

    // User Enumeration Fix (Finding 11):
    // Return the SAME generic message whether the email already exists or is newly created.
    // If email exists, silently skip insertion. Attacker cannot distinguish 409 vs 201.
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
        [name, email.toLowerCase(), hashedPassword]
      );
      
      // Send welcome email in background
      sendWelcomeEmail(email, name).catch(console.error);
    } else {
      // Send already registered email in background
      // Note: We don't have the existing user's name readily available without selecting it, 
      // but we can just pass the provided name or null.
      sendAlreadyRegisteredEmail(email, name).catch(console.error);
    }

    // Always return 200 with a generic message (Finding 11)
    return NextResponse.json(
      { message: 'If this email is not already registered, an account has been created. Please check your email.' },
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
