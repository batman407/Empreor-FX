import { query } from '../database/connection.js'
import { AppError } from '../utils/appError.js'
import { createAuditLog } from '../utils/audit.js'
import { getRedis } from '../cache/redis.js'
import { logger } from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────
export async function getDashboardStats(req, res) {
  const redis = getRedis()
  const cacheKey = 'admin:dashboard:stats'
  const cached = await redis.get(cacheKey)
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true })

  const [
    usersResult,
    activeUsersResult,
    totalVolumeResult,
    pendingWithdrawalsResult,
    recentRegistrationsResult,
    totalDepositsResult,
  ] = await Promise.all([
    query(`SELECT COUNT(*) FROM users WHERE role = 'user'`),
    query(`SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours'`),
    query(`SELECT COALESCE(SUM(value), 0) AS total FROM trades WHERE executed_at > NOW() - INTERVAL '30 days'`),
    query(`SELECT COUNT(*) FROM withdrawals WHERE status = 'pending'`),
    query(`SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'`),
    query(`SELECT COALESCE(SUM(amount), 0) AS total FROM deposits WHERE status = 'completed'`),
  ])

  const stats = {
    totalUsers: parseInt(usersResult.rows[0].count),
    activeUsers24h: parseInt(activeUsersResult.rows[0].count),
    tradingVolume30d: parseFloat(totalVolumeResult.rows[0].total),
    pendingWithdrawals: parseInt(pendingWithdrawalsResult.rows[0].count),
    newUsers7d: parseInt(recentRegistrationsResult.rows[0].count),
    totalDeposits: parseFloat(totalDepositsResult.rows[0].total),
  }

  await redis.set(cacheKey, JSON.stringify(stats), 'EX', 60) // Cache 60 seconds

  res.json({ success: true, data: stats })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL USERS (Paginated)
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllUsers(req, res) {
  const { page = 1, limit = 20, search, role, kyc_status } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let where = "WHERE role != 'superadmin'"
  const params = []
  let idx = 1

  if (search) {
    where += ` AND (email ILIKE $${idx} OR username ILIKE $${idx} OR first_name ILIKE $${idx} OR last_name ILIKE $${idx})`
    params.push(`%${search}%`)
    idx++
  }

  if (role) { where += ` AND role = $${idx++}`; params.push(role) }
  if (kyc_status) { where += ` AND kyc_status = $${idx++}`; params.push(kyc_status) }

  const [usersResult, countResult] = await Promise.all([
    query(
      `SELECT id, email, username, first_name, last_name, country, role, is_email_verified,
              kyc_status, is_active, is_banned, last_login_at, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    ),
    query(`SELECT COUNT(*) FROM users ${where}`, params),
  ])

  res.json({
    success: true,
    data: {
      users: usersResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
      },
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET USER DETAIL
// ─────────────────────────────────────────────────────────────────────────────
export async function getUserDetail(req, res) {
  const { userId } = req.params

  const [userResult, walletsResult, ordersResult, transactionsResult] = await Promise.all([
    query(
      `SELECT id, email, username, first_name, last_name, phone, country, role,
              is_email_verified, is_2fa_enabled, kyc_status, is_active, is_banned, ban_reason,
              last_login_at, last_login_ip, created_at
       FROM users WHERE id = $1`,
      [userId]
    ),
    query(
      `SELECT account_type, currency, balance, locked_balance FROM wallets WHERE user_id = $1`,
      [userId]
    ),
    query(
      `SELECT COUNT(*) as total, SUM(value) as volume FROM trades WHERE user_id = $1`,
      [userId]
    ),
    query(
      `SELECT COUNT(*) as total FROM transactions WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    ),
  ])

  if (userResult.rows.length === 0) throw new AppError('User not found', 404)

  res.json({
    success: true,
    data: {
      user: userResult.rows[0],
      wallets: walletsResult.rows,
      stats: {
        totalTrades: parseInt(ordersResult.rows[0].total),
        tradingVolume: parseFloat(ordersResult.rows[0].volume || 0),
        completedTransactions: parseInt(transactionsResult.rows[0].total),
      },
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// BAN / UNBAN USER
// ─────────────────────────────────────────────────────────────────────────────
export async function toggleUserBan(req, res) {
  const { userId } = req.params
  const { ban, reason } = req.body
  const adminId = req.user.id

  const result = await query(
    `UPDATE users SET is_banned = $1, ban_reason = $2, updated_at = NOW()
     WHERE id = $3 AND role != 'superadmin'
     RETURNING id, email, is_banned`,
    [ban, ban ? reason : null, userId]
  )

  if (result.rows.length === 0) throw new AppError('User not found', 404)

  // Invalidate all sessions for banned user
  if (ban) {
    await query(`UPDATE sessions SET is_active = FALSE WHERE user_id = $1`, [userId])
  }

  await createAuditLog({
    userId: adminId,
    adminId,
    action: ban ? 'admin.user_banned' : 'admin.user_unbanned',
    entityType: 'user',
    entityId: userId,
    newData: { ban, reason },
    ipAddress: req.ip,
  })

  logger.info(`Admin ${adminId} ${ban ? 'banned' : 'unbanned'} user ${userId}`)

  res.json({
    success: true,
    message: `User ${ban ? 'banned' : 'unbanned'} successfully`,
    data: result.rows[0],
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// ADJUST USER WALLET BALANCE (Admin Credit / Debit)
// ─────────────────────────────────────────────────────────────────────────────
export async function adjustBalance(req, res) {
  const { userId } = req.params
  const { accountType, amount, currency = 'USD', reason } = req.body
  const adminId = req.user.id

  if (!['demo', 'live'].includes(accountType)) throw new AppError('Invalid account type', 400)
  if (!reason || reason.length < 5) throw new AppError('Reason required (min 5 chars)', 400)

  const result = await query(
    `UPDATE wallets SET balance = balance + $1, updated_at = NOW()
     WHERE user_id = $2 AND account_type = $3 AND currency = $4
     RETURNING id, balance, account_type`,
    [amount, userId, accountType, currency]
  )

  if (result.rows.length === 0) throw new AppError('Wallet not found', 404)

  // Log as transaction
  await query(
    `INSERT INTO transactions (user_id, wallet_id, type, account_type, amount, currency, status, metadata)
     VALUES ($1, $2, 'bonus', $3, $4, $5, 'completed', $6)`,
    [userId, result.rows[0].id, accountType, Math.abs(amount), currency, JSON.stringify({ adminId, reason })]
  )

  await createAuditLog({
    userId: adminId,
    adminId,
    action: 'admin.balance_adjusted',
    entityType: 'wallet',
    entityId: result.rows[0].id,
    newData: { amount, accountType, currency, reason, targetUserId: userId },
    ipAddress: req.ip,
  })

  res.json({
    success: true,
    message: `Balance adjusted by ${amount >= 0 ? '+' : ''}${amount} ${currency}`,
    data: result.rows[0],
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS WITHDRAWAL (Approve / Reject)
// ─────────────────────────────────────────────────────────────────────────────
export async function processWithdrawal(req, res) {
  const { withdrawalId } = req.params
  const { action, adminNote } = req.body // action: 'approve' | 'reject'
  const adminId = req.user.id

  if (!['approve', 'reject'].includes(action)) throw new AppError('Invalid action', 400)

  const result = await query(
    `UPDATE withdrawals
     SET status = $1, admin_note = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $4 AND status = 'pending'
     RETURNING id, user_id, wallet_id, amount, currency, status`,
    [action === 'approve' ? 'processing' : 'rejected', adminNote, adminId, withdrawalId]
  )

  if (result.rows.length === 0) throw new AppError('Withdrawal not found or already processed', 404)

  const withdrawal = result.rows[0]

  // If rejected, release the locked funds
  if (action === 'reject') {
    await query(
      `UPDATE wallets SET locked_balance = GREATEST(0, locked_balance - $1), updated_at = NOW()
       WHERE id = $2`,
      [withdrawal.amount, withdrawal.wallet_id]
    )
    await query(
      `UPDATE transactions SET status = 'cancelled' WHERE user_id = $1 AND type = 'withdrawal' AND status = 'pending'`,
      [withdrawal.user_id]
    )
  }

  await createAuditLog({
    adminId,
    action: `admin.withdrawal_${action}d`,
    entityType: 'withdrawal',
    entityId: withdrawalId,
    newData: { action, adminNote },
    ipAddress: req.ip,
  })

  res.json({
    success: true,
    message: `Withdrawal ${action}d successfully`,
    data: withdrawal,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────
export async function getAuditLogs(req, res) {
  const { page = 1, limit = 50, action, userId } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let where = 'WHERE 1=1'
  const params = []
  let idx = 1

  if (action) { where += ` AND action ILIKE $${idx++}`; params.push(`%${action}%`) }
  if (userId) { where += ` AND (al.user_id = $${idx} OR al.admin_id = $${idx})`; params.push(userId); idx++ }

  const result = await query(
    `SELECT al.id, al.action, al.entity_type, al.entity_id, al.ip_address,
            al.status, al.created_at,
            u.email as user_email, a.email as admin_email
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     LEFT JOIN users a ON al.admin_id = a.id
     ${where}
     ORDER BY al.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, parseInt(limit), offset]
  )

  res.json({ success: true, data: { logs: result.rows } })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL PENDING WITHDRAWALS
// ─────────────────────────────────────────────────────────────────────────────
export async function getPendingWithdrawals(req, res) {
  const result = await query(
    `SELECT w.id, w.amount, w.fee_amount, w.net_amount, w.currency, w.network,
            w.to_address, w.status, w.created_at,
            u.id as user_id, u.email, u.username, u.kyc_status
     FROM withdrawals w
     JOIN users u ON w.user_id = u.id
     WHERE w.status = 'pending'
     ORDER BY w.created_at ASC`
  )

  res.json({ success: true, data: { withdrawals: result.rows } })
}
