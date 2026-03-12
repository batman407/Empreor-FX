import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Auth State
  isLoggedIn: false,
  user: null,

  // Demo Trading State
  demoBalance: 10000,
  demoPositions: [],
  demoTransactions: [],
  portfolio: {
    BTC: 0,
    ETH: 0,
    SOL: 0,
    USDT: 10000,
  },

  // Market Data
  marketData: [],
  isLoadingMarket: false,

  // UI State
  showIntro: true,
  activePage: 'home',

  // Actions
  login: (userData) => set({ isLoggedIn: true, user: userData }),
  logout: () => set({ isLoggedIn: false, user: null }),

  setShowIntro: (val) => set({ showIntro: val }),
  setActivePage: (page) => set({ activePage: page }),

  setMarketData: (data) => set({ marketData: data }),
  setLoadingMarket: (val) => set({ isLoadingMarket: val }),

  // Demo Trading Actions
  buyAsset: (symbol, amountUSD, price) => {
    const { demoBalance, portfolio } = get()
    if (amountUSD > demoBalance) return { success: false, msg: 'Insufficient balance' }
    const coins = amountUSD / price
    set({
      demoBalance: demoBalance - amountUSD,
      portfolio: { ...portfolio, [symbol]: (portfolio[symbol] || 0) + coins },
      demoTransactions: [
        {
          id: Date.now(),
          type: 'BUY',
          symbol,
          amount: coins,
          value: amountUSD,
          price,
          time: new Date().toISOString(),
        },
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
        {
          id: Date.now(),
          type: 'SELL',
          symbol,
          amount,
          value: revenue,
          price,
          time: new Date().toISOString(),
        },
        ...get().demoTransactions,
      ],
    })
    return { success: true, msg: `Sold ${amount.toFixed(6)} ${symbol}` }
  },
}))

export default useStore
