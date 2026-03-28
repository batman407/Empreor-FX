import { Router } from 'express'
import {
  placeOrder,
  getOrders,
  getPositions,
  cancelOrder,
  getTradeHistory,
} from '../controllers/trade.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { tradeRateLimiter } from '../middleware/rateLimiter.js'
import { orderValidator } from '../middleware/validate.js'

const router = Router()

router.use(authenticate)

router.post('/order', tradeRateLimiter, orderValidator, placeOrder)
router.get('/orders', getOrders)
router.get('/positions', getPositions)
router.get('/history', getTradeHistory)
router.delete('/order/:orderId', cancelOrder)

export default router
