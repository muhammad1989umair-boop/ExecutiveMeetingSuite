const pg = require('pg');

const pool = new pg.Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'executive_meeting_suite',
});

async function test() {
  try {
    const query = `SELECT u.id, u.email, u.full_name, u.title, u.role, u.division_id, d.name as division_name, d.company
       FROM users u
       LEFT JOIN divisions d ON u.division_id = d.id
       WHERE u.is_active = true AND (u.role = 'DIVISIONAL_HEAD' OR u.role = 'CHIEF_OF_STAFF')
       ORDER BY u.full_name`;
    
    const result = await pool.query(query);
    
    console.log('\n=== SQL Query Result ===');
    console.log('Rows returned:', result.rows.length);
    console.log('\nFirst 2 rows:');
    result.rows.slice(0, 2).forEach((row, i) => {
      console.log(`\n${i+1}. ${row.full_name}`);
      console.log(`   Keys in row:`, Object.keys(row));
      console.log(`   division_name: ${row.division_name}`);
      console.log(`   company: ${row.company}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
