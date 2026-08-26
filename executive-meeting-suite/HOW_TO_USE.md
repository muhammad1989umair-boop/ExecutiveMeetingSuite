# Executive Meeting Suite - User Guide

## Quick Start

Double-click **"Executive Meeting Suite"** shortcut on your Desktop to launch the application.

### Login Credentials
- **Email:** `umair.ilyas@gatronova.com`
- **Password:** `demo123`

---

## Features

### 📊 Dashboard
- View real-time metrics on your action items
- Track **Total Items**, **Open Items**, **Closed Items**, and **Completion Rate**
- Everything updates instantly as you make changes

### 📅 Meetings
- Create new meetings with a title and date
- View all your meetings in one place
- See how many action items are linked to each meeting

### ✅ Action Items
- Track all action items with status (Open/Closed)
- See due dates and who is assigned to each item
- Sample data includes 3 action items to demonstrate functionality

---

## How to Use

1. **Start the App**: Double-click the desktop shortcut
   - This will automatically start the server and open your browser
   - Keep the command window open while using the app

2. **Navigate**: Use the sidebar on the left to switch between Dashboard, Meetings, and Action Items

3. **Create Meeting**: Click "+ New Meeting" on the Meetings page and enter a title

4. **Logout**: Click the Logout button at any time to return to the login screen

---

## Technical Details

**What's Running?**
- A simple Node.js HTTP server on port 5000
- All data is stored in your browser's local storage (persistent)
- No internet connection required

**Browser Compatibility**
- Works on Chrome, Firefox, Edge, Safari
- Any modern browser will work

---

## Troubleshooting

**App won't start?**
- Make sure Node.js is installed on your computer
- Try running `QUICK_START.bat` manually from the folder

**Data not saving?**
- Check that your browser allows local storage
- This app stores everything locally on your device

**Port 5000 already in use?**
- Edit `server.js` and change `const PORT = 5000;` to a different number like `8000`
- Then update the startup script accordingly

---

## Support

The application is ready to use and fully functional!
All your meeting data and action items are automatically saved in your browser.
