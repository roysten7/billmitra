"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRestaurantOwner = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
    try {
        console.log('=== PROTECT DEBUG ===');
        console.log('Authorization header:', req.headers.authorization);
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            console.log('No Bearer token found');
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('No token after Bearer');
            throw new errors_1.UnauthorizedError('No token provided');
        }
        console.log('Token found:', token.substring(0, 20) + '...');
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded, user ID:', decoded.id);
        // Get user from database
        const { rows } = await db_1.pool.query('SELECT id, email, role, restaurant_id FROM users WHERE id = $1', [decoded.id]);
        console.log('Database query result:', rows);
        if (rows.length === 0) {
            console.log('No user found in database');
            throw new errors_1.UnauthorizedError('User not found');
        }
        // Check if user is active
        // Note: Add an 'is_active' column to your users table if you want to implement this
        // if (!rows[0].is_active) {
        //   throw new UnauthorizedError('User account is deactivated');
        // }
        // Attach user to request object with proper typing
        req.user = rows[0];
        console.log('User attached to request:', req.user);
        next();
    }
    catch (error) {
        console.error('Protect middleware error:', error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errors_1.UnauthorizedError('Token has expired'));
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errors_1.UnauthorizedError('Invalid token'));
        }
        else {
            next(error);
        }
    }
};
exports.protect = protect;
/**
 * Middleware to restrict access to specific roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        var _a;
        console.log('=== AUTHORIZE DEBUG ===');
        console.log('Request user:', req.user);
        console.log('User role:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.role);
        console.log('Required roles:', roles);
        console.log('User has required role:', req.user ? roles.includes(req.user.role) : false);
        if (!req.user) {
            console.log('No user found in request');
            throw new errors_1.UnauthorizedError('Not authorized to access this route');
        }
        if (!roles.includes(req.user.role)) {
            console.log(`User role ${req.user.role} not in allowed roles: ${roles.join(', ')}`);
            throw new errors_1.ForbiddenError(`User role ${req.user.role} is not authorized to access this route`);
        }
        console.log('Authorization successful');
        next();
    };
};
exports.authorize = authorize;
/**
 * Middleware to check if the user is the owner of the restaurant
 */
const isRestaurantOwner = async (req, res, next) => {
    var _a, _b;
    try {
        const { restaurantId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errors_1.UnauthorizedError('Not authorized to access this route');
        }
        // If user is super admin, bypass ownership check
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'super_admin') {
            return next();
        }
        // For restaurant admins, check if they belong to the restaurant
        const { rows } = await db_1.pool.query('SELECT id FROM restaurants WHERE id = $1 AND created_by = $2', [restaurantId, userId]);
        if (rows.length === 0) {
            throw new errors_1.ForbiddenError('Not authorized to access this restaurant');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.isRestaurantOwner = isRestaurantOwner;
