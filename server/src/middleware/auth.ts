import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: any; // Using 'any' to avoid type conflicts with other type declarations
    }
  }
}

// Define the user type for type safety
interface AuthUser {
  id: number;
  email: string;
  role: string;
  restaurant_id?: number;
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== PROTECT DEBUG ===');
    console.log('Authorization header:', req.headers.authorization);
    
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No Bearer token found');
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token after Bearer');
      throw new UnauthorizedError('No token provided');
    }

    console.log('Token found:', token.substring(0, 20) + '...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    console.log('Token decoded, user ID:', decoded.id);
    
    // Get user from database
    const { rows } = await pool.query(
      'SELECT id, email, role, restaurant_id FROM users WHERE id = $1',
      [decoded.id]
    );

    console.log('Database query result:', rows);

    if (rows.length === 0) {
      console.log('No user found in database');
      throw new UnauthorizedError('User not found');
    }

    // Check if user is active
    // Note: Add an 'is_active' column to your users table if you want to implement this
    // if (!rows[0].is_active) {
    //   throw new UnauthorizedError('User account is deactivated');
    // }

    // Attach user to request object with proper typing
    req.user = rows[0] as AuthUser;
    console.log('User attached to request:', req.user);
    next();
  } catch (error) {
    console.error('Protect middleware error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to restrict access to specific roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('=== AUTHORIZE DEBUG ===');
    console.log('Request user:', req.user);
    console.log('User role:', req.user?.role);
    console.log('Required roles:', roles);
    console.log('User has required role:', req.user ? roles.includes(req.user.role) : false);
    
    if (!req.user) {
      console.log('No user found in request');
      throw new UnauthorizedError('Not authorized to access this route');
    }

    if (!roles.includes(req.user.role)) {
      console.log(`User role ${req.user.role} not in allowed roles: ${roles.join(', ')}`);
      throw new ForbiddenError(
        `User role ${req.user.role} is not authorized to access this route`
      );
    }

    console.log('Authorization successful');
    next();
  };
};

/**
 * Middleware to check if the user is the owner of the restaurant
 */
export const isRestaurantOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Not authorized to access this route');
    }

    // If user is super admin, bypass ownership check
    if (req.user?.role === 'super_admin') {
      return next();
    }

    // For restaurant admins, check if they belong to the restaurant
    const { rows } = await pool.query(
      'SELECT id FROM restaurants WHERE id = $1 AND created_by = $2',
      [restaurantId, userId]
    );

    if (rows.length === 0) {
      throw new ForbiddenError('Not authorized to access this restaurant');
    }

    next();
  } catch (error) {
    next(error);
  }
};
