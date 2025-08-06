import { Request, Response, NextFunction } from 'express';
const { validationResult } = require('express-validator');
import { CustomError, InternalServerError } from '../utils/errors';

// Define types for express-validator errors
type ValidationError = {
  [key: string]: string[];
};

type ExpressValidationError = {
  param: string;
  msg: string;
  location?: string;
  value?: any;
  nestedErrors?: any[];
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 if status code is not set
  const statusCode = (err as CustomError).statusCode || 500;
  const message = err.message || 'Something went wrong';
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  
  // Handle validation errors from express-validator
  if (err.name === 'ValidationError' || (err as any).errors) {
    const errors: ValidationError = {};
    
    // Check if this is an express-validator error
    const validationErrors = (err as any).errors || [];
    
    validationErrors.forEach((e: ExpressValidationError) => {
      const param = e.param || '_error';
      if (!errors[param]) {
        errors[param] = [];
      }
      errors[param].push(e.msg || 'Validation error');
    });
    
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: Object.keys(errors).length > 0 ? errors : undefined
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: err.message
    });
  }
  
  // Handle custom errors
  if (err instanceof CustomError) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: err.details || undefined,
      ...(process.env.NODE_ENV === 'development' && { stack })
    });
  }
  
  // Handle other errors
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
    error: err.message,
    stack: err.stack
  });
  
  // In production, don't leak error details
  if (process.env.NODE_ENV === 'production') {
    const internalError = new InternalServerError();
    return res.status(internalError.statusCode).json({
      success: false,
      message: internalError.message
    });
  }
  
  // In development, show full error details
  res.status(statusCode).json({
    success: false,
    message,
    error: err.message,
    stack: err.stack
  });
};

export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
