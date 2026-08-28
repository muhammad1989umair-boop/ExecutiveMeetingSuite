const pg = require('pg');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'executive_meeting_suite',
});

async function fixPasswords() {
  try {
    console.log('🔐 Fixing password hashes with bcryptjs...');

    const password = 'demo123';
    const hashedPassword = await bcryptjs.hash(password, 10);

    console.log('Hashed password:', hashedPassword);

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE role IN ('DIVISIONAL_HEAD', 'CHIEF_OF_STAFF')`,
      [hashedPassword]
    );

    console.log(`✅ Updated ${result.rowCount} users with bcryptjs hashed password: demo123`);
    console.log('✅ All users can now login successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPasswords();
