const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://webside_user:webside_db_pass_2026@127.0.0.1:5434/webside' });
async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        jti VARCHAR(255) PRIMARY KEY,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    console.log('token_blacklist table created successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
