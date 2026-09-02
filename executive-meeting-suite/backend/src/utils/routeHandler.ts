import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

type Handler = (req: any, res: Response) => Promise<any>;

export const route = (handler: Handler) => async (req: any, res: Response) => {
  try {
    const result = await handler(req, res);
    if (!res.headersSent) res.json(result || { success: true });
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || 'Server error';
    res.status(status).json({ error: message });
  }
};

export const createRouter = () => Router();
