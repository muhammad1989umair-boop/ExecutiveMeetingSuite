// SIMPLIFIED MEETINGS ROUTES - 40 lines instead of 150!

import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../../middleware/auth'
import { meetingService } from '../../utils/meetingService'
import { successResponse } from '../../utils/response'

const router = Router()

const asyncRoute = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next)
}

// LIST ALL MEETINGS
router.get('/', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const meetings = await meetingService.getAll(req.user.id)
  res.json(successResponse(meetings, `${meetings.length} meetings found`))
}))

// GET ONE MEETING
router.get('/:id', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const meeting = await meetingService.getById(req.params.id)
  res.json(successResponse(meeting))
}))

// CREATE MEETING
router.post('/', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const meeting = await meetingService.create(req.body, req.user.id)
  res.status(201).json(successResponse(meeting, 'Meeting created'))
}))

// UPDATE MEETING
router.patch('/:id', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const meeting = await meetingService.update(req.params.id, req.body, req.user.id)
  res.json(successResponse(meeting, 'Meeting updated'))
}))

// DELETE MEETING
router.delete('/:id', authenticate, asyncRoute(async (req: Request, res: Response) => {
  const result = await meetingService.delete(req.params.id, req.user.id)
  res.json(successResponse(result, 'Meeting deleted'))
}))

export default router
