const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'executive_meeting_suite',
});

(async () => {
  try {
    const result = await pool.query(
      `SELECT email, full_name FROM users WHERE role IN ('DIVISIONAL_HEAD', 'CHIEF_OF_STAFF') ORDER BY email`
    );

    console.log('📧 Existing divisional head emails:');
    result.rows.forEach(row => console.log(`  • ${row.email} (${row.full_name})`));
    console.log(`\n✅ Total: ${result.rows.length} divisional heads`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
