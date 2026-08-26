# Executive Meeting Suite - Setup Instructions

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## Quick Start

### 1. Database Setup

```bash
# Create database
createdb executive_meeting_suite

# Load schema
psql -U postgres -d executive_meeting_suite -f DATABASE_SCHEMA.sql

# Seed initial data (runs as part of migration)
npm run db:migrate
npm run db:seed
```

### 2. Environment Variables

Create `.env` in root directory:

```
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=executive_meeting_suite
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_min_32_chars_long
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@executive-suite.com

# File Upload
FILE_UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# Log
LOG_LEVEL=info
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Run Application

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## Default Login

**Email:** admin@company.com  
**Password:** Demo@123456

(Change immediately in production)

## API Documentation

See `API_DOCS.md` for complete API reference.

## Testing

```bash
npm test
```

## Features Implemented

### Core ✅
- User management system
- Role-based access control (RBAC)
- JWT authentication
- Meeting management
- Action item workflows
- Email notifications
- Dashboard metrics
- Audit logging

### In MVP-1 ✅
- User CRUD operations
- Meeting creation and management
- Action item creation and assignment
- Status workflow (open→in_progress→submitted→closed)
- Email notifications on assignment and status changes
- Executive and personal dashboards
- Basic reporting

### Phase 2 (Planned)
- Audio recording
- Minutes generation
- AI assistance
- Extension workflows
- Advanced escalation
- Full search functionality
- Export to PDF/Excel

## File Structure

```
├── backend/
│   ├── src/
│   │   ├── server.ts           # Main Express app
│   │   ├── config/
│   │   │   └── database.ts     # Database config
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT middleware
│   │   │   ├── rbac.ts         # Role authorization
│   │   │   └── errorHandler.ts # Error handling
│   │   ├── routes/
│   │   │   ├── auth.ts         # Authentication routes
│   │   │   ├── users.ts        # User management
│   │   │   ├── meetings.ts     # Meeting operations
│   │   │   ├── actionItems.ts  # Action item operations
│   │   │   ├── dashboard.ts    # Dashboard data
│   │   │   └── reports.ts      # Reporting
│   │   ├── services/
│   │   │   ├── emailService.ts # Email operations
│   │   │   ├── authService.ts  # Auth logic
│   │   │   └── actionService.ts # Action item logic
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Meeting.ts
│   │   │   └── ActionItem.ts
│   │   ├── utils/
│   │   │   └── validators.ts   # Input validation
│   │   └── database/
│   │       └── migrations.sql   # DB migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.js
│   └── package.json
├── DATABASE_SCHEMA.sql
├── IMPLEMENTATION_PLAN.md
└── SETUP_INSTRUCTIONS.md
```

## Troubleshooting

### Database connection error
- Verify PostgreSQL is running
- Check DB credentials in .env
- Run: `psql -U postgres -d executive_meeting_suite -c "SELECT 1"`

### Port already in use
- Change PORT in .env
- Or: `lsof -ti:5000 | xargs kill -9`

### Email not sending
- Check SMTP credentials
- For Gmail: enable "Less secure app access"
- Check email logs: `SELECT * FROM email_logs LIMIT 10;`

## Support

For issues, check:
1. Application logs: `tail -f logs/app.log`
2. Database logs: `psql -U postgres -d executive_meeting_suite`
3. Email logs: Check `email_logs` table

## Next Steps

1. Run setup
2. Access application at `http://localhost:5000`
3. Login with admin credentials
4. Create users in Admin panel
5. Create meeting
6. Assign action items
7. Test email notifications
8. Review dashboard
