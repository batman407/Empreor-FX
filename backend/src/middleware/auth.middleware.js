import { verifyAccessToken } from '../utils/jwt.js'
import { AppError } from '../utils/appError.js'
import { query } from '../database/connection.js'

/**
 * Authenticate any logged-in user
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization token required', 401)
  }

  const token = authHeader.split(' ')[1]
  const { valid, decoded, error } = verifyAccessToken(token)

  if (!valid) {
    throw new AppError(`Unauthorized: ${error}`, 401)
  }

  // Verify user still exists and is active
  const result = await query(
    `SELECT id, email, role, is_active, is_banned FROM users WHERE id = $1`,
    [decoded.sub]
  )

  const user = result.rows[0]
  if (!user) throw new AppError('User not found', 401)
  if (!user.is_active) throw new AppError('Account not active', 403)
  if (user.is_banned) throw new AppError('Account suspended', 403)

  req.user = user
  next()
}

/**
 * Require a specific role or higher
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) throw new AppError('Authentication required', 401)

    const roleHierarchy = { user: 0, admin: 1, superadmin: 2 }
    const userRank = roleHierarchy[req.user.role] ?? -1
    const requiredRank = Math.min(...roles.map((r) => roleHierarchy[r] ?? 99))

    if (userRank < requiredRank) {
      throw new AppError('Insufficient permissions', 403)
    }
    next()
  }
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin', 'superadmin')

/**
 * Verify admin secret key for admin login endpoint
 */
export function verifyAdminSecret(req, res, next) {
  const secretKey = req.headers['x-admin-key']
  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    throw new AppError('Invalid admin key', 403)
  }
  next()
}
