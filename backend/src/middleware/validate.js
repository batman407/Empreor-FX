import { body, param, query, validationResult } from 'express-validator'
import { AppError } from '../utils/appError.js'

/**
 * Run validation and return errors if any
 */
export function validate(validations) {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req)
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const messages = errors.array().map((e) => e.msg).join(', ')
      return next(new AppError(messages, 400))
    }
    next()
  }
}

// ─── AUTH VALIDATORS ─────────────────────────────────────────────────────────
export const registerValidator = validate([
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('username')
    .isAlphanumeric()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 alphanumeric characters'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must be 8+ chars with uppercase, lowercase, number, and special char'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name required'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name required'),
])

export const loginValidator = validate([
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
])

// ─── TRADE VALIDATORS ────────────────────────────────────────────────────────
export const orderValidator = validate([
  body('symbol').matches(/^[A-Z]+\/[A-Z]+$/).withMessage('Symbol format: BTC/USD'),
  body('side').isIn(['buy', 'sell']).withMessage('Side must be buy or sell'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be positive'),
  body('accountType').optional().isIn(['demo', 'live']).withMessage('Account type: demo or live'),
  body('marketPrice').if(body('orderType').equals('market')).isFloat({ gt: 0 }).withMessage('Market price required for market orders'),
])

// ─── WALLET VALIDATORS ───────────────────────────────────────────────────────
export const depositValidator = validate([
  body('amount').isFloat({ gt: 10 }).withMessage('Minimum deposit is $10'),
  body('currency').optional().isUppercase().isLength({ min: 3, max: 10 }),
  body('provider').optional().isIn(['moonpay', 'transak', 'ramp']),
])

export const withdrawalValidator = validate([
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  body('toAddress').notEmpty().withMessage('Destination address required'),
  body('currency').optional().isUppercase(),
])

// ─── ADMIN VALIDATORS ────────────────────────────────────────────────────────
export const adjustBalanceValidator = validate([
  body('accountType').isIn(['demo', 'live']).withMessage('Account type: demo or live'),
  body('amount').isFloat().withMessage('Amount must be a number'),
  body('reason').isLength({ min: 5, max: 200 }).withMessage('Reason required (5-200 chars)'),
])
