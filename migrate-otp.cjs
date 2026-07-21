const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://webside_user:webside_db_pass_2026@127.0.0.1:5434/webside'
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_users (
          email VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          otp VARCHAR(6) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    console.log('Success');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
