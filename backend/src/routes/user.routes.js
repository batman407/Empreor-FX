import { Router } from 'express'
import { query } from '../database/connection.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { AppError } from '../utils/appError.js'
import { createAuditLog } from '../utils/audit.js'
import bcrypt from 'bcryptjs'

const router = Router()
router.use(authenticate)

/**
 * GET /api/v1/user/profile
 */
router.get('/profile', async (req, res) => {
  const result = await query(
    `SELECT id, email, username, first_name, last_name, phone, country, role,
            is_email_verified, is_2fa_enabled, kyc_status, created_at
     FROM users WHERE id = $1`,
    [req.user.id]
  )
  if (result.rows.length === 0) throw new AppError('User not found', 404)

  res.json({ success: true, data: { user: result.rows[0] } })
})

/**
 * PATCH /api/v1/user/profile
 */
router.patch('/profile', async (req, res) => {
  const { firstName, lastName, phone, country } = req.body

  const result = await query(
    `UPDATE users
     SET first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         phone = COALESCE($3, phone),
         country = COALESCE($4, country),
         updated_at = NOW()
     WHERE id = $5
     RETURNING id, email, username, first_name, last_name, phone, country`,
    [firstName, lastName, phone, country, req.user.id]
  )

  res.json({ success: true, message: 'Profile updated', data: { user: result.rows[0] } })
})

/**
 * POST /api/v1/user/change-password
 */
router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) throw new AppError('Both passwords required', 400)
  if (newPassword.length < 8) throw new AppError('Password must be at least 8 characters', 400)

  const userResult = await query(
    'SELECT password_hash FROM users WHERE id = $1',
    [req.user.id]
  )
  const user = userResult.rows[0]

  const valid = await bcrypt.compare(currentPassword, user.password_hash)
  if (!valid) throw new AppError('Current password is incorrect', 401)

  const newHash = await bcrypt.hash(newPassword, 12)
  await query(
    `UPDATE users SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW() WHERE id = $2`,
    [newHash, req.user.id]
  )

  // Invalidate all other sessions
  await query(
    `UPDATE sessions SET is_active = FALSE WHERE user_id = $1`,
    [req.user.id]
  )

  await createAuditLog({
    userId: req.user.id,
    action: 'user.password_changed',
    ipAddress: req.ip,
  })

  res.json({ success: true, message: 'Password changed successfully. Please login again.' })
})

/**
 * GET /api/v1/user/notifications
 */
router.get('/notifications', async (req, res) => {
  const result = await query(
    `SELECT id, type, title, message, is_read, data, created_at
     FROM notifications WHERE user_id = $1
     ORDER BY created_at DESC LIMIT 50`,
    [req.user.id]
  )
  res.json({ success: true, data: { notifications: result.rows } })
})

/**
 * PATCH /api/v1/user/notifications/:id/read
 */
router.patch('/notifications/:id/read', async (req, res) => {
  await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  )
  res.json({ success: true })
})

/**
 * GET /api/v1/user/sessions
 */
router.get('/sessions', async (req, res) => {
  const result = await query(
    `SELECT id, ip_address, user_agent, created_at, expires_at, is_active
     FROM sessions WHERE user_id = $1 AND is_active = TRUE
     ORDER BY created_at DESC`,
    [req.user.id]
  )
  res.json({ success: true, data: { sessions: result.rows } })
})

/**
 * DELETE /api/v1/user/sessions/:sessionId
 */
router.delete('/sessions/:sessionId', async (req, res) => {
  await query(
    `UPDATE sessions SET is_active = FALSE WHERE id = $1 AND user_id = $2`,
    [req.params.sessionId, req.user.id]
  )
  res.json({ success: true, message: 'Session terminated' })
})

export default router
