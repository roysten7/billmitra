import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import subscriptionRoutes from './routes/subscription.routes';
import moduleRoutes from './routes/module.routes';
import outletRoutes from './routes/outlet.routes';
import { pool } from './config/db';
import { errorHandler } from './middleware/error';
import { NotFoundError } from './utils/errors';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001 to avoid conflict

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', restaurantRoutes); // Restaurant routes
app.use('/api/subscription', subscriptionRoutes); // Subscription routes
app.use('/api/modules', moduleRoutes); // Module routes
app.use('/api', outletRoutes); // Outlet routes

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'BillMitra API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Handle 404
app.use((req, res, next) => {
  throw new NotFoundError(`Not Found - ${req.originalUrl}`);
});

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  pool.end(() => process.exit(1));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
