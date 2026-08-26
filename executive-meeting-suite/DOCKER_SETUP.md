# Executive Meeting Suite - Docker Setup Guide

## 🐳 Run Everything with Docker (RECOMMENDED)

This is the **easiest way** to run the entire application without manually installing PostgreSQL.

---

## Prerequisites

You need **Docker Desktop** installed on your Windows machine.

### Download Docker:
https://www.docker.com/products/docker-desktop

### Install Docker:
1. Download Docker Desktop for Windows
2. Run the installer
3. Follow the prompts (default settings are fine)
4. Restart your computer
5. Verify installation:
```bash
docker --version
docker-compose --version
```

---

## Quick Start (3 Commands)

### Open Terminal/PowerShell in the project directory:
```
C:\Users\DELL\Desktop\Claude Code\executive-meeting-suite
```

### Run these commands:

**1. Start Everything:**
```bash
docker-compose up
```

This will:
- ✅ Download PostgreSQL 15 (lightweight Alpine image)
- ✅ Download Node.js 18 (lightweight Alpine image)
- ✅ Create the database automatically
- ✅ Install dependencies
- ✅ Start the backend API
- ✅ Start the frontend dev server
- ✅ Open the app automatically

**2. Wait for startup (2-3 minutes on first run):**
```
[ems_postgres] LOG:  database system is ready to accept connections
[ems_backend] ✓ Server running on port 5000
[ems_backend] ✓ Database connected
[ems_frontend] ➜  Local:   http://localhost:3000
```

**3. Open Browser:**
- Visit: http://localhost:3000
- Login with demo credentials:
  - Email: `umair.ilyas@gatronova.com`
  - Password: `demo123`

---

## That's It! 🎉

The entire application is now running:
- ✅ PostgreSQL database (isolated container)
- ✅ Backend API (port 5000)
- ✅ Frontend (port 3000)
- ✅ All connected and working together

---

## Common Docker Commands

### Stop Everything:
```bash
docker-compose down
```

### Stop but keep database:
```bash
docker-compose stop
```

### Restart:
```bash
docker-compose start
```

### View Logs:
```bash
docker-compose logs -f
```

### View only backend logs:
```bash
docker-compose logs -f backend
```

### View only database logs:
```bash
docker-compose logs -f postgres
```

### Clean everything (remove containers and volumes):
```bash
docker-compose down -v
```

### Rebuild images after code changes:
```bash
docker-compose build
docker-compose up
```

---

## Troubleshooting

### "Docker daemon is not running"
**Solution:** Open Docker Desktop application (it starts the daemon)

### "Port 5000 already in use"
**Solution:**
1. Stop the containers: `docker-compose down`
2. Wait 30 seconds
3. Start again: `docker-compose up`

### "Cannot pull image"
**Solution:** Check your internet connection and try again

### "Database not connected"
**Solution:** The database container takes 10-15 seconds to start
- The app will retry automatically
- If it fails, check: `docker-compose logs postgres`

### "Frontend won't load"
**Solution:** 
- Refresh the page (Ctrl+R)
- Clear browser cache (Ctrl+Shift+Delete)
- Check logs: `docker-compose logs frontend`

---

## What Gets Downloaded

When you run `docker-compose up` for the first time:

| Component | Size | Purpose |
|-----------|------|---------|
| PostgreSQL 15 Alpine | ~200 MB | Database |
| Node.js 18 Alpine | ~150 MB | Runtime |
| Application Code | ~50 MB | Backend & Frontend |
| **Total** | ~400 MB | Complete setup |

After download, the images are cached locally so subsequent runs are instant.

---

## Advanced: Environment Variables

Edit `docker-compose.yml` to change settings:

```yaml
environment:
  DB_HOST: postgres
  DB_PORT: 5432
  DB_USER: postgres
  DB_PASSWORD: postgres
  NODE_ENV: development
  JWT_SECRET: your-secret-key
```

---

## Advanced: Accessing the Database

From inside the container:
```bash
docker-compose exec postgres psql -U postgres -d executive_meeting_suite
```

This opens a PostgreSQL prompt where you can run SQL commands:
```sql
\dt          # List tables
\l           # List databases
SELECT * FROM users;  # View users
```

---

## Advanced: Shell Access

Get a bash shell in any container:
```bash
# Backend shell
docker-compose exec backend sh

# PostgreSQL shell
docker-compose exec postgres sh

# Frontend shell
docker-compose exec frontend sh
```

---

## Cleanup / Uninstall

### Remove Stopped Containers:
```bash
docker system prune
```

### Remove All Docker Data (WARNING - destroys all Docker data):
```bash
docker system prune -a
```

### Just Stop the Specific App:
```bash
docker-compose down
```

All data is preserved in volumes, so you can start again with `docker-compose up`.

---

## Performance Tips

### Reduce Memory Usage:
```bash
# Only run what you need
docker-compose up postgres backend  # No frontend
```

### Run in Background:
```bash
docker-compose up -d   # Detached mode
docker-compose logs -f # View logs
docker-compose down    # Stop
```

### Use Native Linux Containers (Fastest):
If you're running WSL2 (Windows Subsystem for Linux), Docker uses native Linux containers and is very fast!

Check: Docker Desktop > Settings > General > "Use the WSL 2 based engine"

---

## Why Docker?

✅ **No Installation:** PostgreSQL, Node, npm all pre-configured  
✅ **Consistent:** Works on Windows, Mac, Linux identically  
✅ **Isolated:** Application containers don't affect your system  
✅ **Easy Cleanup:** Delete containers, remove everything  
✅ **Production Ready:** Same setup works for production deployment  
✅ **Scalable:** Easy to add more services (Redis, Nginx, etc.)  

---

## Next Steps

1. **Install Docker Desktop** (if not already done)
2. **Run:** `docker-compose up`
3. **Login:** http://localhost:3000
4. **Explore:** Try creating meetings and action items
5. **Read:** Check other documentation files for more info

---

## Support

- **Docker Docs:** https://docs.docker.com/
- **Docker Compose Docs:** https://docs.docker.com/compose/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/15/
- **Node.js Docs:** https://nodejs.org/docs/

---

## Summary

```
                    ┌─────────────────────────────┐
                    │   Your Windows Machine      │
                    └──────────┬──────────────────┘
                               │
                               │ docker-compose up
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   ┌─────────┐         ┌──────────────┐        ┌──────────┐
   │PostgreSQL│        │Backend (API) │        │ Frontend │
   │Database │        │(Port 5000)   │        │(Port 3000)
   │Container│        │Container     │        │Container │
   └─────────┘        └──────────────┘        └──────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                         Isolated Network
                       (all can communicate)
```

Everything runs in isolated containers but can communicate with each other.

---

**Ready?**

```bash
# Just run this one command:
docker-compose up

# Then open: http://localhost:3000
# Login with demo credentials
# Done! 🎉
```

Enjoy the Executive Meeting Suite! 🚀
