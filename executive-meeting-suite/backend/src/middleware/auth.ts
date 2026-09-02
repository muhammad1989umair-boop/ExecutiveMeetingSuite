import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP, ERROR } from '../utils/constants';
import { logger, logSecurity } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CHIEF_OF_STAFF' | 'DIVISIONAL_HEAD' | 'VIEWER';
    divisionId?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurity('AUTH', 'UNKNOWN', 'FAILED');
      return res.status(HTTP.UNAUTHORIZED).json({ error: ERROR.NO_TOKEN });
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET not configured');
      return res.status(HTTP.SERVER_ERROR).json({ error: ERROR.SERVER_ERROR });
    }

    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded;
    logSecurity('AUTH', decoded.email, 'SUCCESS');
    next();
  } catch (error: any) {
    logger.warn('Authentication failed', error.message);
    res.status(HTTP.UNAUTHORIZED).json({ error: ERROR.INVALID_TOKEN });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
