import Redis from 'ioredis'
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

let redis

export async function connectRedis() {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 5) {
          logger.warn('Redis not available, continuing without cache')
          return null
        }
        return Math.min(times * 100, 3000)
      },
    })

    redis.on('error', (err) => {
      logger.warn('Redis error (non-fatal):', err.message)
    })

    await redis.ping()
    logger.info('✅ Redis connected')
  } catch (err) {
    logger.warn('⚠️  Redis unavailable, using in-memory fallback:', err.message)
    redis = createMemoryFallback()
  }
}

export function getRedis() {
  return redis
}

/**
 * Simple in-memory fallback if Redis is not available
 */
function createMemoryFallback() {
  const store = new Map()
  const timers = new Map()

  return {
    async get(key) {
      return store.get(key) ?? null
    },
    async set(key, value, flag, ttl) {
      store.set(key, value)
      if (flag === 'EX' && ttl) {
        clearTimeout(timers.get(key))
        timers.set(key, setTimeout(() => store.delete(key), ttl * 1000))
      }
      return 'OK'
    },
    async del(key) {
      store.delete(key)
      return 1
    },
    async ping() {
      return 'PONG'
    },
    async exists(key) {
      return store.has(key) ? 1 : 0
    },
    async incr(key) {
      const v = parseInt(store.get(key) || '0') + 1
      store.set(key, String(v))
      return v
    },
    async expire(key, ttl) {
      clearTimeout(timers.get(key))
      timers.set(key, setTimeout(() => store.delete(key), ttl * 1000))
      return 1
    },
    on() {},
  }
}

export { redis }
