import { query } from '../database/connection.js'
import { logger } from './logger.js'

/**
 * Create an audit log entry
 */
export async function createAuditLog({
  userId = null,
  adminId = null,
  action,
  entityType = null,
  entityId = null,
  oldData = null,
  newData = null,
  ipAddress = null,
  userAgent = null,
  status = 'success',
  errorMessage = null,
}) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, admin_id, action, entity_type, entity_id,
        old_data, new_data, ip_address, user_agent, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::inet, $9, $10, $11)`,
      [
        userId,
        adminId,
        action,
        entityType,
        entityId,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ipAddress,
        userAgent,
        status,
        errorMessage,
      ]
    )
  } catch (err) {
    // Audit log failures should never crash the app
    logger.error('Failed to create audit log:', err.message)
  }
}
