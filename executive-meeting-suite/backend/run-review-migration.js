const pg = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'executive_meeting_suite',
});

async function runMigration() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'src/db/migrate-add-review-fields.sql'),
      'utf8'
    );

    console.log('Running migration to add review_comments and review_attachment_url...');
    await pool.query(sql);
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
