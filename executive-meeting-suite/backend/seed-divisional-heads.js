const pg = require('pg');
const bcryptjs = require('bcryptjs');

const pool = new pg.Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'executive_meeting_suite',
});

async function seedDivisionalHeads() {
  try {
    const hashedPassword = await bcryptjs.hash('demo123', 10);

    // Get or create divisions
    const divisions = [
      { name: 'Marketing', company: 'Novatex Limited' },
      { name: 'Supply Chain', company: 'Gatronova' },
      { name: 'Information Technology', company: 'Gatronova' },
      { name: 'Human Resources', company: 'Gatronova' },
      { name: 'Finance', company: 'Gatronova' },
      { name: 'Legal and Tax', company: 'Gatronova' },
      { name: 'Audit', company: 'Gatronova' },
      { name: 'Internal Audit', company: 'Gatronova' },
      { name: 'Administration', company: 'Novatex' },
      { name: 'Plant Operations', company: 'Novatex' },
      { name: 'Executive', company: 'Gatronova' }
    ];

    const divisionMap = {};

    for (const div of divisions) {
      // Check if division exists
      let existingDiv = await pool.query(
        `SELECT id FROM divisions WHERE name = $1`,
        [div.name]
      );

      if (existingDiv.rows.length > 0) {
        divisionMap[div.name] = existingDiv.rows[0].id;
      } else {
        const result = await pool.query(
          `INSERT INTO divisions (name, company, description)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [div.name, div.company, div.name]
        );
        divisionMap[div.name] = result.rows[0].id;
      }
    }

    // Create users
    const users = [
      { email: 'imranshah@gatronova.com', fullName: 'Imran Shah', title: 'Supply Chain Head', division: 'Supply Chain' },
      { email: 'azizmalik@gatronova.com', fullName: 'Aziz Malik', title: 'Marketing Head', division: 'Marketing' },
      { email: 'waseem.rasheed@gatronova.com', fullName: 'Waseem Rasheed', title: 'IT Head', division: 'Information Technology' },
      { email: 'muhammad.tufail@gatronova.com', fullName: 'Muhammad Tufail', title: 'Finance Head', division: 'Finance' },
      { email: 'kafeel.zehri@gatronova.com', fullName: 'Kafeel Zehri', title: 'Finance Head', division: 'Finance' },
      { email: 'shameer@gatronova.com', fullName: 'Shameer Haroon', title: 'Legal and Tax Head', division: 'Legal and Tax' },
      { email: 'adeel.siddiqui@gatronova.com', fullName: 'Adeel Siddiqui', title: 'Finance Head', division: 'Finance' },
      { email: 'asifsiddique@gatron-novatex.com', fullName: 'Asif Siddique', title: 'Finance Head', division: 'Finance' },
      { email: 'ramiz.rahim@gatron-novatex.com', fullName: 'Ramiz Rahim', title: 'Finance Head', division: 'Finance' },
      { email: 'sibtehassan@gatron-novatex.com', fullName: 'Sibt-e-Hasan', title: 'Administration Head', division: 'Administration' },
      { email: 'zubair.chini@gatronova.com', fullName: 'Zubair Chini', title: 'Audit Head', division: 'Audit' },
      { email: 'shuja.shams@gatronova.com', fullName: 'Shuja Shams', title: 'HR Head', division: 'Human Resources' },
      { email: 'm.turab@gatron-novatex.com', fullName: 'Mustafa Turab', title: 'Internal Audit Head', division: 'Internal Audit' },
      { email: 'aleem.aqeel@bonanzagt.com', fullName: 'Danish Adamjee', title: 'Chief Operating Officer', division: 'Executive' },
      { email: 'wasif.khan@dvago.pk', fullName: 'Wasif', title: 'Chief Executive Officer', division: 'Executive' },
      { email: 'haseebkhan@gatronova.com', fullName: 'Haseeb Khan', title: 'GM-Plant', division: 'Plant Operations' }
    ];

    for (const user of users) {
      const divId = divisionMap[user.division];
      await pool.query(
        `INSERT INTO users (email, password_hash, full_name, title, role, division_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT (email) DO NOTHING`,
        [user.email, hashedPassword, user.fullName, user.title, 'DIVISIONAL_HEAD', divId]
      );
      console.log(`✓ Created user: ${user.fullName}`);
    }

    console.log('✓ Divisional heads seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding divisional heads:', error);
    process.exit(1);
  }
}

seedDivisionalHeads();
