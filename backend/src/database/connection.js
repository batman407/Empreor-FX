import pg from 'pg'
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,                // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

pool.on('error', (err) => {
  logger.error('PostgreSQL pool error:', err)
})

export async function connectDB() {
  const client = await pool.connect()
  await client.query('SELECT 1')
  client.release()
}

/**
 * Execute a parameterized query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 */
export async function query(text, params) {
  const start = Date.now()
  const result = await pool.query(text, params)
  const duration = Date.now() - start
  logger.debug(`Query executed in ${duration}ms: ${text.substring(0, 60)}...`)
  return result
}

/**
 * Get a client for transactions
 */
export async function getClient() {
  const client = await pool.connect()
  const originalQuery = client.query.bind(client)

  // Wrap query to add logging
  client.query = (...args) => {
    return originalQuery(...args)
  }

  return client
}

export default pool
