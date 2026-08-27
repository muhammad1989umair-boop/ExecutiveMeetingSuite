# Executive Meeting Suite - Team Guide

**Status:** ✅ PRODUCTION READY

## 🚀 Quick Start

1. **Start App:** Double-click desktop shortcut `Start EMS.lnk`
2. **Login:** `umair.ilyas@gatronova.com` / `demo123`
3. **Create Action Items:** Assign to any of 16 organizational heads

---

## 📋 Organizational Divisional Heads (16 Total)

### Gatronova Division
| Name | Title | Division | Email |
|------|-------|----------|-------|
| Imran Shah | Supply Chain Head | Supply Chain | imranshah@gatronova.com |
| Aziz Malik | Marketing Head | Marketing | azizmalik@gatronova.com |
| Waseem Rasheed | IT Head | Information Technology | waseem.rasheed@gatronova.com |
| Muhammad Tufail | Finance Head | Finance | muhammad.tufail@gatronova.com |
| Kafeel Zehri | Finance Head | Finance | kafeel.zehri@gatronova.com |
| Shameer Haroon | Legal & Tax Head | Legal and Tax | shameer@gatronova.com |
| Adeel Siddiqui | Finance Head | Finance | adeel.siddiqui@gatronova.com |
| Asif Siddique | Finance Head | Finance | asifsiddique@gatron-novatex.com |
| Ramiz Rahim | Finance Head | Finance | ramiz.rahim@gatron-novatex.com |
| Zubair Chini | Audit Head | Audit | zubair.chini@gatronova.com |
| Shuja Shams | HR Head | Human Resources | shuja.shams@gatronova.com |
| Mustafa Turab | Internal Audit Head | Internal Audit | m.turab@gatron-novatex.com |
| Danish Adamjee | Chief Operating Officer | Executive | aleem.aqeel@bonanzagt.com |
| Wasif | Chief Executive Officer | Executive | wasif.khan@dvago.pk |

### Novatex Division
| Name | Title | Division | Email |
|------|-------|----------|-------|
| Sibt-e-Hasan | Administration Head | Administration | sibtehassan@gatron-novatex.com |
| Haseeb Khan | GM-Plant | Plant Operations | haseebkhan@gatronova.com |

---

## 🎯 Key Features

✅ **Action Items** - Create, assign to divisional heads, track status
✅ **Responsible Person Dropdown** - Auto-synced with Settings page
✅ **Settings Page** - View all 16 organizational heads with details
✅ **Dashboard** - Analytics and overview charts
✅ **Meetings** - Schedule and track executive meetings
✅ **Auto-Save** - All changes persist to PostgreSQL database

---

## 🔑 User Roles

| Role | Permissions |
|------|-------------|
| Chief of Staff | Create action items, assign to anyone |
| Divisional Head | View only assigned items |
| Viewer | Read-only access |

---

## 📱 App URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## 🛠️ System Architecture

**Backend:** Express.js + PostgreSQL (25+ REST API endpoints)
**Frontend:** React + TypeScript + Vite
**Desktop Launcher:** Silent VBScript (no visible windows)
**Database:** Auto-initialized with schema and demo data

---

## ⚡ For Support

If services don't start:
1. Kill old processes: `taskkill /F /IM node.exe`
2. Restart: Double-click `Start EMS.lnk`
3. Seed data: `cd backend && node seed-divisional-heads.js`

---

**Last Updated:** 2026-08-27 | Repository: ExecutiveMeetingSuite
