"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const { validationResult } = require('express-validator');
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
    // Default to 500 if status code is not set
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    // Handle validation errors from express-validator
    if (err.name === 'ValidationError' || err.errors) {
        const errors = {};
        // Check if this is an express-validator error
        const validationErrors = err.errors || [];
        validationErrors.forEach((e) => {
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
    if (err instanceof errors_1.CustomError) {
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
        const internalError = new errors_1.InternalServerError();
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
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
