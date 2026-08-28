const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'executive_meeting_suite',
});

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

async function addCompanies() {
  try {
    console.log('🏢 Adding companies to database...\n');

    for (const company of companies) {
      try {
        await pool.query(
          `INSERT INTO companies (name) VALUES ($1)
           ON CONFLICT (name) DO NOTHING`,
          [company]
        );
        console.log(`✅ ${company}`);
      } catch (err) {
        console.error(`❌ Error adding ${company}:`, err.message);
      }
    }

    console.log('\n✅ All companies added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addCompanies();
