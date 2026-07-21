const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://webside_user:webside_db_pass_2026@127.0.0.1:5434/webside' });
async function check() {
  const res = await pool.query("SELECT email, otp FROM pending_users WHERE email='test-otp-user@example.com'");
  console.log(res.rows);
  await pool.end();
}
check();
