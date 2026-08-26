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

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
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
      const schema = fs.readFileSync(path.join(__dirname, 'db/init.sql'), 'utf8');
      await pool.query(schema);
      console.log('✓ Database schema created');

      // Seed demo data
      await seedDemoData();
    }
  } catch (error: any) {
    console.error('Database initialization error:', error);
  }
}

async function seedDemoData() {
  try {
    const bcryptjs = require('bcryptjs');
    const hashedPassword = await bcryptjs.hash('demo123', 10);

    // Insert demo division
    const division = await pool.query(
      `INSERT INTO divisions (name, company, description)
       VALUES ('Executive Office', 'Novatex Limited', 'Chief of Staff Division')
       RETURNING id`
    );

    // Insert demo user
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, title, role, division_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       ON CONFLICT (email) DO NOTHING`,
      ['umair.ilyas@gatronova.com', hashedPassword, 'Chief of Staff', 'Chief of Staff', 'CHIEF_OF_STAFF', division.rows[0].id]
    );

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

// ============================================================================
// STATIC FILES (Frontend)
// ============================================================================

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
