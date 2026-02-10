import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../schemas';

// Extend Express Request to include User
export interface AuthRequest extends Request {
  user?: any;
}

// Protect routes - Verify JWT
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // Access headers safely dealing with type definition issues
  const headers = (req as any).headers;

  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer <token>)
      token = headers.authorization.split(' ')[1];

      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Manager role check
export const managerOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'MANAGER') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Managers only' });
  }
};