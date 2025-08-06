import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Get database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'billmitra',
};

console.log('Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  password: dbConfig.password ? '***' : 'undefined'
});

const pool = new Pool(dbConfig);

// Test the database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🚀 Connected to PostgreSQL database');
    client.release();
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
    process.exit(1);
  }
};

testConnection();

export { pool };
