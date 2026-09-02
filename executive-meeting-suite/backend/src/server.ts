import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './database';

// Import routes
import authRoutes from './routes/auth';
import meetingRoutes from './routes/meetings';
import actionItemRoutes from './routes/actionItems';
import usersRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import masterDataRoutes from './routes/masterData';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS
const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  console.error('FATAL: CORS_ORIGIN not configured');
  process.exit(1);
}
app.use(cors({ origin: corsOrigin, credentials: true }));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting - strict for security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api/', limiter);

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

// Initialize database schema if needed
async function initializeDatabase() {
  try {
    // Check if tables exist
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      )`
    );

    if (!tableCheck.rows[0].exists) {
      console.log('Creating database tables...');
      const fs = require('fs');
      const schema = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
      await pool.query(schema);
      console.log('✓ Database schema created');
    } else {
      // Check if email_logs table has correct columns, if not, recreate it
      try {
        await pool.query(`SELECT to_email FROM email_logs LIMIT 1`);
      } catch (err: any) {
        if (err.message.includes('to_email')) {
          console.log('Fixing email_logs table structure...');
          await pool.query('DROP TABLE IF EXISTS email_logs CASCADE');
          const emailLogsSQL = `
            CREATE TABLE email_logs (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              to_email VARCHAR(255) NOT NULL,
              subject VARCHAR(500),
              template_type VARCHAR(100),
              status VARCHAR(50) DEFAULT 'QUEUED',
              error_message TEXT,
              action_item_id UUID REFERENCES action_items(id) ON DELETE SET NULL,
              meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
              user_id UUID REFERENCES users(id) ON DELETE SET NULL,
              sent_at TIMESTAMP,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
            CREATE INDEX idx_email_logs_status ON email_logs(status);
            CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
          `;
          await pool.query(emailLogsSQL);
          console.log('✓ Email logs table fixed');
        }
      }
    }

    // Always seed companies and base data
    await seedDemoData();
  } catch (error: any) {
    console.error('Database initialization error:', error);
  }
}

async function seedDemoData() {
  try {
    const bcryptjs = require('bcryptjs');
    const hashedPassword = await bcryptjs.hash('demo123', 10);

    // Insert all 24 companies
    const companies = ['Bonanza', 'DVAGO', 'Executive', 'Executive Office', 'External', 'Finance', 'Gatron', 'Gatronova', 'GPAC', 'HSE', 'Internal Audit', 'KGT', 'Krystalite', 'Legal and Tax', 'Marketing', 'Mustaqeem', 'Nova Mobility', 'Novatex', 'Novatex-BOPET', 'Novatex Limited', 'Others', 'PharmNova', 'Plant Operations', 'Supply Chain'];
    for (const company of companies) {
      try {
        await pool.query(
          `INSERT INTO companies (name) VALUES ($1) ON CONFLICT DO NOTHING`,
          [company]
        );
      } catch (err: any) {
        // Ignore if company already exists
        if (err.code !== '23505') { // 23505 is unique constraint violation
          throw err;
        }
      }
    }

    // Insert demo divisions
    let execDiv = await pool.query(`SELECT id FROM divisions WHERE name = 'Executive Office' LIMIT 1`);
    if (!execDiv.rows.length) {
      execDiv = await pool.query(
        `INSERT INTO divisions (name, company, description)
         VALUES ('Executive Office', 'Novatex Limited', 'Chief of Staff Division')
         RETURNING id`
      );
    }

    let marketingDiv = await pool.query(`SELECT id FROM divisions WHERE name = 'Marketing' LIMIT 1`);
    if (!marketingDiv.rows.length) {
      marketingDiv = await pool.query(
        `INSERT INTO divisions (name, company, description)
         VALUES ('Marketing', 'Novatex Limited', 'Marketing Division')
         RETURNING id`
      );
    }

    let supplyDiv = await pool.query(`SELECT id FROM divisions WHERE name = 'Supply Chain' LIMIT 1`);
    if (!supplyDiv.rows.length) {
      supplyDiv = await pool.query(
        `INSERT INTO divisions (name, company, description)
         VALUES ('Supply Chain', 'Novatex Limited', 'Supply Chain Division')
         RETURNING id`
      );
    }

    let itDiv = await pool.query(`SELECT id FROM divisions WHERE name = 'Information Technology' LIMIT 1`);
    if (!itDiv.rows.length) {
      itDiv = await pool.query(
        `INSERT INTO divisions (name, company, description)
         VALUES ('Information Technology', 'Novatex Limited', 'IT Division')
         RETURNING id`
      );
    }

    let hrDiv = await pool.query(`SELECT id FROM divisions WHERE name = 'Human Resources' LIMIT 1`);
    if (!hrDiv.rows.length) {
      hrDiv = await pool.query(
        `INSERT INTO divisions (name, company, description)
         VALUES ('Human Resources', 'Novatex Limited', 'HR Division')
         RETURNING id`
      );
    }

    // Insert demo users
    const users = [
      ['umair.ilyas@gatronova.com', 'Chief of Staff', 'Chief of Staff', 'CHIEF_OF_STAFF', execDiv.rows[0].id],
      ['marketing.head@gatronova.com', 'Marketing Head', 'Marketing Head', 'DIVISIONAL_HEAD', marketingDiv.rows[0].id],
      ['supply.head@gatronova.com', 'Supply Chain Head', 'Supply Chain Head', 'DIVISIONAL_HEAD', supplyDiv.rows[0].id],
      ['it.head@gatronova.com', 'IT Head', 'IT Head', 'DIVISIONAL_HEAD', itDiv.rows[0].id],
      ['hr.head@gatronova.com', 'HR Head', 'HR Head', 'DIVISIONAL_HEAD', hrDiv.rows[0].id]
    ];

    for (const [email, fullName, title, role, divisionId] of users) {
      await pool.query(
        `INSERT INTO users (email, password_hash, full_name, title, role, division_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
        [email, hashedPassword, fullName, title, role, divisionId]
      );
    }

    console.log('✓ Demo data seeded');
  } catch (error: any) {
    if (error.code !== '23505') { // Ignore duplicate key errors
      console.error('Seed error:', error);
    }
  }
}

// ============================================================================
// ROUTES
// ============================================================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    application: 'Executive Meeting Suite',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/action-items', actionItemRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/master-data', masterDataRoutes);

// ============================================================================
// STATIC FILES (Frontend)
// ============================================================================

// Disable caching for frontend files
app.use((req: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

interface AppError extends Error {
  status?: number;
}

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    status: status,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    status: 404,
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✓ Database connected');

    // Initialize database
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║   EXECUTIVE MEETING SUITE                                  ║
║   Production Enterprise Application                         ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on port ${PORT}
✓ Environment: ${process.env.NODE_ENV || 'development'}
✓ Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}
✓ Timestamp: ${new Date().toISOString()}

Access Application: http://localhost:${PORT}
API Health Check: http://localhost:${PORT}/api/health

Demo Login:
  Email: umair.ilyas@gatronova.com
  Password: demo123

  `);
    });
  } catch (error: any) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Export for testing
export default app;
export { pool };
