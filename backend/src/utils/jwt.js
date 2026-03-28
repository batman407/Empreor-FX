import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m'
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d'

/**
 * Generate JWT access token (short-lived)
 */
export function generateAccessToken(payload) {
  return jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
      type: 'access',
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES, jwtid: uuidv4() }
  )
}

/**
 * Generate refresh token (long-lived, stored in DB)
 */
export function generateRefreshToken(payload) {
  return jwt.sign(
    {
      sub: payload.id,
      type: 'refresh',
      jti: uuidv4(),
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  )
}

/**
 * Verify access token
 */
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET)
    if (decoded.type !== 'access') throw new Error('Invalid token type')
    return { valid: true, decoded }
  } catch (err) {
    return { valid: false, error: err.message }
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET)
    if (decoded.type !== 'refresh') throw new Error('Invalid token type')
    return { valid: true, decoded }
  } catch (err) {
    return { valid: false, error: err.message }
  }
}

/**
 * Get refresh token expiry date
 */
export function getRefreshTokenExpiry() {
  const days = parseInt(REFRESH_EXPIRES.replace('d', ''))
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}
