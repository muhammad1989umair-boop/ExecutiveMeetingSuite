import { Request, Response, NextFunction } from 'express';

export const validateEmail = (email: any): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password: any): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

export const validateUUID = (id: any): boolean => {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuid.test(id);
};

export const validateBody = (required: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of required) {
      if (!(field in req.body) || req.body[field] === '') {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    next();
  };
};

export const sanitizeString = (str: string): string => {
  return String(str)
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, 500); // Limit length
};
