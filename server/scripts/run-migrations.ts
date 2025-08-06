import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables from the server's .env file
const envPath = resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Database configuration with defaults
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'billmitra',
});

console.log('Database configuration:', {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'billmitra',
  password: process.env.DB_PASSWORD ? '***' : 'undefined'
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Get all migrations that have already been run
    const { rows: migrations } = await client.query('SELECT name FROM migrations');
    const migrationsSet = new Set(migrations.map(m => m.name));

    // Get all migration files
    const migrationsDir = join(__dirname, '../migrations');
    console.log('Looking for migrations in:', migrationsDir);
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    console.log('Found migration files:', files);

    // Run new migrations
    for (const file of files) {
      if (!migrationsSet.has(file)) {
        console.log(`Running migration: ${file}`);
        const sql = readFileSync(join(migrationsDir, file), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        console.log(`Completed migration: ${file}`);
      }
    }

    await client.query('COMMIT');
    console.log('All migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

async function createSuperAdmin() {
  const client = await pool.connect();
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@billmitra.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    // Check if super admin already exists
    const { rows } = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [superAdminEmail]
    );

    if (rows.length === 0) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(superAdminPassword, salt);

      // Create super admin user
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        [superAdminName, superAdminEmail, hashedPassword, 'super_admin']
      );
      console.log('Super admin user created successfully');
    } else {
      console.log('Super admin user already exists');
    }
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await runMigrations();
    await createSuperAdmin();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
