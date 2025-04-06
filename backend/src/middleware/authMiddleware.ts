import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extending Express Request type to include the user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      }
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your_jwt_secret'
    ) as { userId: string; email: string };
    
    // Add user from payload to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};