# Executive Meeting Suite - API Documentation

## Authentication

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CHIEF_OF_STAFF",
    "fullName": "User Name",
    "divisionId": "uuid"
  }
}
```

## Meetings

### Get All Meetings
```
GET /api/meetings
Authorization: Bearer <token>

Response 200:
{
  "meetings": [...],
  "total": 10
}
```

### Get Meeting Details
```
GET /api/meetings/:id
Authorization: Bearer <token>

Response 200:
{
  "id": "uuid",
  "title": "Meeting Title",
  "meeting_date": "2026-09-02",
  "location": "Conference Room",
  ...
}
```

## Action Items

### Get Action Items
```
GET /api/action-items?meetingId=<id>
Authorization: Bearer <token>

Response 200:
{
  "actionItems": [...],
  "total": 5
}
```

### Send Email with Attachments
```
POST /api/action-items/send-emails
Authorization: Bearer <token>
Content-Type: application/json

{
  "actionItemIds": ["uuid1", "uuid2"],
  "excelBase64": "base64_string",
  "pdfBase64": "base64_string"
}

Response 200:
{
  "message": "Emails sent successfully",
  "successCount": 2,
  "failureCount": 0,
  "total": 2
}
```

## Error Responses

All error responses follow this format:

```
{
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation failed)
- 401: Unauthorized (no token or invalid token)
- 403: Forbidden (access denied)
- 404: Not Found
- 409: Conflict (duplicate)
- 422: Unprocessable (invalid data)
- 500: Server Error

## Rate Limiting

- **Limit**: 100 requests per 15 minutes
- **Header**: X-RateLimit-Remaining
- **Error**: 429 Too Many Requests

## Security Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

