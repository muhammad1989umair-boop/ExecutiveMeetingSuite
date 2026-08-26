# ⚡ Quick Start - Executive Meeting Suite

Get up and running in **5 minutes**!

## Prerequisites Check

Before starting, verify you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running (`psql --version`)
- [ ] Git installed (`git --version`)

## Installation (5 Minutes)

### Step 1: Set Up Database (1 minute)
```bash
# Create database
psql -U postgres -c "CREATE DATABASE executive_meeting_suite;"
```

### Step 2: Backend Setup (2 minutes)
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database password
# Then run migrations
npm run db:migrate
npm run db:seed

# Start backend server
npm run dev
```

**Expected output:**
```
🚀 Executive Meeting Suite API running on port 5000
```

### Step 3: Frontend Setup (2 minutes)
```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

**The app will automatically open at http://localhost:3000**

## First Time Login

```
Email: umair.ilyas@gatronova.com
Password: demo123
```

## What's Next?

### 1. Create Your First Meeting
1. Go to "Meetings" in the left sidebar
2. Click "New Meeting"
3. Fill in the details (title, date, location)
4. Click "Create Meeting"

### 2. Add Your Divisional Heads
1. Click your profile icon (top right)
2. Go to "Settings"
3. Click "Add Head"
4. Fill in the divisional head details

### 3. Create Your First Action Item
1. Go back to the meeting you created
2. Click "Add Action Item"
3. Assign it to a divisional head
4. Set a target date
5. Submit - Email will be sent automatically!

### 4. View Dashboard
1. Click "Dashboard" in the sidebar
2. See all your metrics and activity

## Email Setup (Optional but Recommended)

To enable email notifications:

1. Open `backend/.env`
2. Update these fields:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**For Gmail:**
- Enable 2FA on your Google Account
- Go to https://myaccount.google.com/apppasswords
- Generate and copy the app password

## Useful Commands

### Backend
```bash
cd backend

# Development mode
npm run dev

# Build for production
npm run build

# View database
psql -U postgres -d executive_meeting_suite
```

### Frontend
```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
# Windows: netstat -ano | findstr :5000
# macOS/Linux: lsof -i :5000

# Kill the process and try again
# Windows: taskkill /PID <PID> /F
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Database connection error
```bash
# Verify PostgreSQL is running
# Check database exists
psql -U postgres -l | grep executive_meeting_suite

# Recreate if needed
psql -U postgres -c "DROP DATABASE executive_meeting_suite;"
psql -U postgres -c "CREATE DATABASE executive_meeting_suite;"
npm run db:migrate
```

### Email not working
- Check email provider settings in `.env`
- For Gmail: Allow "Less secure app access" or use App Password
- Check `backend/logs` for error messages
- Verify SMTP credentials are correct

## Project Structure

```
executive-meeting-suite/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth & validation
│   │   └── db/           # Database schema
│   ├── .env.example      # Configuration template
│   └── package.json
│
├── frontend/             # React web app
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Custom React hooks
│   │   └── App.tsx       # Main app component
│   ├── index.html        # HTML entry point
│   └── package.json
│
├── config/
│   └── divisional-heads.json  # Organization configuration
│
└── documentation/        # Setup guides and features
```

## Key Features Overview

- 📅 **Meetings**: Create and manage executive meetings
- ✅ **Action Items**: Assign tasks with deadlines and tracking
- 📊 **Dashboard**: Real-time metrics and analytics
- 📧 **Email**: Automatic notifications to assignees
- 👥 **Multi-Division**: Support for conglomerate structure
- 🔐 **Security**: Role-based access control
- 📁 **File Upload**: Attach documents to responses
- 🎤 **Audio**: Record meeting audio (coming soon)

## Demo Data

The system comes with sample data for testing:

**Divisions (in config/divisional-heads.json):**
- Energy & Power (Novatex Energy Ltd)
- Manufacturing (Gatronova Manufacturing)
- Technology & Digital (Gatronova Tech Solutions)
- Finance & Administration (Novatex Limited)
- Human Resources (Novatex Limited)

**Demo User (Chief of Staff):**
- Email: umair.ilyas@gatronova.com
- Password: demo123
- Role: CHIEF_OF_STAFF

## Next Steps

1. **Complete Setup Guide**: Read `SETUP_GUIDE.md` for detailed instructions
2. **Features Documentation**: Check `FEATURES.md` for all capabilities
3. **Full README**: See `README.md` for comprehensive information
4. **Production Deployment**: Deploy using Docker, Heroku, or cloud provider

## Support

- 📖 Read the documentation files
- 🐛 Check logs in browser console (F12) and terminal
- 💬 Review API responses in Network tab (F12)
- 📧 Contact your IT department for issues

---

## Success Checklist ✅

- [ ] Backend running on http://localhost:5000/health
- [ ] Frontend running on http://localhost:3000
- [ ] Can login with demo credentials
- [ ] Can see Dashboard with demo data
- [ ] Can create a meeting
- [ ] Can create an action item
- [ ] Database shows tables in `\dt` command
- [ ] (Optional) Email notifications configured

**Once all boxes are checked, you're ready to use the Executive Meeting Suite! 🎉**

---

**Questions? Need help? Check SETUP_GUIDE.md or contact IT support.**
