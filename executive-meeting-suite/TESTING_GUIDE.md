# 🧪 Testing & Development Guide

## Current Status

### ✅ FULLY WORKING
- **Dashboard** - All metrics display correctly
- **Meetings** - Full CRUD operations
- **Navigation** - All page routing works
- **Authentication** - Login/logout fully functional
- **Backend API** - All 25+ endpoints responding
- **Database** - PostgreSQL connected and initialized

### ⚠️ IN PROGRESS (Form Submission)
- **Action Items Form** - Renders correctly but submit needs debugging
- Dev server connection occasionally drops

---

## How to Test & Fix

### Step 1: Clean Start Everything
Run this before each testing session:
```bash
# Kill all node processes
taskkill /F /IM node.exe
taskkill /F /IM npm.exe

# Wait 3 seconds, then:
cd "C:\Users\DELL\Desktop\Claude Code\executive-meeting-suite\backend"
npm run dev

# In a NEW terminal:
cd "C:\Users\DELL\Desktop\Claude Code\executive-meeting-suite\frontend"
npm run dev
```

Wait 10 seconds, then open: **http://localhost:3000**

### Step 2: Test Each Feature
1. **Login** ✓ (Works)
   - Email: `umair.ilyas@gatronova.com`
   - Password: `demo123`

2. **Dashboard** ✓ (Works)
   - Click Dashboard in sidebar
   - Should see metrics

3. **Meetings** ✓ (Works)
   - Click Meetings in sidebar
   - Should see "Bonanza Steering Committee"

4. **Action Items** ⚠️ (Form needs fix)
   - Click Action Items in sidebar
   - Form renders but submit might not work
   - Workaround: Use Meeting detail form

### Step 3: Workaround for Adding Items
Until form is fixed, use this approach:
1. Go to **Meetings**
2. Click **"Bonanza Steering Committee"**
3. Use the form there (it's fully functional)
4. Items will appear in Action Items list

---

## Debugging Form Submission

If form submission still fails:
1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Look for errors
4. Check **Network** tab for failed POST requests

Expected behavior:
- Click submit → POST request to `localhost:5000/api/action-items`
- Should return 201 status
- Form should clear
- Item should appear in list

---

## When Fixing Issues

### Clear Cache Strategy
If changes don't appear:
1. **Hard refresh browser**: `Ctrl+Shift+R`
2. **Kill Node processes** and restart dev servers
3. **Check Vite connection** - should show "connected"

### Testing Checklist
- [ ] Backend running (Port 5000)
- [ ] Frontend running (Port 3000)
- [ ] Can login successfully
- [ ] Dashboard loads metrics
- [ ] Meetings page shows data
- [ ] Action Items page renders
- [ ] Form shows all fields
- [ ] Network tab shows POST request on submit

---

## Quick Restart Script

Run this PowerShell command for quick restart:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd `"C:\Users\DELL\Desktop\Claude Code\executive-meeting-suite\backend`" && npm run dev"
Start-Sleep -Seconds 5
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd `"C:\Users\DELL\Desktop\Claude Code\executive-meeting-suite\frontend`" && npm run dev"
```

---

## File Organization for Easy Fixes

Key files to watch when fixing:
```
executive-meeting-suite/
├── frontend/src/pages/ActionItems.tsx  (Form submission logic)
├── backend/src/routes/actionItems.ts   (API endpoint)
├── frontend/src/hooks/useApi.ts        (API calls)
└── TESTING_GUIDE.md                    (This file)
```

---

## Next Steps

1. **Run clean start** (instructions above)
2. **Test login** - should work immediately
3. **Test dashboard** - should display metrics
4. **Test form** - attempt submission and watch Network tab
5. **Report findings** - what POST request shows in Network tab

---

## Questions for Debugging

When form doesn't submit, answer these:
1. Does browser console show any errors?
2. What does Network tab show? (Check for POST request)
3. Is the error on form validation or API call?
4. Are the dev servers running (check terminal windows)?

---

**Remember**: The app IS functional through the meetings form. The Action Items form is the only thing being debugged.
