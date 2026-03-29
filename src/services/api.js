import axios from 'axios'

// ─── API CLIENT SETUP ─────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── REQUEST INTERCEPTOR (attach token) ──────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('emperor_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── RESPONSE INTERCEPTOR (auto-refresh token) ───────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('emperor_refresh_token')
      if (!refreshToken) {
        processQueue(error)
        isRefreshing = false
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefresh } = data.data
        saveTokens(accessToken, newRefresh)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ─── TOKEN HELPERS ────────────────────────────────────────────────────────────
export function saveTokens(accessToken, refreshToken) {
  localStorage.setItem('emperor_access_token', accessToken)
  localStorage.setItem('emperor_refresh_token', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('emperor_access_token')
  localStorage.removeItem('emperor_refresh_token')
}

// ─── AUTH API ─────────────────────────────────────────────────────────────────
// Auto-falls back to demo endpoints when PostgreSQL is not yet installed
async function smartAuth(realPath, demoPath, payload) {
  try {
    return await apiClient.post(realPath, payload)
  } catch (err) {
    const status = err?.response?.status
    // Fall back to demo when DB is not connected (503) or server error (500)
    if (status === 503 || status === 500 || !status) {
      console.info(`[Emperor FX] DB offline → using ${demoPath}`)
      return apiClient.post(demoPath, payload)
    }
    throw err
  }
}

export const authAPI = {
  register: (data) => smartAuth(
    '/auth/register',
    '/auth/demo-register',
    {
      ...data,
      firstName: data.firstName || data.first_name || data.name?.split(' ')[0],
      lastName: data.lastName || data.last_name || data.name?.split(' ').slice(1).join(' ') || 'Trader',
    }
  ),
  login: (data) => smartAuth('/auth/login', '/auth/demo-login', data),
  logout: () => {
    const rt = localStorage.getItem('emperor_refresh_token')
    return apiClient.post('/auth/logout', { refreshToken: rt }).catch(() => {}).finally(clearTokens)
  },
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  verifyEmail: (token) => apiClient.get(`/auth/verify-email/${token}`),
  setup2FA: () => apiClient.post('/auth/2fa/setup'),
  confirm2FA: (totpCode) => apiClient.post('/auth/2fa/confirm', { totpCode }),

  // Check if backend DB is connected
  checkHealth: async () => {
    try {
      const { data } = await apiClient.get('/../../health')
      return data?.database === 'connected'
    } catch { return false }
  },
}

// ─── USER API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.patch('/user/profile', data),
  changePassword: (data) => apiClient.post('/user/change-password', data),
  getNotifications: () => apiClient.get('/user/notifications'),
  markNotificationRead: (id) => apiClient.patch(`/user/notifications/${id}/read`),
  getSessions: () => apiClient.get('/user/sessions'),
  terminateSession: (id) => apiClient.delete(`/user/sessions/${id}`),
}

// ─── WALLET API ───────────────────────────────────────────────────────────────
export const walletAPI = {
  getWallets: () => apiClient.get('/wallet'),
  getBalance: (accountType) => apiClient.get(`/wallet/balance/${accountType}`),
  initiateDeposit: (data) => apiClient.post('/wallet/deposit', data),
  requestWithdrawal: (data) => apiClient.post('/wallet/withdraw', data),
  getTransactions: (params) => apiClient.get('/wallet/transactions', { params }),
}

// ─── TRADE API ────────────────────────────────────────────────────────────────
export const tradeAPI = {
  placeOrder: (data) => apiClient.post('/trade/order', data),
  getOrders: (params) => apiClient.get('/trade/orders', { params }),
  getPositions: (params) => apiClient.get('/trade/positions', { params }),
  getTradeHistory: (params) => apiClient.get('/trade/history', { params }),
  cancelOrder: (orderId) => apiClient.delete(`/trade/order/${orderId}`),
}

// ─── MARKET API ───────────────────────────────────────────────────────────────
export const marketAPI = {
  getPrices: () => apiClient.get('/market/prices'),
  getCoin: (id) => apiClient.get(`/market/coin/${id}`),
}

// ─── ADMIN API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUserDetail: (userId) => apiClient.get(`/admin/users/${userId}`),
  banUser: (userId, reason) => apiClient.patch(`/admin/users/${userId}/ban`, { ban: true, reason }),
  unbanUser: (userId) => apiClient.patch(`/admin/users/${userId}/ban`, { ban: false }),
  adjustBalance: (userId, data) => apiClient.patch(`/admin/users/${userId}/balance`, data),
  getPendingWithdrawals: () => apiClient.get('/admin/withdrawals/pending'),
  processWithdrawal: (id, action, note) =>
    apiClient.patch(`/admin/withdrawals/${id}`, { action, adminNote: note }),
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }),
}

// ─── LEGACY MARKET DATA (CoinGecko direct - fallback) ─────────────────────────
import axios2 from 'axios'
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

export const fetchMarketData = async () => {
  try {
    const { data } = await marketAPI.getPrices()
    if (data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data
    }
    throw new Error('Backend returned invalid market data array')
  } catch {
    try {
      const { data } = await axios2.get(`${COINGECKO_BASE}/coins/markets`, {
        params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 20, page: 1, sparkline: false },
      })
      if (Array.isArray(data) && data.length > 0) return data
      return getFallbackData()
    } catch {
      return getFallbackData()
    }
  }
}

export const getFallbackData = () => [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 67450, price_change_percentage_24h: 2.34, market_cap: 1327000000000, total_volume: 28500000000, market_cap_rank: 1 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 3580, price_change_percentage_24h: 1.87, market_cap: 430000000000, total_volume: 14200000000, market_cap_rank: 2 },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 182, price_change_percentage_24h: 4.15, market_cap: 82000000000, total_volume: 3800000000, market_cap_rank: 5 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', current_price: 425, price_change_percentage_24h: 0.92, market_cap: 65000000000, total_volume: 1900000000, market_cap_rank: 4 },
]

export const formatPrice = (price) => {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(4)}`
  return `$${price.toFixed(6)}`
}

export const formatMarketCap = (cap) => {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
  return `$${cap.toFixed(0)}`
}
