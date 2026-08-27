// Centralized Application Configuration

export const config = {
  // Application
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000'),
    isDev: process.env.NODE_ENV !== 'production',
    isProd: process.env.NODE_ENV === 'production'
  },

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'executive_meeting_suite',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    url: process.env.DATABASE_URL
  },

  // Security - JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiry: process.env.JWT_EXPIRY || '7d'
  },

  // Security - CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },

  // Security - Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per windowMs
  },

  // Email (optional)
  email: {
    enabled: !!process.env.EMAIL_USER,
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@executivemeeting.local'
  },

  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') // 50MB
  }
}

// Validate required config on startup
export function validateConfig() {
  const required = ['JWT_SECRET', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing.join(', '))
    if (config.app.isProd) {
      process.exit(1)
    }
  }
}
