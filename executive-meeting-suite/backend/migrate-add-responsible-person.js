const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'executive_meeting_suite'
});

async function migrate() {
  try {
    console.log('Adding responsible_person_id, division_id, and company columns to meetings table...');

    await pool.query(`
      ALTER TABLE meetings
      ADD COLUMN IF NOT EXISTS responsible_person_id UUID,
      ADD COLUMN IF NOT EXISTS division_id UUID,
      ADD COLUMN IF NOT EXISTS company VARCHAR(255);
    `);

    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
