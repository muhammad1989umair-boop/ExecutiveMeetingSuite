// AUTO-DOCUMENTATION GENERATOR

export const generateDocs = () => {
  return `
# Executive Meeting Suite API Documentation

## Authentication
All endpoints require JWT token in Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Endpoints

### Meetings
- **GET** /api/meetings - List all meetings
- **GET** /api/meetings/:id - Get specific meeting
- **POST** /api/meetings - Create meeting
- **PATCH** /api/meetings/:id - Update meeting
- **DELETE** /api/meetings/:id - Delete meeting

### Action Items
- **GET** /api/action-items - List all action items
- **GET** /api/action-items/:id - Get specific action item
- **POST** /api/action-items - Create action item
- **PATCH** /api/action-items/:id - Update action item
- **DELETE** /api/action-items/:id - Delete action item

### Dashboard
- **GET** /api/dashboard/metrics - Get metrics
- **GET** /api/dashboard/priority - Get priority breakdown
- **GET** /api/dashboard/timeline - Get timeline
- **GET** /api/dashboard/activity - Get recent activity

### Health
- **GET** /health - Health check
- **GET** /health/status - Detailed health status
- **GET** /metrics - Performance metrics

## Response Format

All successful responses:
\`\`\`json
{
  "success": true,
  "message": "Resource retrieved",
  "data": { /* response data */ },
  "timestamp": "2026-08-27T12:00:00Z"
}
\`\`\`

## Error Handling

All errors include:
\`\`\`json
{
  "success": false,
  "message": "Error description",
  "status": 400,
  "timestamp": "2026-08-27T12:00:00Z"
}
\`\`\`

## Login

\`\`\`
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

Response includes JWT token for use in Authorization header.

## Created By
Auto-generated documentation
`
}

export const serveDocumentation = (app: any) => {
  app.get('/api/docs', (req: any, res: any) => {
    res.type('text/markdown').send(generateDocs())
  })
  app.get('/api/docs.html', (req: any, res: any) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>API Documentation</title></head>
        <body style="font-family: Arial; margin: 40px;">
          <pre>${generateDocs().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `)
  })
}
