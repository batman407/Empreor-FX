import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const client = new pg.Client({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres'
});

async function main() {
  try {
    await client.connect();
    const dbName = process.env.DB_NAME || 'emperor_fx';
    try {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    } catch (err) {
      if (err.code === '42P04') {
        console.log(`✅ Database "${dbName}" already exists.`);
      } else {
        console.error('❌ Error creating database:', err.message);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('❌ Error connecting to PostgreSQL (is it running?):', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
