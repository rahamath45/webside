/**
 * PostgreSQL Connection Pool
 *
 * Uses parameterized queries ($1, $2, ...) to prevent SQL injection.
 * Special characters like @, ', ", --, OR 1=1 are treated as plain text
 * because the pg driver sends SQL structure and data separately.
 *
 * Usage:
 *   import pool from '@/lib/db';
 *   const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
 */
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
