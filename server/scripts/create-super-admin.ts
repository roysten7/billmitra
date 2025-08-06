import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'billmitra',
});

async function createSuperAdmin() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if super admin already exists
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const checkResult = await client.query(checkQuery, ['superadmin@billmitra.com']);
    
    if (checkResult.rows.length > 0) {
      console.log('Super admin user already exists');
      return;
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    // Insert super admin user
    const insertQuery = `
      INSERT INTO users (name, email, password, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email, name, role
    `;
    
    const result = await client.query(insertQuery, [
      'Super Admin',
      'superadmin@billmitra.com',
      hashedPassword,
      'super_admin'
    ]);
    
    await client.query('COMMIT');
    console.log('Super admin user created successfully:', result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating super admin:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createSuperAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
