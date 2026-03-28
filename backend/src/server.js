import 'express-async-errors'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import { createServer } from 'http'
import dotenv from 'dotenv'

import { logger } from './utils/logger.js'
import { connectDB } from './database/connection.js'
import { connectRedis } from './cache/redis.js'
import { initWebSocket } from './websocket/wsServer.js'
import { globalRateLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'

// Routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import walletRoutes from './routes/wallet.routes.js'
import tradeRoutes from './routes/trade.routes.js'
import adminRoutes from './routes/admin.routes.js'
import marketRoutes from './routes/market.routes.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// ─── SECURITY MIDDLEWARE ─────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── GENERAL MIDDLEWARE ──────────────────────────────────────────────────────
app.use(compression())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }))
app.use(globalRateLimiter)

// ─── TRUST PROXY (for Vercel / Render / Railway) ────────────────────────────
app.set('trust proxy', 1)

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const dbReady = req.app.locals.dbReady ?? false
  res.status(dbReady ? 200 : 206).json({
    status: dbReady ? 'ok' : 'degraded',
    service: 'Emperor FX API',
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbReady ? 'connected' : 'not_connected – install PostgreSQL and set DB_PASSWORD in .env',
    redis: 'in-memory fallback active if Redis not running',
  })
})

// ─── API ROUTES ──────────────────────────────────────────────────────────────
const BASE = `/api/${process.env.API_VERSION || 'v1'}`
app.use(`${BASE}/auth`, authRoutes)
app.use(`${BASE}/user`, userRoutes)
app.use(`${BASE}/wallet`, walletRoutes)
app.use(`${BASE}/trade`, tradeRoutes)
app.use(`${BASE}/market`, marketRoutes)
app.use(`${BASE}/admin`, adminRoutes)

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ─── STARTUP ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

async function start() {
  let dbReady = false

  // --- PostgreSQL (required for most routes, but don't crash on missing) ---
  try {
    await connectDB()
    logger.info('✅ PostgreSQL connected')
    dbReady = true
  } catch (err) {
    logger.warn('⚠️  PostgreSQL not available – DB-dependent routes will return 503')
    logger.warn('   → Install PostgreSQL: https://www.postgresql.org/download/windows/')
    logger.warn(`   → Then run: node src/database/migrate.js`)
    logger.warn(`   → Error: ${err.message}`)
  }

  // --- Redis (has in-memory fallback, non-fatal) ---
  try {
    await connectRedis()
  } catch (err) {
    logger.warn('⚠️  Redis not available – using in-memory cache fallback')
  }

  // --- WebSocket ---
  try {
    initWebSocket(httpServer)
    logger.info('✅ WebSocket server initialized')
  } catch (err) {
    logger.warn('⚠️  WebSocket failed to initialize:', err.message)
  }

  // Add DB status to health check
  app.locals.dbReady = dbReady

  httpServer.listen(PORT, () => {
    logger.info('')
    logger.info('╔══════════════════════════════════════════╗')
    logger.info('║   🏛️  EMPEROR FX API  –  RUNNING         ║')
    logger.info(`║   Port  : ${PORT}                           ║`)
    logger.info(`║   Mode  : ${(process.env.NODE_ENV || 'development').padEnd(12)}                ║`)
    logger.info(`║   DB    : ${dbReady ? '✅ Connected       ' : '⚠️  NOT connected  '}         ║`)
    logger.info(`║   Health: http://localhost:${PORT}/health      ║`)
    logger.info('╚══════════════════════════════════════════╝')
    logger.info('')
    if (!dbReady) {
      logger.warn('  ⚡ Next step: Install PostgreSQL, set DB_PASSWORD in .env,')
      logger.warn('     then run: node src/database/migrate.js')
    }
  })
}

start()

export default app
