/**
 * Migration Script: Import users from users.json → PostgreSQL
 *
 * Usage:
 *   node scripts/migrate-users.js
 *
 * Requires DATABASE_URL environment variable to be set.
 * Example:
 *   DATABASE_URL=postgresql://webside_user:webside_db_pass_2026@127.0.0.1:5434/webside node scripts/migrate-users.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://webside_user:webside_db_pass_2026@127.0.0.1:5434/webside';

const pool = new Pool({ connectionString: DATABASE_URL });

async function migrate() {
  console.log('🔄 Starting user migration from users.json → PostgreSQL...\n');

  // Read existing users
  const filePath = path.join(__dirname, '..', 'data', 'users.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ data/users.json not found!');
    process.exit(1);
  }

  const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`📋 Found ${users.length} users in users.json\n`);

  let imported = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      // Check if user already exists (by email)
      const { rows: existing } = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
        [user.email]
      );

      if (existing.length > 0) {
        console.log(`⏭️  Skipped (already exists): ${user.email}`);
        skipped++;
        continue;
      }

      // Insert user — parameterized query (SQL injection safe)
      await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
        [user.name, user.email.toLowerCase(), user.password]
      );

      console.log(`✅ Imported: ${user.name} <${user.email}>`);
      imported++;
    } catch (err) {
      console.error(`❌ Failed to import ${user.email}:`, err.message);
    }
  }

  console.log(`\n🎉 Migration complete! Imported: ${imported}, Skipped: ${skipped}`);

  // Verify
  const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
  console.log(`📊 Total users in database: ${rows[0].count}`);

  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
