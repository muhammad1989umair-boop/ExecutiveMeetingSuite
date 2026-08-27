// SIMPLIFIED DASHBOARD ROUTES - 25 lines instead of 100!

import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../../middleware/auth'
import { dashboardService } from '../../utils/dashboardService'
import { successResponse } from '../../utils/response'

const router = Router()

const asyncRoute = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next)
}

// GET ALL METRICS
router.get('/metrics', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const metrics = await dashboardService.getMetrics()
  res.json(successResponse(metrics))
}))

// GET PRIORITY BREAKDOWN
router.get('/priority', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const data = await dashboardService.getPriorityBreakdown()
  res.json(successResponse(data))
}))

// GET TIMELINE
router.get('/timeline', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const data = await dashboardService.getTimeline()
  res.json(successResponse(data))
}))

// GET RECENT ACTIVITY
router.get('/activity', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const data = await dashboardService.getRecentActivity()
  res.json(successResponse(data))
}))

export default router
