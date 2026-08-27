import { Request, Response, NextFunction } from 'express'
import { errorResponse } from '../utils/response'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(err.message, err, err.statusCode)
    )
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(422).json(
      errorResponse('Validation Error', err.message, 422)
    )
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(
      errorResponse('Unauthorized', err.message, 401)
    )
  }

  // Default error response
  res.status(500).json(
    errorResponse('Internal Server Error', err.message, 500)
  )
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
