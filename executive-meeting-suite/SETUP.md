# Executive Meeting Suite - Setup Instructions

## Prerequisites
- Node.js 16+ installed
- PostgreSQL 12+ installed and running
- Git (for version control)

## Quick Setup (5 minutes)

### Step 1: Create PostgreSQL Database

Open PostgreSQL CLI:
```bash
psql -U postgres
```

Run these commands:
```sql
CREATE DATABASE executive_meeting_suite;
\c executive_meeting_suite
```

Then exit with `\q`

### Step 2: Initialize Backend

```bash
cd backend
npm install
npm run dev
```

The backend will automatically:
- Create all database tables
- Seed demo user account
- Start server on http://localhost:5000

Demo Credentials:
```
Email: umair.ilyas@gatronova.com
Password: demo123
```

### Step 3: Initialize Frontend (in new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend will open at http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Create new user
- `GET /api/auth/me` - Get current user

### Meetings
- `GET /api/meetings` - List all meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:id` - Get meeting details
- `PATCH /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Action Items
- `GET /api/action-items` - List action items
- `POST /api/action-items` - Create action item
- `GET /api/action-items/:id` - Get action item
- `PATCH /api/action-items/:id` - Update status
- `POST /api/action-items/:id/response` - Submit response

### Users
- `GET /api/users` - List all users
- `GET /api/users/divisional-heads` - Get divisional heads
- `GET /api/users/:id` - Get user details

### Dashboard
- `GET /api/dashboard/metrics` - Get metrics
- `GET /api/dashboard/timeline` - Get timeline data
- `GET /api/dashboard/activity` - Get recent activity

## Environment Variables

Edit `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=executive_meeting_suite
JWT_SECRET=your-secret-key
```

## Troubleshooting

### Backend won't start
1. Check if PostgreSQL is running: `psql -U postgres -d executive_meeting_suite`
2. Check `.env` file has correct database credentials
3. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Frontend won't start
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check port 3000 is free: `netstat -ano | findstr :3000`

### Database errors
1. Verify database exists: `psql -U postgres -l | grep executive_meeting_suite`
2. Drop and recreate: `psql -U postgres -c "DROP DATABASE executive_meeting_suite;"`
3. Restart backend to auto-initialize

## Database Reset
If you need a fresh start:
```bash
psql -U postgres
DROP DATABASE IF EXISTS executive_meeting_suite;
CREATE DATABASE executive_meeting_suite;
\q
```

Then restart the backend server.

## Next Steps

1. Login with demo credentials
2. Create a test meeting
3. Add action items to the meeting
4. Test the dashboard
5. Customize the application as needed
