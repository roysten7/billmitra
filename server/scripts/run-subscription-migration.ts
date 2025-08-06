import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Read the SQL file
    const migrationPath = path.join(__dirname, '../src/migrations/001_create_subscription_tables.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log('✅ Subscription tables migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error running subscription migration:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

runMigration().catch(console.error);
