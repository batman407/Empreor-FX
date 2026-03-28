import { Router } from 'express'
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  setup2FA,
  confirm2FA,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'
import { registerValidator, loginValidator } from '../middleware/validate.js'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// ─── DEMO AUTH (works without PostgreSQL) ────────────────────────────────────
// Enables full frontend session and dashboard without needing a DB
router.post('/demo-login', authRateLimiter, (req, res) => {
  const { email = 'demo@emperorfx.com', name = 'Emperor Trader' } = req.body

  const user = {
    id: uuidv4(),
    email,
    username: email.split('@')[0],
    first_name: name.split(' ')[0],
    last_name: name.split(' ').slice(1).join(' ') || 'Trader',
    role: 'user',
    is_email_verified: true,
    kyc_status: 'none',
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  res.json({
    success: true,
    message: 'Demo login successful',
    data: { user, accessToken, refreshToken },
  })
})

router.post('/demo-register', authRateLimiter, (req, res) => {
  const { email = 'new@emperorfx.com', firstName = 'Emperor', lastName = 'Trader' } = req.body

  const user = {
    id: uuidv4(),
    email,
    username: email.split('@')[0] + Math.floor(Math.random() * 999),
    first_name: firstName,
    last_name: lastName,
    role: 'user',
    is_email_verified: false,
    kyc_status: 'none',
    created_at: new Date().toISOString(),
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  res.json({
    success: true,
    message: 'Demo account created',
    data: { user, accessToken, refreshToken },
  })
})

// ─── REAL AUTH (requires PostgreSQL) ─────────────────────────────────────────
router.post('/register', authRateLimiter, registerValidator, register)
router.post('/login', authRateLimiter, loginValidator, login)
router.post('/refresh', refreshToken)
router.post('/logout', logout)
router.get('/verify-email/:token', verifyEmail)

// Protected routes
router.post('/2fa/setup', authenticate, setup2FA)
router.post('/2fa/confirm', authenticate, confirm2FA)

export default router
