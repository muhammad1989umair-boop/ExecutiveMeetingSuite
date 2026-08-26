# ✅ PRE-DEPLOYMENT CHECKLIST

## Before You Deploy - Complete These Steps

---

## **Step 1: Code Ready** ✓

- [x] Frontend API URL updated to use environment variables
- [ ] No console errors in development (`npm run dev`)
- [ ] Build succeeds locally (`npm run build` in frontend)
- [ ] Backend starts without errors (`npm run dev` in backend)
- [ ] All tests pass (if any)

**Action:** Run locally first
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Test in browser
# Visit http://localhost:3000
# Login and test features
```

---

## **Step 2: Create Accounts** ✓

- [ ] GitHub account (free)
- [ ] Netlify account (free)
- [ ] Heroku account (free)
- [ ] Firebase account (free)

**Action:** Sign up at:
- github.com
- netlify.com
- heroku.com
- firebase.google.com

---

## **Step 3: Push Code to GitHub** ✓

- [ ] Code committed and pushed to GitHub
- [ ] Repository is public (easier for Netlify/Heroku)
- [ ] Main branch is clean

**Action:**
```bash
git add .
git commit -m "Ready for production deployment"
git push origin dev
```

Then create a PR to merge `dev` into `main`:
```bash
gh pr create --base main --head dev
```

Merge the PR (via GitHub website or CLI).

---

## **Step 4: Database Ready** ✓

### Option A: Use Existing PostgreSQL
- [ ] PostgreSQL running locally
- [ ] Database `executive_meeting_suite` created
- [ ] Demo user exists
- [ ] Connection string noted: `postgresql://user:pass@host:port/database`

### Option B: Use Cloud Database (Recommended)
- [ ] Create database on:
  - AWS RDS
  - Azure Database
  - Neon (free tier)
  - Railway (free tier)
- [ ] Get connection string
- [ ] Test connection from backend

**Action:** Choose option and get connection string

---

## **Step 5: Environment Variables Ready** ✓

Create a text file with these variables (keep it private!):

```
FRONTEND_SITE_NAME: (e.g., "executive-meeting-suite")
BACKEND_APP_NAME: (e.g., "executive-meeting-suite-api")

JWT_SECRET: (generate random: openssl rand -hex 32)
DATABASE_URL: postgresql://...
CORS_ORIGIN: https://[FRONTEND_SITE_NAME].netlify.app
```

**Action:** Generate JWT secret
```bash
openssl rand -hex 32
```

---

## **Step 6: Deployment Order** ✓

Deploy in this order:

**1. Deploy Backend First** (Heroku)
   - Easier to test independently
   - Frontend depends on it

**2. Deploy Frontend Second** (Netlify)
   - Connects to live backend
   - Uses environment variables

**3. Verify Connection**
   - Frontend → Backend communication
   - Data persistence

---

## **Deployment Steps**

### **PART A: Backend to Heroku** (20 minutes)

1. **Create Heroku App**
   - Go to heroku.com
   - Click "New" → "Create new app"
   - Name: `executive-meeting-suite-api`

2. **Connect GitHub**
   - Go to Deploy tab
   - Click "Connect to GitHub"
   - Select your repository

3. **Add Environment Variables**
   - Go to Settings tab
   - Click "Reveal Config Vars"
   - Add:
     - `DATABASE_URL`: your-postgresql-url
     - `JWT_SECRET`: your-generated-secret
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `CORS_ORIGIN`: your-netlify-url (add later)

4. **Deploy**
   - Go to Deploy tab
   - Click "Deploy Branch"
   - Wait 3-5 minutes

5. **Verify**
   - Visit: `https://[APP_NAME].herokuapp.com/api/health`
   - Should see: `{"status":"ok"}`

### **PART B: Frontend to Netlify** (20 minutes)

1. **Create Netlify Site**
   - Go to netlify.com
   - Click "New site from Git"
   - Select GitHub
   - Choose your repository

2. **Configure Build**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`

3. **Add Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add:
     - `VITE_API_URL`: `https://[HEROKU_APP_NAME].herokuapp.com`

4. **Deploy**
   - Done! Netlify auto-deploys on push

5. **Verify**
   - Visit: `https://[SITE_NAME].netlify.app`
   - Login and test features

---

## **Testing Checklist**

After deployment, verify:

- [ ] Frontend loads at netlify.app URL
- [ ] Backend health check works
- [ ] Can login with demo credentials
- [ ] Can create a meeting
- [ ] Can add an action item
- [ ] Can view action items
- [ ] Refresh page - data persists
- [ ] Can logout and login again
- [ ] Dashboard shows metrics

---

## **If Something Breaks**

### Backend not responding
```bash
# Check Heroku logs
heroku logs --tail --app=[APP_NAME]
```

### Frontend won't load
- Check browser console (F12)
- Check Netlify build logs (Site settings → Build history)

### API calls failing
- Verify `VITE_API_URL` environment variable
- Check CORS settings in backend

---

## **Success Criteria**

✅ Frontend deployed and accessible  
✅ Backend deployed and responding  
✅ Frontend can communicate with backend  
✅ Can login and use all features  
✅ Data persists across page refreshes  

---

## **Next Steps After Deployment**

1. **Monitor**: Check Heroku and Netlify dashboards regularly
2. **Custom Domain**: Add your own domain (optional)
3. **SSL Certificate**: Auto-configured by Netlify/Heroku
4. **Backups**: Configure database backups
5. **CI/CD**: Auto-deploys on git push

---

## **Helpful Commands**

```bash
# Check Heroku app status
heroku ps --app=[APP_NAME]

# View Heroku logs
heroku logs --tail --app=[APP_NAME]

# Update Heroku config variable
heroku config:set KEY=VALUE --app=[APP_NAME]

# Restart Heroku app
heroku restart --app=[APP_NAME]
```

---

**Ready to deploy? Follow DEPLOY_TO_PRODUCTION.md next!** 🚀
