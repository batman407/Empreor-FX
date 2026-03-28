import { v4 as uuidv4 } from 'uuid'

/**
 * Generate a unique transaction reference
 * Format: DEP-2026-XXXXXXXX or WIT-2026-XXXXXXXX
 */
export function generateUniqueReference(prefix = 'TXN') {
  const year = new Date().getFullYear()
  const random = uuidv4().split('-')[0].toUpperCase()
  return `${prefix}-${year}-${random}`
}

/**
 * Format currency amount
 */
export function formatAmount(amount, decimals = 8) {
  return parseFloat(parseFloat(amount).toFixed(decimals))
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * Sleep utility for retries
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Paginate helper
 */
export function getPagination(page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page))
  const l = Math.min(100, Math.max(1, parseInt(limit)))
  return { offset: (p - 1) * l, limit: l, page: p }
}
