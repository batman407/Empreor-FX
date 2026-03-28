import { Router } from 'express'
import {
  getWallets,
  getBalance,
  initiateDeposit,
  confirmDeposit,
  requestWithdrawal,
  getTransactions,
} from '../controllers/wallet.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { withdrawalRateLimiter } from '../middleware/rateLimiter.js'
import { depositValidator, withdrawalValidator } from '../middleware/validate.js'

const router = Router()

// All wallet routes require authentication
router.use(authenticate)

router.get('/', getWallets)
router.get('/balance/:accountType', getBalance)
router.get('/transactions', getTransactions)
router.post('/deposit', depositValidator, initiateDeposit)
router.post('/deposit/confirm', confirmDeposit) // Called by provider webhook
router.post('/withdraw', withdrawalRateLimiter, withdrawalValidator, requestWithdrawal)

export default router
