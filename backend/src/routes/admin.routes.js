import { Router } from 'express'
import {
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  toggleUserBan,
  adjustBalance,
  processWithdrawal,
  getAuditLogs,
  getPendingWithdrawals,
} from '../controllers/admin.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'
import { adjustBalanceValidator } from '../middleware/validate.js'

const router = Router()

// All admin routes require authentication AND admin role
router.use(authenticate)
router.use(requireAdmin)

// Dashboard
router.get('/stats', getDashboardStats)
router.get('/audit-logs', getAuditLogs)

// User management
router.get('/users', getAllUsers)
router.get('/users/:userId', getUserDetail)
router.patch('/users/:userId/ban', toggleUserBan)
router.patch('/users/:userId/balance', adjustBalanceValidator, adjustBalance)

// Withdrawal management
router.get('/withdrawals/pending', getPendingWithdrawals)
router.patch('/withdrawals/:withdrawalId', processWithdrawal)

export default router
