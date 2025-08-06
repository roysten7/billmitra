"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            try {
                // Get token from header
                token = req.headers.authorization.split(' ')[1];
                // Verify token
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                // Get user from token
                const user = await db_1.pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
                if (user.rows.length === 0) {
                    return res.status(401).json({ message: 'Not authorized' });
                }
                req.user = user.rows[0];
                next();
            }
            catch (error) {
                console.error(error);
                res.status(401).json({ message: 'Not authorized, token failed' });
            }
        }
        if (!token) {
            res.status(401).json({ message: 'Not authorized, no token' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.protect = protect;
// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }
        next();
    };
};
exports.authorize = authorize;
