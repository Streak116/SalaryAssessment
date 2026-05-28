import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'Email already exists' });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({ errors: err.errors });
  }

  console.error('[errorHandler]: Unhandled error occurred:', err);

  return res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
}
