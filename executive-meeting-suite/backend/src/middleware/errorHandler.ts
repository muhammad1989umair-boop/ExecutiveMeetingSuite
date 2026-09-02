import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Server error';
  console.error(message);
  res.status(status).json({ error: message });
};
