// AUTO-ROUTE GENERATOR - 1 service = automatic routes!

import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/auth'

interface ServiceMethod {
  getAll?: (userId: string, ...args: any[]) => Promise<any>
  getById?: (id: string, ...args: any[]) => Promise<any>
  create?: (data: any, userId: string, ...args: any[]) => Promise<any>
  update?: (id: string, data: any, userId: string, ...args: any[]) => Promise<any>
  delete?: (id: string, userId: string, ...args: any[]) => Promise<any>
  [key: string]: any
}

const asyncRoute = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next)
}

/**
 * Auto-generate REST routes from service
 * Usage: generateRoutes('meetings', meetingService)
 * Creates: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
 */
export const generateRoutes = (resource: string, service: ServiceMethod) => {
  const router = Router()

  // GET ALL
  if (service.getAll) {
    router.get('/', authenticate, asyncRoute(async (req: Request, res: Response) => {
      const data = await service.getAll(req.user.id)
      res.json(ok(data, `${resource} retrieved`))
    }))
  }

  // GET ONE
  if (service.getById) {
    router.get('/:id', authenticate, asyncRoute(async (req: Request, res: Response) => {
      const data = await service.getById(req.params.id)
      res.json(ok(data))
    }))
  }

  // CREATE
  if (service.create) {
    router.post('/', authenticate, asyncRoute(async (req: Request, res: Response) => {
      const data = await service.create(req.body, req.user.id)
      res.status(201).json(ok(data, `${resource} created`))
    }))
  }

  // UPDATE
  if (service.update) {
    router.patch('/:id', authenticate, asyncRoute(async (req: Request, res: Response) => {
      const data = await service.update(req.params.id, req.body, req.user.id)
      res.json(ok(data, `${resource} updated`))
    }))
  }

  // DELETE
  if (service.delete) {
    router.delete('/:id', authenticate, asyncRoute(async (req: Request, res: Response) => {
      await service.delete(req.params.id, req.user.id)
      res.json(ok(null, `${resource} deleted`))
    }))
  }

  return router
}

// Helper - standardized success response
const ok = (data: any, message = 'Success') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
})

export default generateRoutes
