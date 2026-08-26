# 🚀 Executive Meeting Suite - Complete Setup Guide

This guide will walk you through setting up the Executive Meeting Suite from scratch.

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** - Download from https://nodejs.org/
- **PostgreSQL 12+** - Download from https://www.postgresql.org/
- **Git** - Download from https://git-scm.com/
- **Text Editor** - VS Code, WebStorm, or your preference
- **Email account** - For sending notifications (Gmail, Office365, etc.)

## Step 1: Environment Setup

### Windows

1. **Install PostgreSQL**
   - Download from https://www.postgresql.org/download/windows/
   - During installation, remember the password you set for `postgres` user
   - Default port is 5432

2. **Verify PostgreSQL Installation**
   ```bash
   psql --version
   ```

3. **Create Database**
   ```bash
   psql -U postgres
   CREATE DATABASE executive_meeting_suite;
   \q
   ```

### macOS

```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb executive_meeting_suite
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

sudo -u postgres psql
CREATE DATABASE executive_meeting_suite;
\q
```

## Step 2: Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

### 4. Configure `.env` File

Open `backend/.env` and update:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=executive_meeting_suite

# JWT
JWT_SECRET=super-secret-key-change-this-in-production

# Email (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@executivemeeting.local
```

#### Setting Up Gmail for Email

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated password
   - Use this in `EMAIL_PASSWORD`

#### Setting Up Office 365 for Email

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-password
```

### 5. Initialize Database

```bash
npm run db:migrate
npm run db:seed
```

This will:
- Create all necessary tables
- Set up indexes
- Create initial demo users

### 6. Create Upload Directory

```bash
mkdir uploads
```

### 7. Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Executive Meeting Suite API running on port 5000
📊 WebSocket ready for real-time updates
```

## Step 3: Frontend Setup

### 1. Open New Terminal and Navigate to Frontend
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The app will automatically open at `http://localhost:3000`

## Step 4: Initial Configuration

### 1. First Login

Open http://localhost:3000 and login with:
- **Email**: `umair.ilyas@gatronova.com`
- **Password**: `demo123`

### 2. Access Settings

1. Click your profile icon (top right)
2. Select "Settings"
3. View/Update Divisional Heads

### 3. Add Your Divisional Heads

In Settings:
1. Click "Add Head"
2. Fill in:
   - Full Name
   - Email Address
   - Job Title
   - Phone Number
   - Division/Company

Example:
```
Name: Ahmed Hassan Khan
Email: ahmed.hassan@novatex-energy.com
Title: Chief Executive Officer - Energy Division
Phone: +92 21 1234567
Division: Energy & Power (Novatex Energy Ltd)
```

### 4. Update Configuration File

Edit `config/divisional-heads.json` to match your organization:

```json
{
  "divisions": [
    {
      "id": "div-energy",
      "name": "Energy & Power",
      "company": "Novatex Energy Ltd",
      "description": "Power generation and distribution",
      "heads": [
        {
          "id": "head-ahmed",
          "name": "Ahmed Hassan Khan",
          "title": "CEO - Energy",
          "email": "ahmed.hassan@novatex-energy.com",
          "phone": "+92 21 1234567",
          "department": "Executive Office"
        }
      ]
    }
  ],
  "chiefOfStaff": {
    "id": "cos-001",
    "name": "Chief of Staff",
    "title": "Chief of Staff & Company Secretary",
    "email": "umair.ilyas@gatronova.com",
    "phone": "+92 21 0000000",
    "company": "Gatronova Group"
  }
}
```

## Step 5: Verify Installation

### 1. Test API Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "Executive Meeting Suite API is running"
}
```

### 2. Test Frontend
- Visit http://localhost:3000
- Login with demo credentials
- Navigate through Dashboard, Meetings, and Action Items

### 3. Test Email

1. Create a test meeting:
   - Go to "Meetings" → "New Meeting"
   - Fill in details and submit

2. Create an action item:
   - From the meeting, add an action item
   - Assign to a divisional head
   - The email should be sent automatically

3. Check email inbox (may be in spam folder initially)

## Step 6: Database Management

### View Database

```bash
psql -U postgres -d executive_meeting_suite
```

Useful commands:
```sql
-- List tables
\dt

-- View meetings
SELECT id, title, meeting_date FROM meetings;

-- View action items
SELECT id, title, status, target_date FROM action_items;

-- Count items by status
SELECT status, COUNT(*) FROM action_items GROUP BY status;

-- Exit
\q
```

### Backup Database

```bash
pg_dump -U postgres executive_meeting_suite > backup.sql
```

### Restore Database

```bash
psql -U postgres executive_meeting_suite < backup.sql
```

## Troubleshooting

### Issue: Cannot Connect to PostgreSQL

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows: Services > PostgreSQL
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Or restart PostgreSQL
pg_ctl -D /usr/local/var/postgres -l logfile start
```

### Issue: Port 5000 Already in Use

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # macOS/Linux

# Kill the process
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # macOS/Linux

# Or change port in .env
PORT=5001
```

### Issue: Port 3000 Already in Use

**Solution:**
```bash
# Change port in frontend/vite.config.ts
server: {
  port: 3001  // Change to available port
}
```

### Issue: Email Not Sending

**Solution:**
1. Verify credentials in `.env`
2. Check email provider allows SMTP access
3. Verify firewall isn't blocking port 587
4. Check application logs for error messages
5. Try a different email provider (Gmail, Office365, SendGrid)

### Issue: Frontend Can't Reach Backend

**Solution:**
1. Ensure backend is running on port 5000
2. Check `CLIENT_URL` in backend `.env`
3. Check for CORS errors in browser console
4. Verify firewall settings

### Issue: Database Migration Failed

**Solution:**
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE executive_meeting_suite;"
psql -U postgres -c "CREATE DATABASE executive_meeting_suite;"
npm run db:migrate
npm run db:seed
```

## Next Steps

### 1. Customize Branding
- Update colors in `frontend/tailwind.config.js`
- Change company name in config files
- Update logo in components

### 2. Set Up Email Templates
- Customize email content in `backend/src/routes/actionItems.ts`
- Add HTML email templates

### 3. Configure SSL/HTTPS
- Generate SSL certificates
- Update backend to use HTTPS
- Update `CLIENT_URL` in environment

### 4. Deploy to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for cloud deployment guides:
- Docker
- Heroku
- AWS
- Azure
- GCP

### 5. Set Up Monitoring

Install monitoring tools:
- PM2 for process management
- Sentry for error tracking
- DataDog or New Relic for performance

## Performance Optimization

### Database Optimization

```sql
-- Add missing indexes
CREATE INDEX idx_meetings_created_at ON meetings(created_at);
CREATE INDEX idx_action_items_created_at ON action_items(created_at);

-- Analyze performance
EXPLAIN ANALYZE SELECT * FROM action_items WHERE status = 'OPEN';
```

### Frontend Optimization

```bash
# Build for production
npm run build

# Analyze bundle
npm install --save-dev webpack-bundle-analyzer
```

### Backend Optimization

```bash
# Enable compression
npm install compression

# Add rate limiting
npm install express-rate-limit

# Cache responses
npm install node-cache
```

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Change default database password
- [ ] Set strong passwords for all user accounts
- [ ] Enable HTTPS in production
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Configure email with DKIM/SPF
- [ ] Set up monitoring and alerts
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Enable CORS properly
- [ ] Use environment variables for secrets

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review logs in both backend and frontend
3. Check browser console (F12) for frontend errors
4. Check backend terminal for server errors
5. Contact IT Department

---

**You're all set! 🎉 Start using the Executive Meeting Suite to streamline your executive meetings!**
