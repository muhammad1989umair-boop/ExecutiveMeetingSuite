# Executive Meeting Suite - Best Practices & Guidelines

## Backend DO's ✅

### Authentication & Authorization
- ✅ Always validate JWT tokens before accessing protected routes
- ✅ Use role-based access control (RBAC) for authorization
- ✅ Implement proper logout by token invalidation
- ✅ Use secure password hashing (bcryptjs)
- ✅ Set secure JWT expiration (7 days)

### Database
- ✅ Always use parameterized queries to prevent SQL injection
- ✅ Create indexes on frequently queried columns
- ✅ Use transactions for multi-statement operations
- ✅ Validate input before database operations
- ✅ Use proper data types (UUID for IDs, TIMESTAMP for dates)

### API Design
- ✅ Return appropriate HTTP status codes
- ✅ Validate request body data
- ✅ Limit request body size (10MB max)
- ✅ Use rate limiting for all endpoints
- ✅ Return consistent error format
- ✅ Document all endpoints with request/response formats

### Security
- ✅ Use HTTPS only (enforced by ngrok/production)
- ✅ Enable helmet() for security headers
- ✅ Set CORS to specific origin only
- ✅ Validate file uploads (if needed)
- ✅ Use environment variables for secrets
- ✅ Log security events (logins, access denied)

### Error Handling
- ✅ Catch all errors and return proper responses
- ✅ Don't expose internal error details to client
- ✅ Log errors for debugging
- ✅ Use consistent error response format

## Backend DON'Ts ❌

### Never
- ❌ Use "any" type in TypeScript (use proper types)
- ❌ Store passwords in plain text
- ❌ Expose sensitive data in logs
- ❌ Skip input validation
- ❌ Use dynamic SQL queries (raw string concatenation)
- ❌ Return stack traces to client
- ❌ Use console.log for errors (use structured logging)
- ❌ Skip authentication on protected routes
- ❌ Trust client-side validation only
- ❌ Increase rate limits without security review

## Frontend DO's ✅

### State Management
- ✅ Use Zustand for global state
- ✅ Keep state minimal and derived
- ✅ Lift state to nearest common parent
- ✅ Use context for auth/user data
- ✅ Memoize expensive computations

### Components
- ✅ Use functional components with hooks
- ✅ Split large components into smaller ones
- ✅ Use proper component composition
- ✅ Implement loading states
- ✅ Handle error states gracefully
- ✅ Use semantic HTML

### User Experience
- ✅ Show loading indicators for async operations
- ✅ Display error messages clearly
- ✅ Provide success feedback
- ✅ Disable buttons during loading
- ✅ Validate form inputs before submission
- ✅ Use toast notifications for feedback

### Performance
- ✅ Use React.memo for expensive components
- ✅ Lazy load routes
- ✅ Optimize images and assets
- ✅ Minimize re-renders
- ✅ Use useCallback for event handlers

### Security
- ✅ Validate all user input
- ✅ Sanitize user data before rendering
- ✅ Store tokens securely (sessionStorage, not localStorage)
- ✅ Clear auth state on logout
- ✅ Use HTTPS only
- ✅ Implement CSRF protection

## Frontend DON'Ts ❌

### Never
- ❌ Trust server responses without validation
- ❌ Store sensitive data in localStorage
- ❌ Use eval() or dangerouslySetInnerHTML
- ❌ Embed credentials in code
- ❌ Skip authentication checks before showing pages
- ❌ Use string concatenation for URLs with params
- ❌ Ignore console errors in production
- ❌ Make unencrypted HTTP requests
- ❌ Store passwords anywhere on client
- ❌ Disable security features for convenience

## General Best Practices

### Code Organization
- ✅ Single Responsibility Principle (SRP)
- ✅ DRY (Don't Repeat Yourself)
- ✅ Clear naming conventions
- ✅ Proper file/folder structure
- ✅ Consistent code style

### Documentation
- ✅ Document complex functions
- ✅ Keep README updated
- ✅ Document API endpoints
- ✅ Use type annotations (TypeScript)
- ✅ Comment the WHY, not the WHAT

### Testing
- ✅ Write tests for critical paths
- ✅ Test edge cases
- ✅ Test error scenarios
- ✅ Maintain test coverage >80%

### Deployment
- ✅ Use environment variables for config
- ✅ Never commit secrets
- ✅ Use health checks
- ✅ Monitor logs and errors
- ✅ Have rollback plan

---

**Severity Levels:**
- 🔴 **CRITICAL**: Security/Data loss risk
- 🟠 **HIGH**: Functionality/Performance impact
- 🟡 **MEDIUM**: Code quality/Maintainability
- 🟢 **LOW**: Minor improvements

