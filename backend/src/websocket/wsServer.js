import { WebSocketServer } from 'ws'
import { verifyAccessToken } from '../utils/jwt.js'
import { logger } from '../utils/logger.js'

let wss = null

// Map: userId => Set of WebSocket connections
const userConnections = new Map()

export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `ws://${req.headers.host}`)
    const token = url.searchParams.get('token')

    if (!token) {
      ws.close(1008, 'Token required')
      return
    }

    const { valid, decoded } = verifyAccessToken(token)
    if (!valid) {
      ws.close(1008, 'Invalid token')
      return
    }

    const userId = decoded.sub
    ws.userId = userId
    ws.isAlive = true

    // Register connection
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set())
    }
    userConnections.get(userId).add(ws)

    logger.debug(`WS: User ${userId} connected (${userConnections.get(userId).size} connections)`)

    // Send welcome message
    send(ws, { type: 'CONNECTED', data: { userId, timestamp: Date.now() } })

    // Heartbeat
    ws.on('pong', () => { ws.isAlive = true })

    // Client messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        handleClientMessage(ws, message)
      } catch (err) {
        logger.warn('Invalid WS message:', err.message)
      }
    })

    ws.on('close', () => {
      const conns = userConnections.get(userId)
      if (conns) {
        conns.delete(ws)
        if (conns.size === 0) userConnections.delete(userId)
      }
      logger.debug(`WS: User ${userId} disconnected`)
    })

    ws.on('error', (err) => {
      logger.error('WS error:', err.message)
    })
  })

  // Heartbeat interval to detect dead connections
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate()
      ws.isAlive = false
      ws.ping()
    })
  }, 30000)

  wss.on('close', () => clearInterval(heartbeat))

  logger.info('✅ WebSocket server on /ws')
}

/**
 * Send message to a specific user (all their connections)
 */
export function broadcastToUser(userId, message) {
  const connections = userConnections.get(userId)
  if (!connections) return

  const payload = JSON.stringify(message)
  connections.forEach((ws) => {
    if (ws.readyState === 1) { // OPEN
      ws.send(payload)
    }
  })
}

/**
 * Broadcast to all connected users (e.g., market price updates)
 */
export function broadcastToAll(message) {
  const payload = JSON.stringify(message)
  wss?.clients.forEach((ws) => {
    if (ws.readyState === 1) ws.send(payload)
  })
}

/**
 * Broadcast market price updates to all clients
 */
export function broadcastPrices(prices) {
  broadcastToAll({ type: 'PRICE_UPDATE', data: prices })
}

function send(ws, message) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(message))
  }
}

function handleClientMessage(ws, message) {
  switch (message.type) {
    case 'PING':
      send(ws, { type: 'PONG', timestamp: Date.now() })
      break
    case 'SUBSCRIBE_PRICES':
      ws.subscribedToPrices = true
      break
    default:
      logger.debug('Unknown WS message type:', message.type)
  }
}

export function getConnectedUsers() {
  return userConnections.size
}
