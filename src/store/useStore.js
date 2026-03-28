import { create } from 'zustand'
import { authAPI, walletAPI, tradeAPI, saveTokens, clearTokens } from '../services/api'

const useStore = create((set, get) => ({
  // ─── Auth State ─────────────────────────────────────────────────────────────
  isLoggedIn: !!localStorage.getItem('emperor_access_token'),
  user: JSON.parse(localStorage.getItem('emperor_user') || 'null'),
  accountMode: localStorage.getItem('emperor_mode') || 'demo', // 'demo' | 'live'

  // ─── Wallet State ────────────────────────────────────────────────────────────
  demoBalance: 10000,
  liveBalance: 0,
  wallets: [],
  isLoadingWallets: false,

  // ─── Demo Trading State (local, no backend needed) ───────────────────────────
  demoPositions: [],
  demoTransactions: [],
  portfolio: { BTC: 0, ETH: 0, SOL: 0, USDT: 10000 },

  // ─── Live Trading State ──────────────────────────────────────────────────────
  livePositions: [],
  liveOrders: [],

  // ─── Market Data ─────────────────────────────────────────────────────────────
  marketData: [],
  isLoadingMarket: false,

  // ─── UI State ────────────────────────────────────────────────────────────────
  showIntro: true,
  activePage: 'home',

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  login: (userData) => {
    localStorage.setItem('emperor_user', JSON.stringify(userData))
    set({ isLoggedIn: true, user: userData })
  },

  logout: async () => {
    try { await authAPI.logout() } catch (_) {}
    clearTokens()
    localStorage.removeItem('emperor_user')
    set({
      isLoggedIn: false,
      user: null,
      wallets: [],
      demoBalance: 10000,
      liveBalance: 0,
      demoTransactions: [],
      demoPositions: [],
      portfolio: { BTC: 0, ETH: 0, SOL: 0, USDT: 10000 },
    })
  },

  // ─── Real register via backend ───────────────────────────────────────────────
  registerUser: async ({ name, email, password, country = '' }) => {
    const [firstName, ...rest] = name.trim().split(' ')
    const lastName = rest.join(' ') || firstName

    const username = email.split('@')[0].replace(/[^a-z0-9]/gi, '') + Math.floor(Math.random() * 999)

    const { data } = await authAPI.register({
      email,
      username,
      password,
      firstName,
      lastName,
      country,
    })

    saveTokens(data.data.accessToken, data.data.refreshToken)
    const user = { ...data.data.user, name: `${data.data.user.first_name} ${data.data.user.last_name}` }
    localStorage.setItem('emperor_user', JSON.stringify(user))
    set({ isLoggedIn: true, user })
    return data
  },

  // ─── Real login via backend ──────────────────────────────────────────────────
  loginUser: async ({ email, password, totpCode }) => {
    const { data } = await authAPI.login({ email, password, totpCode })

    if (data.requires2FA) return data // caller handles 2FA flow

    saveTokens(data.data.accessToken, data.data.refreshToken)
    const user = { ...data.data.user, name: `${data.data.user.first_name} ${data.data.user.last_name}` }
    localStorage.setItem('emperor_user', JSON.stringify(user))
    set({ isLoggedIn: true, user })
    return data
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCOUNT MODE
  // ═══════════════════════════════════════════════════════════════════════════
  setAccountMode: (mode) => {
    localStorage.setItem('emperor_mode', mode)
    set({ accountMode: mode })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WALLET ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  fetchWallets: async () => {
    set({ isLoadingWallets: true })
    try {
      const { data } = await walletAPI.getWallets()
      const wallets = data.data.wallets
      const demo = wallets.find(w => w.account_type === 'demo')
      const live = wallets.find(w => w.account_type === 'live')
      set({
        wallets,
        demoBalance: parseFloat(demo?.balance || 10000),
        liveBalance: parseFloat(live?.balance || 0),
      })
    } catch (_) {
      // Keep local demo balance if backend not available
    } finally {
      set({ isLoadingWallets: false })
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARKET DATA
  // ═══════════════════════════════════════════════════════════════════════════
  setMarketData: (data) => set({ marketData: data }),
  setLoadingMarket: (val) => set({ isLoadingMarket: val }),

  // ═══════════════════════════════════════════════════════════════════════════
  // UI
  // ═══════════════════════════════════════════════════════════════════════════
  setShowIntro: (val) => set({ showIntro: val }),
  setActivePage: (page) => set({ activePage: page }),

  // ═══════════════════════════════════════════════════════════════════════════
  // DEMO TRADING (local simulation — works without backend)
  // ═══════════════════════════════════════════════════════════════════════════
  buyAsset: (symbol, amountUSD, price) => {
    const { demoBalance, portfolio } = get()
    if (amountUSD > demoBalance) return { success: false, msg: 'Insufficient balance' }
    const coins = amountUSD / price
    set({
      demoBalance: demoBalance - amountUSD,
      portfolio: { ...portfolio, [symbol]: (portfolio[symbol] || 0) + coins },
      demoTransactions: [
        { id: Date.now(), type: 'BUY', symbol, amount: coins, value: amountUSD, price, time: new Date().toISOString() },
        ...get().demoTransactions,
      ],
    })
    return { success: true, msg: `Bought ${coins.toFixed(6)} ${symbol}` }
  },

  sellAsset: (symbol, amount, price) => {
    const { demoBalance, portfolio } = get()
    const held = portfolio[symbol] || 0
    if (amount > held) return { success: false, msg: 'Insufficient holdings' }
    const revenue = amount * price
    set({
      demoBalance: demoBalance + revenue,
      portfolio: { ...portfolio, [symbol]: held - amount },
      demoTransactions: [
        { id: Date.now(), type: 'SELL', symbol, amount, value: revenue, price, time: new Date().toISOString() },
        ...get().demoTransactions,
      ],
    })
    return { success: true, msg: `Sold ${amount.toFixed(6)} ${symbol}` }
  },
}))

export default useStore
