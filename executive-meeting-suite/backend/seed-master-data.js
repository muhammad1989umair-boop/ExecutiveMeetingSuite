const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'executive_meeting_suite',
});

async function seedMasterData() {
  try {
    console.log('🌱 Seeding Master Data...');

    // Companies
    const companies = [
      'Gatronova',
      'Novatex',
      'Gatron',
      'Krystalite',
      'Novatex-BOPET',
      'Bonanza',
      'DVAGO',
      'PharmNova',
      'Nova Mobility',
      'GPAC',
      'KGT',
      'External',
      'Mustaqeem',
      'Others'
    ];

    for (const company of companies) {
      await pool.query(
        `INSERT INTO companies (name) VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [company]
      );
    }
    console.log(`✓ ${companies.length} companies seeded`);

    // Divisions
    const divisions = [
      { name: 'Finance', company: 'Gatronova' },
      { name: 'Supply Chain', company: 'Novatex' },
      { name: 'Information Technology', company: 'Novatex' },
      { name: 'Marketing', company: 'Novatex' },
      { name: 'Human Resources', company: 'Novatex Limited' },
      { name: 'Internal Audit', company: 'Gatronova' },
      { name: 'Audit', company: 'Gatronova' },
      { name: 'Legal and Tax', company: 'Gatronova' },
      { name: 'Manufacturing', company: 'Novatex' },
      { name: 'Administration', company: 'Novatex' },
      { name: 'Executive Office', company: 'Novatex Limited' },
      { name: 'Plant Operations', company: 'Novatex' },
      { name: 'Others', company: 'External' }
    ];

    for (const division of divisions) {
      const check = await pool.query('SELECT id FROM divisions WHERE name = $1', [division.name]);
      if (check.rows.length === 0) {
        await pool.query(
          `INSERT INTO divisions (name, company, description)
           VALUES ($1, $2, $3)`,
          [division.name, division.company, `${division.name} Division`]
        );
      }
    }
    console.log(`✓ ${divisions.length} divisions seeded`);

    console.log('✅ Master data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedMasterData();
