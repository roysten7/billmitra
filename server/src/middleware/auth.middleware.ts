import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        // Get user from token
        const user = await pool.query(
          'SELECT id, name, email, role FROM users WHERE id = $1',
          [decoded.id]
        );

        if (user.rows.length === 0) {
          return res.status(401).json({ message: 'Not authorized' });
        }

        req.user = user.rows[0];
        next();
      } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
