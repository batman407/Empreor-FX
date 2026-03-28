import { logger } from '../utils/logger.js'
import { AppError } from '../utils/appError.js'

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  // ─── Database not connected (ECONNREFUSED → 503 so frontend fallback triggers)
  if (
    err.code === 'ECONNREFUSED' ||
    err.name === 'AggregateError' ||
    (err.message && err.message.includes('ECONNREFUSED')) ||
    (err.errors && err.errors.some && err.errors.some(e => e.code === 'ECONNREFUSED'))
  ) {
    statusCode = 503
    message = 'Database unavailable. Install PostgreSQL and set DB_PASSWORD in backend/.env'
  }

  // ─── PostgreSQL constraint errors ─────────────────────────────────────────
  else if (err.code === '23505') {
    statusCode = 409
    message = 'Duplicate entry – this email or username already exists'
  } else if (err.code === '23503') {
    statusCode = 400
    message = 'Referenced record not found'
  } else if (err.code === '22P02') {
    statusCode = 400
    message = 'Invalid UUID format'
  }

  // ─── JWT errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid authentication token'
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Authentication token expired'
  }

  // ─── Validation errors ────────────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400
  }

  // ─── Log ──────────────────────────────────────────────────────────────────
  if (statusCode >= 500 && statusCode !== 503) {
    logger.error(`[${statusCode}] ${req.method} ${req.path}: ${err.stack || err.message}`)
  } else {
    logger.warn(`[${statusCode}] ${req.method} ${req.path}: ${message}`)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode < 500 && { stack: err.stack }),
  })
}
