import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error for server admin
  console.error(err);

  res.status(statusCode);
  res.json({
    message: err.message,
    // Hide stack trace in production for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};