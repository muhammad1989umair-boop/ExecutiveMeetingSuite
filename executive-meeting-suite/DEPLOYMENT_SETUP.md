# 🚀 Deployment Setup Guide

## Quick Setup

### Step 1: Determine Your App URL
Your deployed app will be accessible at one of these:
- **Heroku:** `https://your-app-name.herokuapp.com`
- **Custom Domain:** `https://app.gatronova.com` or similar
- **Self-Hosted:** `https://your-server-ip-or-domain.com`

### Step 2: Configure Environment Variables

Update the APP_URL in your deployment:

```bash
# For Heroku
heroku config:set APP_URL=https://your-app-name.herokuapp.com
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
heroku config:set CORS_ORIGIN=https://your-app-name.herokuapp.com

# For Docker/Self-Hosted
# Edit backend/.env and set:
APP_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### Step 3: Deploy Using Docker Compose

```bash
# Build and run all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 4: Test Deployment

```bash
# Test backend health
curl https://your-domain.com/api/health

# Test frontend
Open https://your-domain.com in browser
```

---

## Deployment Options

### Option A: Heroku (Easiest)

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# 3. Set environment variables
heroku config:set APP_URL=https://your-app-name.herokuapp.com
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set EMAIL_USER=ems.gatronova@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password

# 4. Deploy
git push heroku main

# 5. View logs
heroku logs --tail
```

### Option B: Docker (Self-Hosted)

```bash
# 1. Install Docker and Docker Compose

# 2. Clone repository
git clone https://github.com/muhammad1989umair-boop/ExecutiveMeetingSuite.git
cd ExecutiveMeetingSuite

# 3. Create .env file with proper config
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# 4. Start services
docker-compose up -d

# 5. Verify
docker-compose ps
curl http://localhost:3000/api/health
```

### Option C: AWS/Azure/GCP

See PRODUCTION_READY.md for cloud provider options

---

## Important Configuration

### Email Configuration
- **Email Service:** Gmail SMTP (already configured)
- **App Password:** Use app-specific password, not Gmail password
- **Credentials:** 
  ```
  EMAIL_USER=ems.gatronova@gmail.com
  EMAIL_PASSWORD=ochojicemivamwfq
  ```

### JWT Secret
- **Generate secure JWT secret:**
  ```bash
  openssl rand -hex 32
  ```
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Database
- **Heroku:** Automatically provisioned with PostgreSQL addon
- **Self-Hosted:** Use docker-compose (includes PostgreSQL)
- **Credentials:** Update DB_HOST, DB_USER, DB_PASSWORD

---

## Email Sending Verification

After deployment, test email sending:

1. **Log in to app** with demo credentials:
   - Email: `umair.ilyas@gatronova.com`
   - Password: `demo123`

2. **Go to Meetings** → Select a meeting

3. **Click Email button** to send emails with:
   - ✅ App link (uses APP_URL)
   - ✅ User ID (email)
   - ✅ Password (demo123)
   - ✅ Excel & PDF attachments

4. **Verify email received** with correct URL:
   - Should be: `https://your-deployed-domain.com`
   - NOT: `http://localhost:5000`

---

## Troubleshooting

### Email Link Not Working
**Problem:** Emails contain localhost URL
**Solution:** Ensure APP_URL is set to your actual deployed domain

```bash
# Heroku
heroku config:set APP_URL=https://your-app.herokuapp.com

# Docker
Edit backend/.env:
APP_URL=https://your-actual-domain.com
```

### Database Connection Error
**Problem:** Cannot connect to database
**Solution:** 
- Verify DB_HOST, DB_USER, DB_PASSWORD
- For Heroku: Check DATABASE_URL addon
- For Docker: Ensure postgres service is running

### CORS Errors
**Problem:** Frontend can't reach backend
**Solution:** Update CORS_ORIGIN to match frontend URL

```bash
heroku config:set CORS_ORIGIN=https://your-app.herokuapp.com
```

---

## Post-Deployment Checklist

- [ ] App URL configured in APP_URL env variable
- [ ] Frontend can access backend API
- [ ] Login works with demo credentials
- [ ] Can create action items
- [ ] Can send emails with working links
- [ ] Email credentials are included (User ID + Password)
- [ ] Health check endpoint responds: `/api/health`
- [ ] All action items visible
- [ ] Responsible persons can only see their items

---

## Next Steps

1. **Deploy the application** using one of the options above
2. **Update APP_URL** with your actual deployed domain
3. **Test email sending** to verify links work
4. **Monitor health** with `/api/health` endpoint
5. **Scale as needed** - add more dynos or servers

---

## Support

For issues, check:
- Backend logs: `docker-compose logs -f backend`
- Heroku logs: `heroku logs --tail`
- Health endpoint: `curl https://your-domain/api/health`
- Metrics: `curl https://your-domain/api/metrics`
