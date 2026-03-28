import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

import { query, getClient } from '../database/connection.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt.js'
import { sendVerificationEmail } from '../utils/email.js'

import { AppError } from '../utils/appError.js'
import { createAuditLog } from '../utils/audit.js'
import { logger } from '../utils/logger.js'

const SALT_ROUNDS = 12

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────────────────────
export async function register(req, res) {
  const { email, username, password, firstName, lastName, country } = req.body

  // Check if user already exists
  const existing = await query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email.toLowerCase(), username.toLowerCase()]
  )
  if (existing.rows.length > 0) {
    throw new AppError('Email or username already in use', 409)
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const verificationToken = uuidv4()
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

  const client = await getClient()
  try {
    await client.query('BEGIN')

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, country,
        verification_token, verification_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, username, first_name, last_name, role, is_email_verified, created_at`,
      [
        email.toLowerCase(),
        username.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        country,
        verificationToken,
        verificationExpires,
      ]
    )
    const user = userResult.rows[0]

    // Create demo wallet (starts with $10,000 simulated)
    await client.query(
      `INSERT INTO wallets (user_id, account_type, currency, balance)
       VALUES ($1, 'demo', 'USD', 10000)`,
      [user.id]
    )

    // Create live wallet (starts at $0)
    await client.query(
      `INSERT INTO wallets (user_id, account_type, currency, balance)
       VALUES ($1, 'live', 'USD', 0)`,
      [user.id]
    )

    await client.query('COMMIT')

    // Send verification email (non-blocking)
    sendVerificationEmail(email, user.first_name, verificationToken).catch((err) =>
      logger.error('Failed to send verification email:', err)
    )

    // Auto-login after registration
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    await query(
      `INSERT INTO sessions (user_id, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3::inet, $4, $5)`,
      [user.id, refreshToken, req.ip, req.headers['user-agent'], getRefreshTokenExpiry()]
    )

    await createAuditLog({
      userId: user.id,
      action: 'user.registered',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    logger.info(`New user registered: ${user.email}`)

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
export async function login(req, res) {
  const { email, password, totpCode } = req.body

  // Fetch user with password hash
  const result = await query(
    `SELECT id, email, username, password_hash, first_name, last_name, role,
            is_email_verified, is_2fa_enabled, totp_secret, is_active, is_banned, ban_reason
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  )

  const user = result.rows[0]

  // Use constant-time comparison to prevent timing attacks
  const passwordValid = user
    ? await bcrypt.compare(password, user.password_hash)
    : await bcrypt.compare(password, '$2b$12$invalidhashfortimingnormalization')

  if (!user || !passwordValid) {
    await createAuditLog({
      action: 'auth.login_failed',
      ipAddress: req.ip,
      newData: { email },
      status: 'failed',
      errorMessage: 'Invalid credentials',
    })
    throw new AppError('Invalid email or password', 401)
  }

  if (user.is_banned) {
    throw new AppError(`Account suspended: ${user.ban_reason || 'Contact support'}`, 403)
  }

  if (!user.is_active) {
    throw new AppError('Account is not active. Contact support.', 403)
  }

  // 2FA verification
  if (user.is_2fa_enabled) {
    if (!totpCode) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        message: 'Please provide your 2FA code',
      })
    }

    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: totpCode,
      window: 2,
    })

    if (!verified) {
      throw new AppError('Invalid 2FA code', 401)
    }
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  // Save session
  await query(
    `INSERT INTO sessions (user_id, refresh_token, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3::inet, $4, $5)
     ON CONFLICT DO NOTHING`,
    [user.id, refreshToken, req.ip, req.headers['user-agent'], getRefreshTokenExpiry()]
  )

  // Update last login
  await query(
    `UPDATE users SET last_login_at = NOW(), last_login_ip = $1::inet WHERE id = $2`,
    [req.ip, user.id]
  )

  await createAuditLog({
    userId: user.id,
    action: 'auth.login_success',
    entityType: 'user',
    entityId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  })

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshToken(req, res) {
  const { refreshToken: token } = req.body
  if (!token) throw new AppError('Refresh token required', 400)

  const { valid, decoded, error } = verifyRefreshToken(token)
  if (!valid) throw new AppError(`Invalid token: ${error}`, 401)

  try {
    // Check token exists in DB and is active
    const sessionResult = await query(
      `SELECT s.*, u.id as uid, u.email, u.role, u.first_name, u.last_name, u.is_active
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.refresh_token = $1 AND s.is_active = TRUE AND s.expires_at > NOW()`,
      [token]
    )

    const session = sessionResult.rows[0]
    if (!session) throw new AppError('Session not found or expired', 401)
    if (!session.is_active) throw new AppError('Account not active', 403)

    const user = { id: session.uid, email: session.email, role: session.role }
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)

    // Rotate refresh token
    await query(`UPDATE sessions SET is_active = FALSE WHERE refresh_token = $1`, [token])
    await query(
      `INSERT INTO sessions (user_id, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3::inet, $4, $5)`,
      [user.id, newRefreshToken, req.ip, req.headers['user-agent'], getRefreshTokenExpiry()]
    )

    return res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    })
  } catch (err) {
    // DB not connected — reissue tokens from the JWT claims directly (demo mode)
    if (err.code === 'ECONNREFUSED' || err.message?.includes('connect') || err instanceof AppError === false) {
      const newAccessToken = generateAccessToken(decoded)
      const newRefreshToken = generateRefreshToken(decoded)
      return res.json({
        success: true,
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      })
    }
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
export async function logout(req, res) {
  const { refreshToken: token } = req.body
  try {
    if (token) {
      await query(`UPDATE sessions SET is_active = FALSE WHERE refresh_token = $1`, [token])
    }
    await createAuditLog({
      userId: req.user?.id,
      action: 'auth.logout',
      ipAddress: req.ip,
    })
  } catch (_) {
    // DB not connected — silently succeed (demo mode)
  }
  res.json({ success: true, message: 'Logged out successfully' })
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyEmail(req, res) {
  const { token } = req.params

  const result = await query(
    `UPDATE users
     SET is_email_verified = TRUE, verification_token = NULL, verification_expires = NULL
     WHERE verification_token = $1 AND verification_expires > NOW()
     RETURNING id, email`,
    [token]
  )

  if (result.rows.length === 0) {
    throw new AppError('Invalid or expired verification link', 400)
  }

  res.json({ success: true, message: 'Email verified successfully. You can now log in.' })
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP 2FA
// ─────────────────────────────────────────────────────────────────────────────
export async function setup2FA(req, res) {
  const userId = req.user.id

  const userResult = await query('SELECT email, username FROM users WHERE id = $1', [userId])
  const user = userResult.rows[0]

  const secret = speakeasy.generateSecret({
    name: `Emperor FX (${user.email})`,
    length: 20,
  })

  // Store secret temporarily (not enabled yet until user confirms)
  await query(`UPDATE users SET totp_secret = $1 WHERE id = $2`, [secret.base32, userId])

  const qrCode = await QRCode.toDataURL(secret.otpauth_url)

  res.json({
    success: true,
    data: {
      secret: secret.base32,
      qrCode,
      manualEntry: secret.otpauth_url,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM 2FA
// ─────────────────────────────────────────────────────────────────────────────
export async function confirm2FA(req, res) {
  const { totpCode } = req.body
  const userId = req.user.id

  const result = await query('SELECT totp_secret FROM users WHERE id = $1', [userId])
  const secret = result.rows[0]?.totp_secret
  if (!secret) throw new AppError('2FA setup not initiated', 400)

  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: totpCode,
    window: 2,
  })

  if (!verified) throw new AppError('Invalid 2FA code', 400)

  await query(`UPDATE users SET is_2fa_enabled = TRUE WHERE id = $1`, [userId])

  await createAuditLog({
    userId,
    action: 'auth.2fa_enabled',
    entityType: 'user',
    entityId: userId,
    ipAddress: req.ip,
  })

  res.json({ success: true, message: '2FA enabled successfully' })
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function sanitizeUser(user) {
  const { password_hash, totp_secret, verification_token, ...safe } = user
  return safe
}
