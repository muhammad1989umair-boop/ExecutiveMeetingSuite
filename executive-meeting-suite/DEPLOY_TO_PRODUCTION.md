# 🚀 PRODUCTION DEPLOYMENT GUIDE
## Netlify + Heroku + Firebase

---

## **STEP 1: Prepare Your Code**

### 1.1 Update Frontend API URLs

Edit `frontend/src/hooks/useApi.ts`:

```typescript
// Change the API base URL to your Heroku backend
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';
```

### 1.2 Verify Build Configuration

Frontend `vite.config.ts` should have:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

### 1.3 Backend Health Check

Ensure `backend/src/server.ts` has:
```typescript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})
```

---

## **STEP 2: Deploy Frontend to Netlify**

### 2.1 Create Netlify Account
1. Go to **https://netlify.com**
2. Click **Sign up**
3. Choose **GitHub** (easiest)

### 2.2 Connect GitHub Repository
1. Click **New site from Git**
2. Select **GitHub**
3. Find **executive-meeting-suite** repo
4. Click **Deploy site**

### 2.3 Configure Build Settings
Netlify should auto-detect:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

If not, set manually:
1. Go to **Site settings** → **Build & deploy**
2. Click **Edit settings**
3. Set Build command: `cd frontend && npm run build`
4. Set Publish directory: `frontend/dist`

### 2.4 Set Environment Variables
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-heroku-backend.herokuapp.com`

### 2.5 Deploy
- Push to GitHub: `git push`
- Netlify auto-deploys
- Your site goes live at: `your-app-name.netlify.app`

---

## **STEP 3: Deploy Backend to Heroku**

### 3.1 Create Heroku Account
1. Go to **https://heroku.com**
2. Click **Sign up**
3. Verify email

### 3.2 Create App
1. Click **New** → **Create new app**
2. Name: `executive-meeting-suite-api` (or your choice)
3. Region: Choose closest to you
4. Click **Create app**

### 3.3 Connect GitHub
1. Go to **Deploy** tab
2. Click **Connect to GitHub**
3. Search for **executive-meeting-suite**
4. Click **Connect**

### 3.4 Configure Environment Variables
1. Go to **Settings** tab
2. Click **Reveal Config Vars**
3. Add:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: `production`
   - `PORT`: `5000`

### 3.5 Deploy
1. Go to **Deploy** tab
2. Under **Manual deploy**, click **Deploy Branch**
3. Wait for build to complete
4. Your backend is live at: `your-app-name-api.herokuapp.com`

### 3.6 Test Backend
Visit: `https://your-app-name-api.herokuapp.com/api/health`

Should return: `{"status":"ok"}`

---

## **STEP 4: Set Up Firebase (Optional but Recommended)**

Firebase provides free tier for:
- Authentication
- File storage
- Real-time database

### 4.1 Create Firebase Project
1. Go to **https://firebase.google.com**
2. Click **Go to console**
3. Click **Create project**
4. Name: `executive-meeting-suite`
5. Accept terms, click **Continue**

### 4.2 Create Web App
1. In Firebase console, click **</> (Web)**
2. Register app name
3. Copy the config object
4. Create `frontend/.env.firebase`:
   ```
   VITE_FIREBASE_API_KEY=xxx
   VITE_FIREBASE_AUTH_DOMAIN=xxx
   VITE_FIREBASE_PROJECT_ID=xxx
   VITE_FIREBASE_STORAGE_BUCKET=xxx
   VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
   VITE_FIREBASE_APP_ID=xxx
   ```

### 4.3 Enable Services
In Firebase console:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Go to **Firestore Database**
4. Click **Create database**
5. Start in **production mode**

### 4.4 Initialize in App (Optional)
Install Firebase:
```bash
cd frontend
npm install firebase
```

---

## **STEP 5: Connect Everything**

### Update Frontend `.env.production`
```
VITE_API_URL=https://your-heroku-backend.herokuapp.com
VITE_FIREBASE_API_KEY=xxx
```

### Test Connection
1. Deployed frontend at: `your-app.netlify.app`
2. Login with: `umair.ilyas@gatronova.com` / `demo123`
3. Create a meeting
4. Add an action item
5. Verify data appears

---

## **STEP 6: Custom Domain (Optional)**

### Netlify Custom Domain
1. Go to **Site settings** → **Domain settings**
2. Click **Add custom domain**
3. Enter your domain
4. Follow DNS instructions

### Heroku Custom Domain
1. Go to **Settings** → **Domains**
2. Click **Add domain**
3. Follow DNS instructions

---

## **⚡ Quick Summary**

| Service | URL | Purpose |
|---------|-----|---------|
| **Netlify** | your-app.netlify.app | Frontend hosting |
| **Heroku** | your-api.herokuapp.com | Backend API |
| **Firebase** | console.firebase.google.com | Optional: Auth, storage, DB |

---

## **🧪 Testing Checklist**

- [ ] Frontend deploys without errors
- [ ] Backend API responds at `/api/health`
- [ ] Can login on deployed frontend
- [ ] Can create meetings
- [ ] Can add action items
- [ ] Data persists (refresh page)
- [ ] Can filter action items

---

## **🔧 Troubleshooting**

### Frontend Won't Build
```bash
cd frontend
npm run build
```
Check for TypeScript errors.

### Backend Not Starting
```bash
heroku logs --tail
```
Check environment variables and database connection.

### API Calls Failing
- Verify `VITE_API_URL` is set correctly
- Check Netlify environment variables
- Test backend health: `curl https://your-api.herokuapp.com/api/health`

---

## **📚 Helpful Links**

- Netlify: https://netlify.com
- Heroku: https://heroku.com
- Firebase: https://firebase.google.com
- GitHub: https://github.com

---

## **✅ You're Live!**

Once all steps complete:
- Frontend: **your-app.netlify.app** ✅
- Backend: **your-api.herokuapp.com** ✅
- Your app is accessible worldwide! 🌍

Enjoy! 🚀
