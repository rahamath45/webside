import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists — parameterized query prevents SQL injection.
    // Even if email = "' OR 1=1 --", it is treated as plain text by PostgreSQL.
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Email is already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Insert new user — parameterized query.
    // Special characters in name/email (like @, ', ", OR 1=1) are stored as-is
    // without any risk of SQL injection.
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email.toLowerCase(), hashedPassword]
    );

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
