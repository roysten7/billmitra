"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if user already exists
        const userExists = await db_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create user
        const newUser = await db_1.pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role', [name, email, hashedPassword, role || 'staff']);
        // Generate JWT
        const token = generateToken(newUser.rows[0].id);
        res.status(201).json({
            id: newUser.rows[0].id,
            name: newUser.rows[0].name,
            email: newUser.rows[0].email,
            role: newUser.rows[0].role,
            token,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    console.log('Login request received:', {
        body: req.body,
        headers: req.headers,
        method: req.method,
        url: req.url
    });
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        console.log('Looking up user with email:', email);
        // Check if user exists
        const user = await db_1.pool.query('SELECT * FROM users WHERE email = $1', [
            email,
        ]);
        if (user.rows.length === 0) {
            console.log('No user found with email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        console.log('User found, checking password...');
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.rows[0].password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        console.log('Password matches, generating token...');
        // Generate JWT
        const token = generateToken(user.rows[0].id);
        console.log('Token generated successfully');
        const userData = {
            id: user.rows[0].id,
            name: user.rows[0].name,
            email: user.rows[0].email,
            role: user.rows[0].role,
            token,
        };
        console.log('Sending success response');
        res.json(userData);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.login = login;
// Get current user
const getMe = async (req, res) => {
    try {
        const user = await db_1.pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [
            req.user.id,
        ]);
        res.json(user.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMe = getMe;
// Generate JWT
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
    // Create the token with a simpler approach
    const token = jsonwebtoken_1.default.sign({
        id,
        // Add a timestamp to ensure tokens are unique
        iat: Math.floor(Date.now() / 1000),
    }, secret, {
        // Convert string time to seconds if needed
        expiresIn: typeof expiresIn === 'string' && expiresIn.endsWith('d')
            ? parseInt(expiresIn) * 24 * 60 * 60
            : expiresIn,
        algorithm: 'HS256'
    });
    return token;
};
