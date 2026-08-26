# Executive Meeting Suite (EMS)

A comprehensive, modern web application for managing executive meetings, tracking action items, and ensuring accountability across organizational divisions. Built for the Gatronova Group and Novatex Limited.

## 🎯 Overview

The Executive Meeting Suite is a powerful tool designed specifically for Chief of Staff and executives who need to:

- **Create and manage executive meetings** with audio recording capabilities
- **Assign and track action items** with automatic email notifications
- **Monitor action item status** with a comprehensive dashboard
- **Manage divisional heads** with role-based access control
- **Track responses and progress** with file uploads and approvals
- **Generate insights** with analytics and filtering capabilities

## ✨ Key Features

### 🎤 Meeting Management
- Create meetings with date, time, location, and attendees
- Record audio during meetings (coming soon: AI transcription)
- Add meeting notes and descriptions
- Track action items per meeting
- View meeting history and metrics

### 📋 Action Item Tracking
- Create action items with clear ownership and deadlines
- Set priority levels (High, Medium, Low)
- Automatic email notifications to responsible parties
- Real-time status tracking (Open, In Progress, Pending Review, Completed, Closed)
- Track target dates and identify overdue items
- File upload support for responses and documents

### 📊 Advanced Dashboard
- Real-time metrics on action item status
- Visual charts for priority distribution
- Division-wise breakdown
- Completion rate tracking
- Recent activity feed
- Customizable filters and search

### 🔐 Role-Based Access Control
- **Chief of Staff**: Full access to create meetings, assign action items, review responses, manage settings
- **Divisional Head**: View assigned action items, submit responses, upload files
- **Viewer**: Read-only access to dashboard and public information

### 🏢 Multi-Division Support
- Manage multiple companies/divisions in the conglomerate
- Assign action items by division
- Division heads see only their assigned items
- Company-level organization and filtering

### 📧 Email Notifications
- Automatic emails when action items are assigned
- Follow-up reminders for pending items
- Status update notifications
- Email logs for audit trail

### 📱 Responsive Design
- Desktop, tablet, and mobile optimized
- Beautiful modern UI with gradient designs
- Real-time updates with WebSocket support
- Dark/Light mode ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
```bash
cd executive-meeting-suite
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Configure your database and email
# Edit .env with your settings
```

3. **Database Setup**
```bash
# Create database
createdb executive_meeting_suite

# Run migrations
npm run db:migrate
npm run db:seed
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

5. **Start Development Servers**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

The application will open at `http://localhost:3000`

## 📖 Usage

### Creating a Meeting (Chief of Staff)
1. Navigate to "Meetings" section
2. Click "New Meeting"
3. Fill in title, date/time, location, and attendees
4. Submit to create the meeting
5. Add notes and record audio if needed

### Creating Action Items
1. From a meeting, click "Add Action Item"
2. Enter title, description, and target date
3. Select responsible divisional head
4. Set priority level
5. Submit - email automatically sent to assignee

### Tracking Action Items
1. Navigate to "Action Items"
2. Use filters to view by status, priority, division
3. Click on an item to view details
4. Divisional heads can submit responses
5. Chief of Staff reviews and closes items

### Managing Divisional Heads
1. Go to Settings (Chief of Staff only)
2. Add new divisional heads with name, email, title
3. Assign to divisions/companies
4. They automatically get access to relevant action items

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.io
- **Charts**: Chart.js with React-ChartJS-2
- **UI Components**: Lucide React icons

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **File Upload**: Multer

### Database Schema
- **Users**: User accounts with roles and divisions
- **Meetings**: Executive meeting records
- **Action Items**: Tasks with ownership and deadlines
- **Action Item Responses**: Responses and documents from assignees
- **Email Logs**: Audit trail of notifications
- **Divisions**: Organizational structure

## 📁 Project Structure

```
executive-meeting-suite/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── db/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── config/
│   └── divisional-heads.json
└── README.md
```

## ⚙️ Configuration

### Environment Variables (Backend .env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=executive_meeting_suite
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=http://localhost:3000
```

### Divisional Heads Configuration (config/divisional-heads.json)
```json
{
  "divisions": [
    {
      "id": "div-001",
      "name": "Energy & Power",
      "company": "Novatex Energy Ltd",
      "heads": [
        {
          "id": "head-001",
          "name": "Ahmed Hassan Khan",
          "title": "CEO",
          "email": "ahmed@example.com"
        }
      ]
    }
  ]
}
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-Based Access Control**: Fine-grained permissions
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configurable cross-origin access
- **Rate Limiting**: Prevent abuse (ready to implement)
- **Audit Logs**: Track all email notifications

## 📊 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create user account

### Meetings
- `GET /api/meetings` - List all meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:id` - Get meeting details
- `PATCH /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Action Items
- `GET /api/action-items` - List action items
- `POST /api/action-items` - Create action item
- `PATCH /api/action-items/:id` - Update status
- `POST /api/action-items/:id/response` - Submit response
- `GET /api/action-items/:id/responses` - Get responses

### Dashboard
- `GET /api/dashboard/metrics` - Get metrics
- `GET /api/dashboard/timeline` - Get timeline data
- `GET /api/dashboard/activity` - Get recent activity

### Divisional Heads
- `GET /api/divisional-heads/divisions` - List divisions
- `POST /api/divisional-heads/divisions` - Create division
- `GET /api/divisional-heads/heads` - List heads
- `POST /api/divisional-heads/heads` - Add head

## 🎨 UI/UX Highlights

- **Modern Gradient Design**: Blue to Cyan gradient theme
- **Smooth Animations**: Transitions and hover effects
- **Responsive Layout**: Mobile-first approach
- **Accessible Components**: WCAG compliant
- **Dark Mode Ready**: CSS variables for theming
- **Real-time Updates**: WebSocket push notifications
- **Beautiful Charts**: Data visualizations with Chart.js
- **Icon Library**: Lucide React for consistent iconography

## 📈 Deployment

### Docker (Coming Soon)
```bash
docker-compose up
```

### Heroku / Railway
1. Set environment variables in platform dashboard
2. Push to main branch
3. Automatic deployment

### AWS / Azure / GCP
Refer to cloud provider documentation for Node.js and PostgreSQL deployment

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DB credentials in .env
- Verify database exists: `createdb executive_meeting_suite`

### Email Not Sending
- Check email credentials in .env
- Enable "Less secure app access" for Gmail
- Use app password instead of regular password
- Check spam/junk folder

### Frontend Can't Connect to Backend
- Ensure backend is running on port 5000
- Check CORS configuration in backend
- Verify API_BASE URL in frontend environment

## 🤝 Contributing

This is a proprietary application for Gatronova Group. Internal contributions welcome!

## 📄 License

PROPRIETARY - Gatronova Group / Novatex Limited

## 📞 Support

For issues and support:
- Contact: IT Department
- Email: support@gatronova.com
- Internal Wiki: [Coming Soon]

## 🎉 Version History

### v1.0.0 (Current)
- Initial release
- Core features: Meetings, Action Items, Dashboard
- Role-based access control
- Email notifications
- Divisional head management

### Planned Features
- Audio transcription (AI-powered)
- Advanced reporting and exports
- Mobile app
- Integration with calendar systems
- Automated follow-ups
- Performance analytics
- Custom workflows

---

**Built with ❤️ for Gatronova Group | © 2024 Novatex Limited**
