import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('Connecting to database...');
    
    // Create pending_users table
    console.log('Creating pending_users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_users (
          email VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          otp VARCHAR(6) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
