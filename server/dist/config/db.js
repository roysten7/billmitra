"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
const envPath = path_1.default.resolve(__dirname, '../../.env');
dotenv_1.default.config({ path: envPath });
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
const pool = new pg_1.Pool(dbConfig);
exports.pool = pool;
// Test the database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('🚀 Connected to PostgreSQL database');
        client.release();
    }
    catch (error) {
        console.error('❌ Error connecting to PostgreSQL:', error);
        process.exit(1);
    }
};
testConnection();
