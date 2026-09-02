// HTTP Status Codes
export const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Error Messages
export const ERROR = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  NO_TOKEN: 'No authentication token provided',
  INVALID_TOKEN: 'Invalid or expired token',
  ACCESS_DENIED: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  SERVER_ERROR: 'An error occurred',
  DUPLICATE_EMAIL: 'Email already exists',
  MISSING_FIELDS: 'Missing required fields'
} as const;

// User Roles
export const ROLES = {
  CHIEF_OF_STAFF: 'CHIEF_OF_STAFF',
  DIVISIONAL_HEAD: 'DIVISIONAL_HEAD',
  VIEWER: 'VIEWER'
} as const;

// Action Item Status
export const ACTION_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_REVIEW: 'PENDING_REVIEW',
  FOR_REVIEW: 'FOR_REVIEW',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
} as const;

// JWT Config
export const JWT = {
  EXPIRATION: '7d',
  ALGORITHM: 'HS256'
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
} as const;
