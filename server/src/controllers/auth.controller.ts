import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'staff']
    );

    // Generate JWT
    const token = generateToken(newUser.rows[0].id);

    res.status(201).json({
      id: newUser.rows[0].id,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
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
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (user.rows.length === 0) {
      console.log('No user found with email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found, checking password...');
    // Check password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get current user
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [
      req.user.id,
    ]);

    res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate JWT
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  
  // Create the token with a simpler approach
  const token = jwt.sign(
    { 
      id,
      // Add a timestamp to ensure tokens are unique
      iat: Math.floor(Date.now() / 1000),
    },
    secret,
    {
      // Convert string time to seconds if needed
      expiresIn: typeof expiresIn === 'string' && expiresIn.endsWith('d') 
        ? parseInt(expiresIn) * 24 * 60 * 60 
        : expiresIn,
      algorithm: 'HS256' as const
    } as jwt.SignOptions
  );
  
  return token;
};
