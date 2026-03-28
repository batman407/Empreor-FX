import { query, getClient } from '../database/connection.js'
import { AppError } from '../utils/appError.js'
import { createAuditLog } from '../utils/audit.js'
import { generateUniqueReference } from '../utils/helpers.js'
import { logger } from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// GET USER WALLETS
// ─────────────────────────────────────────────────────────────────────────────
export async function getWallets(req, res) {
  const userId = req.user.id

  const result = await query(
    `SELECT id, account_type, currency, balance, locked_balance, created_at, updated_at
     FROM wallets
     WHERE user_id = $1 AND is_active = TRUE
     ORDER BY account_type, currency`,
    [userId]
  )

  res.json({ success: true, data: { wallets: result.rows } })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET WALLET BALANCE
// ─────────────────────────────────────────────────────────────────────────────
export async function getBalance(req, res) {
  const userId = req.user.id
  const { accountType = 'demo' } = req.params

  if (!['demo', 'live'].includes(accountType)) {
    throw new AppError('Invalid account type', 400)
  }

  const result = await query(
    `SELECT id, account_type, currency, balance, locked_balance, updated_at
     FROM wallets
     WHERE user_id = $1 AND account_type = $2 AND is_active = TRUE`,
    [userId, accountType]
  )

  if (result.rows.length === 0) {
    throw new AppError('Wallet not found', 404)
  }

  res.json({ success: true, data: { wallets: result.rows } })
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIATE DEPOSIT (Live account only)
// ─────────────────────────────────────────────────────────────────────────────
export async function initiateDeposit(req, res) {
  const userId = req.user.id
  const { amount, currency = 'USD', provider = 'moonpay', network } = req.body

  if (amount <= 0) throw new AppError('Invalid deposit amount', 400)

  // Get live wallet
  const walletResult = await query(
    `SELECT id FROM wallets WHERE user_id = $1 AND account_type = 'live' AND is_active = TRUE`,
    [userId]
  )

  if (walletResult.rows.length === 0) throw new AppError('Live wallet not found', 404)
  const wallet = walletResult.rows[0]

  const reference = generateUniqueReference('DEP')

  // Create pending deposit record
  const depositResult = await query(
    `INSERT INTO deposits (user_id, wallet_id, amount, currency, network, status, provider, provider_reference)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)
     RETURNING id`,
    [userId, wallet.id, amount, currency, network, provider, reference]
  )

  // Also create transaction record
  await query(
    `INSERT INTO transactions (user_id, wallet_id, type, account_type, amount, currency, status, reference, provider)
     VALUES ($1, $2, 'deposit', 'live', $3, $4, 'pending', $5, $6)`,
    [userId, wallet.id, amount, currency, reference, provider]
  )

  // Build provider redirect URL (MoonPay / Transak)
  const providerUrls = {
    moonpay: buildMoonPayUrl({ amount, currency, reference }),
    transak: buildTransakUrl({ amount, currency, reference }),
    ramp: buildRampUrl({ amount, currency, reference }),
  }

  const redirectUrl = providerUrls[provider] || providerUrls.moonpay

  await createAuditLog({
    userId,
    action: 'wallet.deposit_initiated',
    entityType: 'deposit',
    entityId: depositResult.rows[0].id,
    newData: { amount, currency, provider, reference },
    ipAddress: req.ip,
  })

  res.json({
    success: true,
    message: 'Deposit initiated. Complete payment on the provider page.',
    data: {
      depositId: depositResult.rows[0].id,
      reference,
      redirectUrl,
      provider,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DEPOSIT (Webhook from provider or admin)
// ─────────────────────────────────────────────────────────────────────────────
export async function confirmDeposit(req, res) {
  const { reference, txHash, confirmations = 0 } = req.body

  const client = await getClient()
  try {
    await client.query('BEGIN')

    // Find deposit
    const depositResult = await client.query(
      `SELECT d.*, w.user_id, w.balance, w.id as wallet_id
       FROM deposits d
       JOIN wallets w ON d.wallet_id = w.id
       WHERE d.provider_reference = $1 AND d.status = 'pending'
       FOR UPDATE`,
      [reference]
    )

    if (depositResult.rows.length === 0) {
      throw new AppError('Deposit not found or already processed', 404)
    }

    const deposit = depositResult.rows[0]
    const isConfirmed = confirmations >= 3

    // Update deposit
    await client.query(
      `UPDATE deposits
       SET status = $1, tx_hash = $2, confirmations = $3, confirmed_at = $4, updated_at = NOW()
       WHERE id = $5`,
      [
        isConfirmed ? 'completed' : 'confirming',
        txHash,
        confirmations,
        isConfirmed ? new Date() : null,
        deposit.id,
      ]
    )

    if (isConfirmed) {
      // Credit wallet
      await client.query(
        `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
        [deposit.amount, deposit.wallet_id]
      )

      // Update transaction
      await client.query(
        `UPDATE transactions
         SET status = 'completed', blockchain_hash = $1, confirmations = $2, completed_at = NOW()
         WHERE reference = $3`,
        [txHash, confirmations, reference]
      )
    }

    await client.query('COMMIT')

    logger.info(`Deposit ${reference} - ${isConfirmed ? 'Completed' : 'Confirming'} (${confirmations} confirmations)`)

    res.json({
      success: true,
      message: isConfirmed ? 'Deposit confirmed and credited' : 'Deposit confirming...',
      data: { confirmed: isConfirmed, confirmations },
    })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST WITHDRAWAL
// ─────────────────────────────────────────────────────────────────────────────
export async function requestWithdrawal(req, res) {
  const userId = req.user.id
  const { amount, currency = 'USD', toAddress, network } = req.body

  if (amount <= 0) throw new AppError('Invalid withdrawal amount', 400)
  if (!toAddress) throw new AppError('Withdrawal address required', 400)

  const FEE_RATE = 0.001 // 0.1% fee
  const feeAmount = amount * FEE_RATE
  const netAmount = amount - feeAmount

  const client = await getClient()
  try {
    await client.query('BEGIN')

    // Get live wallet with lock
    const walletResult = await client.query(
      `SELECT id, balance, locked_balance FROM wallets
       WHERE user_id = $1 AND account_type = 'live' AND currency = $2 AND is_active = TRUE
       FOR UPDATE`,
      [userId, currency]
    )

    if (walletResult.rows.length === 0) throw new AppError('Wallet not found', 404)
    const wallet = walletResult.rows[0]

    const availableBalance = parseFloat(wallet.balance) - parseFloat(wallet.locked_balance)
    if (availableBalance < amount) {
      throw new AppError(
        `Insufficient balance. Available: ${availableBalance.toFixed(2)} ${currency}`,
        400
      )
    }

    // Lock funds
    await client.query(
      `UPDATE wallets SET locked_balance = locked_balance + $1, updated_at = NOW() WHERE id = $2`,
      [amount, wallet.id]
    )

    const reference = generateUniqueReference('WIT')

    // Create withdrawal record
    const withdrawalResult = await client.query(
      `INSERT INTO withdrawals (user_id, wallet_id, amount, fee_amount, net_amount, currency, network, to_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING id`,
      [userId, wallet.id, amount, feeAmount, netAmount, currency, network, toAddress]
    )

    // Create transaction record
    await client.query(
      `INSERT INTO transactions (user_id, wallet_id, type, account_type, amount, currency, status, reference, to_address, fee_amount, fee_currency)
       VALUES ($1, $2, 'withdrawal', 'live', $3, $4, 'pending', $5, $6, $7, $4)`,
      [userId, wallet.id, amount, currency, reference, toAddress, feeAmount]
    )

    await client.query('COMMIT')

    await createAuditLog({
      userId,
      action: 'wallet.withdrawal_requested',
      entityType: 'withdrawal',
      entityId: withdrawalResult.rows[0].id,
      newData: { amount, currency, toAddress: toAddress.slice(0, 10) + '...', reference },
      ipAddress: req.ip,
    })

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted and is pending admin approval.',
      data: {
        withdrawalId: withdrawalResult.rows[0].id,
        reference,
        amount,
        feeAmount,
        netAmount,
        status: 'pending',
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
// GET TRANSACTION HISTORY
// ─────────────────────────────────────────────────────────────────────────────
export async function getTransactions(req, res) {
  const userId = req.user.id
  const { page = 1, limit = 20, type, status, accountType } = req.query

  const offset = (parseInt(page) - 1) * parseInt(limit)

  let whereClause = 'WHERE user_id = $1'
  const params = [userId]
  let paramIdx = 2

  if (type) {
    whereClause += ` AND type = $${paramIdx++}`
    params.push(type)
  }
  if (status) {
    whereClause += ` AND status = $${paramIdx++}`
    params.push(status)
  }
  if (accountType) {
    whereClause += ` AND account_type = $${paramIdx++}`
    params.push(accountType)
  }

  const [txResult, countResult] = await Promise.all([
    query(
      `SELECT id, type, account_type, amount, currency, status, reference, blockchain_hash,
              from_address, to_address, fee_amount, provider, completed_at, created_at
       FROM transactions ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, parseInt(limit), offset]
    ),
    query(`SELECT COUNT(*) FROM transactions ${whereClause}`, params),
  ])

  res.json({
    success: true,
    data: {
      transactions: txResult.rows,
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
// PROVIDER URL BUILDERS (placeholders until real API keys set)
// ─────────────────────────────────────────────────────────────────────────────
function buildMoonPayUrl({ amount, currency, reference }) {
  const apiKey = process.env.MOONPAY_API_KEY || 'pk_test_placeholder'
  return `https://buy.moonpay.com?apiKey=${apiKey}&currencyCode=${currency.toLowerCase()}&baseCurrencyAmount=${amount}&externalTransactionId=${reference}`
}

function buildTransakUrl({ amount, currency, reference }) {
  const apiKey = process.env.TRANSAK_API_KEY || 'placeholder'
  const env = process.env.TRANSAK_ENV || 'STAGING'
  const base = env === 'PRODUCTION' ? 'https://global.transak.com' : 'https://global-stg.transak.com'
  return `${base}?apiKey=${apiKey}&fiatAmount=${amount}&fiatCurrency=${currency}&partnerOrderId=${reference}`
}

function buildRampUrl({ amount, currency, reference }) {
  const apiKey = process.env.RAMP_API_KEY || 'placeholder'
  return `https://buy.ramp.network?hostApiKey=${apiKey}&fiatValue=${amount}&fiatCurrency=${currency}&userAddress=${reference}`
}
