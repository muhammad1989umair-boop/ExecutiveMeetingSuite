// SIMPLIFIED AUTH ROUTES - Much cleaner!
// This shows how routes SHOULD be written

import { Router, Request, Response, NextFunction } from 'express'
import { successResponse, errorResponse, validationError } from '../../utils/response'
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators'
import { authenticate } from '../../middleware/auth'
import { authService } from '../../utils/authService'

const router = Router()

// Helper: Async route wrapper
const asyncRoute = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next)
}

// ============================================================================
// COMPARE OLD vs NEW:
// ============================================================================

// OLD: 50+ lines with repetitive error handling
// NEW: 5 lines!

// Login
router.post('/login', asyncRoute(async (req: Request, res: Response) => {
  const { email, password } = req.body

  // Simple validation
  const errors = [
    !validateRequired(email) && 'email',
    !validateEmail(email) && 'email format',
    !validateRequired(password) && 'password',
    !validatePassword(password) && 'password length'
  ].filter(Boolean)

  if (errors.length > 0) {
    return res.status(422).json(validationError('Invalid input', errors))
  }

  // Just call the service - error handling is automatic!
  const result = await authService.login(email, password)
  res.json(successResponse(result, 'Login successful'))
}))

// Get current user
router.get('/profile', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user.id)
  res.json(successResponse(user, 'Profile retrieved'))
}))

export default router

// ============================================================================
// BENEFITS OF THIS APPROACH:
// ============================================================================
// ✅ 60% less code
// ✅ No repetitive try-catch
// ✅ Centralized error handling
// ✅ Consistent response format
// ✅ Easy to read and maintain
// ✅ Consistent validation
// ✅ Automatic error middleware catches everything
// ============================================================================
