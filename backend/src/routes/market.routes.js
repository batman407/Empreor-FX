import { Router } from 'express'
import axios from 'axios'
import { getRedis } from '../cache/redis.js'
import { logger } from '../utils/logger.js'

const router = Router()
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

// Cache TTL constants
const PRICES_TTL = 30    // 30 seconds
const COINS_TTL = 60     // 60 seconds

/**
 * GET /api/v1/market/prices
 * Returns top 20 coins with prices (cached)
 */
router.get('/prices', async (req, res) => {
  const redis = getRedis()
  const cacheKey = 'market:prices:top20'

  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), cached: true })
    }

    const { data } = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: false,
        price_change_percentage: '1h,24h,7d',
      },
      timeout: 5000,
    })

    await redis.set(cacheKey, JSON.stringify(data), 'EX', PRICES_TTL)
    res.json({ success: true, data, cached: false })
  } catch (err) {
    logger.warn('CoinGecko rate limited, returning fallback data')
    res.json({ success: true, data: getFallbackPrices(), cached: false, fallback: true })
  }
})

/**
 * GET /api/v1/market/coin/:id
 * Single coin detail (cached)
 */
router.get('/coin/:id', async (req, res) => {
  const { id } = req.params
  const redis = getRedis()
  const cacheKey = `market:coin:${id}`

  const cached = await redis.get(cacheKey)
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true })

  try {
    const { data } = await axios.get(`${COINGECKO_BASE}/coins/${id}`, {
      params: { localization: false, tickers: false, community_data: false, developer_data: false },
      timeout: 5000,
    })

    const coin = {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      image: data.image?.large,
      current_price: data.market_data?.current_price?.usd,
      market_cap: data.market_data?.market_cap?.usd,
      price_change_24h: data.market_data?.price_change_percentage_24h,
      high_24h: data.market_data?.high_24h?.usd,
      low_24h: data.market_data?.low_24h?.usd,
      circulating_supply: data.market_data?.circulating_supply,
      description: data.description?.en?.slice(0, 500),
    }

    await redis.set(cacheKey, JSON.stringify(coin), 'EX', COINS_TTL)
    res.json({ success: true, data: coin })
  } catch (err) {
    res.status(503).json({ success: false, message: 'Market data temporarily unavailable' })
  }
})

function getFallbackPrices() {
  return [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 67450, price_change_percentage_24h: 2.34, market_cap: 1327000000000 },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3580, price_change_percentage_24h: 1.87, market_cap: 430000000000 },
    { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 182, price_change_percentage_24h: 4.15, market_cap: 82000000000 },
    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 425, price_change_percentage_24h: 0.92, market_cap: 65000000000 },
    { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.62, price_change_percentage_24h: -1.23, market_cap: 34000000000 },
  ]
}

export default router
