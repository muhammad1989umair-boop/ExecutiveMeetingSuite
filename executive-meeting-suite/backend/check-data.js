const pg = require('pg');

const pool = new pg.Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'executive_meeting_suite',
});

async function check() {
  try {
    console.log('\n=== DIVISIONS TABLE ===');
    const divs = await pool.query('SELECT id, name, company FROM divisions ORDER BY company, name');
    divs.rows.forEach(d => console.log(`${d.id} | ${d.name.padEnd(30)} | ${d.company}`));

    console.log('\n=== USERS TABLE (First 5) ===');
    const users = await pool.query('SELECT id, full_name, division_id, email FROM users LIMIT 5');
    users.rows.forEach(u => console.log(`${u.id} | ${u.full_name.padEnd(25)} | Division: ${u.division_id || 'NULL'} | ${u.email}`));

    console.log('\n=== USERS WITH DIVISIONS (JOIN) ===');
    const joined = await pool.query(
      `SELECT u.full_name, u.division_id, d.id as div_id, d.name as div_name, d.company 
       FROM users u 
       LEFT JOIN divisions d ON u.division_id = d.id 
       WHERE u.role = 'DIVISIONAL_HEAD' 
       LIMIT 5`
    );
    joined.rows.forEach(row => {
      console.log(`${row.full_name.padEnd(25)} | div_id=${row.division_id} | div_name=${row.div_name || 'NULL'} | company=${row.company || 'NULL'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
