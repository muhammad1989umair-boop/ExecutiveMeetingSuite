const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'executive_meeting_suite'
});

async function seedDemoMeeting() {
  try {
    console.log('Creating demo meeting and action items...');

    // Get a user first
    const userResult = await pool.query(
      `SELECT id FROM users LIMIT 1`
    );

    if (userResult.rows.length === 0) {
      console.error('No users found. Please run backend first to seed users.');
      process.exit(1);
    }

    const userId = userResult.rows[0].id;

    // Create meeting
    const meetingResult = await pool.query(
      `INSERT INTO meetings (title, description, location, meeting_date, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['TREASURY - TEST MEETING', 'Test Meeting', '12th Floor - GIAT Tower', new Date('2026-09-02'), userId]
    );

    const meetingId = meetingResult.rows[0].id;
    console.log('✓ Meeting created:', meetingId);

    // Get division
    const divisionResult = await pool.query(
      `SELECT id FROM divisions LIMIT 1`
    );

    const divisionId = divisionResult.rows[0].id;

    // Create action item
    const actionItemResult = await pool.query(
      `INSERT INTO action_items (meeting_id, title, description, responsible_user_id, responsible_division_id, priority, target_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [meetingId, 'Test Action Item', 'Test Action Item', userId, divisionId, 'MEDIUM', new Date('2026-09-08'), 'OPEN', userId]
    );

    console.log('✓ Action item created:', actionItemResult.rows[0].id);
    console.log('\n✅ Demo data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo meeting:', error);
    process.exit(1);
  }
}

seedDemoMeeting();
