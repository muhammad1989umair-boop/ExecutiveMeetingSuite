const pg = require('pg');

// Test using the SAME config as database.ts
const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'executive_meeting_suite',
});

async function test() {
  try {
    console.log('\n=== Testing with database.ts config ===');
    console.log('DB_USER:', process.env.DB_USER || 'postgres');
    console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
    console.log('DB_PORT:', parseInt(process.env.DB_PORT || '5432'));
    console.log('DB_NAME:', process.env.DB_NAME || 'executive_meeting_suite');
    
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.title, u.role, u.division_id, d.name as division_name, d.company
       FROM users u
       LEFT JOIN divisions d ON u.division_id = d.id
       WHERE u.is_active = true AND (u.role = 'DIVISIONAL_HEAD' OR u.role = 'CHIEF_OF_STAFF')
       ORDER BY u.full_name`
    );
    
    console.log('\n✓ Query executed');
    console.log('Rows returned:', result.rows.length);
    console.log('\nFirst row columns:', Object.keys(result.rows[0]));
    console.log('\nFirst row data:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

test();
