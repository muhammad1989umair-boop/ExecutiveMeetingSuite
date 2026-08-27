// SIMPLIFIED AUTH ROUTES - 20 lines instead of 150!

import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../../middleware/auth'
import { authService } from '../../utils/authService'
import { successResponse, validationError } from '../../utils/response'
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators'

const router = Router()

// Async wrapper - automatic error handling
const asyncRoute = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next)
}

// LOGIN
router.post('/login', asyncRoute(async (req: Request, res: Response) => {
  const { email, password } = req.body
  const errors = [
    !validateRequired(email) && 'email',
    !validateEmail(email) && 'email format',
    !validateRequired(password) && 'password',
    !validatePassword(password) && 'password'
  ].filter(Boolean)
  if (errors.length > 0) return res.status(422).json(validationError('Invalid input', errors))

  const result = await authService.login(email, password)
  res.json(successResponse(result, 'Login successful'))
}))

// GET PROFILE
router.get('/profile', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user.id)
  res.json(successResponse(user, 'Profile retrieved'))
}))

export default router
