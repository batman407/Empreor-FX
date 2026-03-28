import { query, getClient } from '../database/connection.js'
import { AppError } from '../utils/appError.js'
import { createAuditLog } from '../utils/audit.js'
import { broadcastToUser } from '../websocket/wsServer.js'
import { logger } from '../utils/logger.js'

const TRADING_FEE_RATE = 0.001 // 0.1% taker fee
const MIN_TRADE_USD = 10

// ─────────────────────────────────────────────────────────────────────────────
// PLACE ORDER
// ─────────────────────────────────────────────────────────────────────────────
export async function placeOrder(req, res) {
  const userId = req.user.id
  const {
    symbol,
    side,
    orderType = 'market',
    quantity,
    price,
    stopPrice,
    accountType = 'demo',
  } = req.body

  if (!['buy', 'sell'].includes(side)) throw new AppError('Invalid order side', 400)
  if (!['market', 'limit', 'stop', 'stop_limit'].includes(orderType)) {
    throw new AppError('Invalid order type', 400)
  }
  if (!['demo', 'live'].includes(accountType)) throw new AppError('Invalid account type', 400)
  if (quantity <= 0) throw new AppError('Invalid order quantity', 400)
  if (orderType !== 'market' && !price) throw new AppError('Price required for limit orders', 400)

  const client = await getClient()
  try {
    await client.query('BEGIN')

    // Get wallet
    const walletResult = await client.query(
      `SELECT id, balance, locked_balance FROM wallets
       WHERE user_id = $1 AND account_type = $2 AND is_active = TRUE
       FOR UPDATE`,
      [userId, accountType]
    )

    if (walletResult.rows.length === 0) throw new AppError('Wallet not found', 404)
    const wallet = walletResult.rows[0]

    // For demo, use simulated market price from request
    const executionPrice = price || req.body.marketPrice
    if (!executionPrice) throw new AppError('Market price required', 400)

    const totalValue = quantity * executionPrice
    const feeAmount = totalValue * TRADING_FEE_RATE
    const totalCost = totalValue + feeAmount

    if (totalCost < MIN_TRADE_USD) {
      throw new AppError(`Minimum trade value is $${MIN_TRADE_USD}`, 400)
    }

    const [baseCurrency, quoteCurrency] = symbol.split('/')
    const availableBalance = parseFloat(wallet.balance) - parseFloat(wallet.locked_balance)

    // Validate sufficient balance for buy orders
    if (side === 'buy' && availableBalance < totalCost) {
      throw new AppError(
        `Insufficient balance. Required: $${totalCost.toFixed(2)}, Available: $${availableBalance.toFixed(2)}`,
        400
      )
    }

    // Validate position for sell orders
    if (side === 'sell') {
      const posResult = await client.query(
        `SELECT quantity FROM positions
         WHERE user_id = $1 AND account_type = $2 AND symbol = $3`,
        [userId, accountType, baseCurrency]
      )
      const held = parseFloat(posResult.rows[0]?.quantity || 0)
      if (held < quantity) {
        throw new AppError(
          `Insufficient ${baseCurrency}. You hold: ${held.toFixed(8)}, Requested: ${quantity}`,
          400
        )
      }
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, wallet_id, account_type, symbol, base_currency, quote_currency,
        side, order_type, status, quantity, price, avg_fill_price, total_value, fee_amount,
        fee_currency, fee_rate, is_demo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        userId, wallet.id, accountType, symbol, baseCurrency, quoteCurrency,
        side, orderType,
        orderType === 'market' ? 'filled' : 'open',
        quantity, executionPrice, totalValue, feeAmount, quoteCurrency,
        TRADING_FEE_RATE, accountType === 'demo',
      ]
    )
    const order = orderResult.rows[0]

    // Execute market orders immediately
    if (orderType === 'market') {
      await executeOrder(client, { order, wallet, userId, accountType, executionPrice, totalValue, feeAmount, totalCost, side, quantity, baseCurrency, quoteCurrency })
    } else {
      // Lock funds for limit orders
      await client.query(
        `UPDATE wallets SET locked_balance = locked_balance + $1, updated_at = NOW() WHERE id = $2`,
        [side === 'buy' ? totalCost : 0, wallet.id]
      )
    }

    await client.query('COMMIT')

    // Broadcast update via WebSocket
    broadcastToUser(userId, {
      type: 'ORDER_UPDATE',
      data: { order, accountType },
    })

    await createAuditLog({
      userId,
      action: 'trade.order_placed',
      entityType: 'order',
      entityId: order.id,
      newData: { symbol, side, quantity, price: executionPrice, accountType },
      ipAddress: req.ip,
    })

    res.status(201).json({
      success: true,
      message: `Order ${order.status === 'filled' ? 'executed' : 'placed'} successfully`,
      data: { order },
    })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTE ORDER (Internal - used for market orders)
// ─────────────────────────────────────────────────────────────────────────────
async function executeOrder(client, { order, wallet, userId, accountType, executionPrice, totalValue, feeAmount, totalCost, side, quantity, baseCurrency, quoteCurrency }) {

  // Create trade record
  await client.query(
    `INSERT INTO trades (order_id, user_id, account_type, symbol, side, quantity, price, value, fee_amount, fee_currency, is_demo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      order.id, userId, accountType, order.symbol, side, quantity, executionPrice,
      totalValue, feeAmount, quoteCurrency, accountType === 'demo',
    ]
  )

  if (side === 'buy') {
    // Deduct USD, credit crypto
    await client.query(
      `UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE id = $2`,
      [totalCost, wallet.id]
    )

    // Update or create position
    await client.query(
      `INSERT INTO positions (user_id, account_type, symbol, quantity, avg_buy_price, is_demo)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, account_type, symbol)
       DO UPDATE SET
         quantity = positions.quantity + EXCLUDED.quantity,
         avg_buy_price = ((positions.quantity * positions.avg_buy_price) +
                          (EXCLUDED.quantity * EXCLUDED.avg_buy_price)) /
                         (positions.quantity + EXCLUDED.quantity),
         updated_at = NOW()`,
      [userId, accountType, baseCurrency, quantity, executionPrice, accountType === 'demo']
    )
  } else {
    // Credit USD, deduct crypto
    await client.query(
      `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
      [totalValue - feeAmount, wallet.id]
    )

    // Reduce position
    await client.query(
      `UPDATE positions SET quantity = quantity - $1, updated_at = NOW()
       WHERE user_id = $2 AND account_type = $3 AND symbol = $4`,
      [quantity, userId, accountType, baseCurrency]
    )

    // Remove zero positions
    await client.query(
      `DELETE FROM positions WHERE user_id = $1 AND account_type = $2 AND symbol = $3 AND quantity <= 0`,
      [userId, accountType, baseCurrency]
    )
  }

  // Create transaction record
  await client.query(
    `INSERT INTO transactions (user_id, wallet_id, type, account_type, amount, currency, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'completed')`,
    [
      userId, wallet.id, side === 'buy' ? 'trade_buy' : 'trade_sell',
      accountType, totalValue, quoteCurrency,
    ]
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ORDERS
// ─────────────────────────────────────────────────────────────────────────────
export async function getOrders(req, res) {
  const userId = req.user.id
  const { accountType = 'demo', status, symbol, page = 1, limit = 20 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let where = 'WHERE user_id = $1'
  const params = [userId]
  let idx = 2

  if (accountType) { where += ` AND account_type = $${idx++}`; params.push(accountType) }
  if (status) { where += ` AND status = $${idx++}`; params.push(status) }
  if (symbol) { where += ` AND symbol = $${idx++}`; params.push(symbol) }

  const [ordersResult, countResult] = await Promise.all([
    query(
      `SELECT id, symbol, side, order_type, status, quantity, filled_quantity, price,
              avg_fill_price, total_value, fee_amount, account_type, created_at, filled_at
       FROM orders ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    ),
    query(`SELECT COUNT(*) FROM orders ${where}`, params),
  ])

  res.json({
    success: true,
    data: {
      orders: ordersResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET POSITIONS
// ─────────────────────────────────────────────────────────────────────────────
export async function getPositions(req, res) {
  const userId = req.user.id
  const { accountType = 'demo' } = req.query

  const result = await query(
    `SELECT id, symbol, quantity, avg_buy_price, current_price, unrealized_pnl, realized_pnl,
            account_type, opened_at, updated_at
     FROM positions
     WHERE user_id = $1 AND account_type = $2 AND quantity > 0
     ORDER BY symbol`,
    [userId, accountType]
  )

  res.json({ success: true, data: { positions: result.rows } })
}

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL ORDER
// ─────────────────────────────────────────────────────────────────────────────
export async function cancelOrder(req, res) {
  const userId = req.user.id
  const { orderId } = req.params

  const client = await getClient()
  try {
    await client.query('BEGIN')

    const orderResult = await client.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND status = 'open' FOR UPDATE`,
      [orderId, userId]
    )

    if (orderResult.rows.length === 0) {
      throw new AppError('Order not found or cannot be cancelled', 404)
    }

    const order = orderResult.rows[0]

    await client.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [orderId]
    )

    // Release locked funds for buy limit orders
    if (order.side === 'buy') {
      const refund = parseFloat(order.total_value) + parseFloat(order.fee_amount)
      await client.query(
        `UPDATE wallets SET locked_balance = GREATEST(0, locked_balance - $1), updated_at = NOW()
         WHERE id = $2`,
        [refund, order.wallet_id]
      )
    }

    await client.query('COMMIT')

    res.json({ success: true, message: 'Order cancelled successfully' })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET TRADE HISTORY
// ─────────────────────────────────────────────────────────────────────────────
export async function getTradeHistory(req, res) {
  const userId = req.user.id
  const { accountType = 'demo', symbol, page = 1, limit = 20 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let where = 'WHERE user_id = $1'
  const params = [userId]
  let idx = 2

  if (accountType) { where += ` AND account_type = $${idx++}`; params.push(accountType) }
  if (symbol) { where += ` AND symbol = $${idx++}`; params.push(symbol) }

  const result = await query(
    `SELECT id, symbol, side, quantity, price, value, fee_amount, pnl, account_type, executed_at
     FROM trades ${where}
     ORDER BY executed_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, parseInt(limit), offset]
  )

  res.json({ success: true, data: { trades: result.rows } })
}
