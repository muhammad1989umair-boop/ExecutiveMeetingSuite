const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'executive_meeting_suite',
});

async function updatePasswords() {
  try {
    console.log('🔐 Setting initial password for all divisional heads...');

    const password = 'demo123';
    const hashedPassword = Buffer.from(password).toString('base64');

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE role = 'DIVISIONAL_HEAD' OR role = 'CHIEF_OF_STAFF'`,
      [hashedPassword]
    );

    console.log(`✅ Updated ${result.rowCount} users with password: demo123`);
    console.log('✅ All divisional heads can now login with their email and password: demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();
