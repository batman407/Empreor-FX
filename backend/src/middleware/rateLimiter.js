import rateLimit from 'express-rate-limit'
import { logger } from '../utils/logger.js'

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded: ${req.ip} on ${req.path}`)
      res.status(429).json({ success: false, message: options.message.message })
    },
  })

// Global rate limit: 100 req / 15 min
export const globalRateLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  parseInt(process.env.RATE_LIMIT_MAX || 100),
  'Too many requests, please try again later.'
)

// Auth endpoints: 10 req / 15 min (strict)
export const authRateLimiter = createLimiter(
  900000,
  parseInt(process.env.AUTH_RATE_LIMIT_MAX || 10),
  'Too many authentication attempts. Please wait 15 minutes.'
)

// Trade endpoints: 60 req / min
export const tradeRateLimiter = createLimiter(
  60000,
  60,
  'Too many trade requests. Please slow down.'
)

// Withdrawal: 5 req / hour
export const withdrawalRateLimiter = createLimiter(
  3600000,
  5,
  'Too many withdrawal requests. Please wait an hour.'
)
