import axios from 'axios'

const BASE_URL = 'https://api.coingecko.com/api/v3'

export const fetchMarketData = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
      },
    })
    return data
  } catch (err) {
    console.error('CoinGecko API error:', err)
    return getFallbackData()
  }
}

// Fallback data for when API is rate-limited
export const getFallbackData = () => [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 67450, price_change_percentage_24h: 2.34, market_cap: 1327000000000, total_volume: 28500000000, market_cap_rank: 1 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 3580, price_change_percentage_24h: 1.87, market_cap: 430000000000, total_volume: 14200000000, market_cap_rank: 2 },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 182, price_change_percentage_24h: 4.15, market_cap: 82000000000, total_volume: 3800000000, market_cap_rank: 5 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', current_price: 425, price_change_percentage_24h: 0.92, market_cap: 65000000000, total_volume: 1900000000, market_cap_rank: 4 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', current_price: 0.62, price_change_percentage_24h: -1.23, market_cap: 34000000000, total_volume: 1200000000, market_cap_rank: 6 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', current_price: 0.48, price_change_percentage_24h: -0.78, market_cap: 17000000000, total_volume: 580000000, market_cap_rank: 8 },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png', current_price: 38.5, price_change_percentage_24h: 3.21, market_cap: 15800000000, total_volume: 820000000, market_cap_rank: 10 },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png', current_price: 8.74, price_change_percentage_24h: -2.45, market_cap: 12000000000, total_volume: 450000000, market_cap_rank: 13 },
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
