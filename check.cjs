const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://webside_user:webside_db_pass_2026@127.0.0.1:5434/webside' });
async function check() {
  const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name IN ('token_blacklist', 'pending_users') ORDER BY table_name;");
  console.log('Tables found:', res.rows);
  await pool.end();
}
check();
