import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react'
import useStore from '../store/useStore'
import { fetchMarketData, formatPrice, formatMarketCap } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function MarketOverview() {
  const navigate = useNavigate()
  const { marketData, setMarketData, isLoadingMarket, setLoadingMarket } = useStore()
  const [prices, setPrices] = useState({})

  useEffect(() => {
    const load = async () => {
      if (marketData.length === 0) {
        setLoadingMarket(true)
        const data = await fetchMarketData()
        setMarketData(data)
        setLoadingMarket(false)
      }
    }
    load()
  }, [marketData.length, setMarketData, setLoadingMarket])

  // Simulate price flicker
  useEffect(() => {
    if (marketData.length === 0) return
    const interval = setInterval(() => {
      const updated = {}
      marketData.forEach(coin => {
        const jitter = (Math.random() - 0.5) * 0.001
        updated[coin.id] = coin.current_price * (1 + jitter)
      })
      setPrices(updated)
    }, 2000)
    return () => clearInterval(interval)
  }, [marketData])

  const displayData = marketData.length > 0 ? marketData : []

  return (
    <section id="markets" style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
      <div className="container-emperor">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '52px' }}
        >
          <div className="section-tag" style={{ margin: '0 auto 20px' }}>
            <BarChart2 size={12} />
            Live Market Data
          </div>
          <h2 className="section-heading">
            Live{' '}
            <span className="text-gold-gradient">Crypto Markets</span>
          </h2>
          <p style={{ color: '#A0A0A8', marginTop: '16px', fontSize: '16px' }}>
            Real-time prices from global markets — updated every 30 seconds
          </p>
        </motion.div>

        {isLoadingMarket && marketData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B6B78' }}>
            <div style={{
              width: '40px', height: '40px', border: '2px solid rgba(212,175,55,0.3)',
              borderTop: '2px solid #D4AF37', borderRadius: '50%', margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }} />
            Loading market data...
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, staggerChildren: 0.05 }}
            className="glass-card"
            style={{ overflow: 'hidden', padding: 0 }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="market-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Asset</th>
                    <th>Price</th>
                    <th>24h Change</th>
                    <th>Market Cap</th>
                    <th>Volume (24h)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((coin) => {
                    const livePrice = prices[coin.id] || coin.current_price
                    const isUp = coin.price_change_percentage_24h >= 0
                    return (
                      <motion.tr
                        key={coin.id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                      >
                        <td style={{ color: '#6B6B78', fontSize: '13px' }}>{coin.market_cap_rank}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={coin.image}
                              alt={`${coin.name} logo`}
                              width="32" height="32"
                              style={{ borderRadius: '50%' }}
                              loading="lazy"
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '14px', color: '#F5F5F5' }}>{coin.name}</div>
                              <div style={{ fontSize: '12px', color: '#6B6B78', textTransform: 'uppercase' }}>{coin.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '15px', fontVariantNumeric: 'tabular-nums' }}>
                          {formatPrice(livePrice)}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: isUp ? '#00C896' : '#FF4D4F',
                            fontWeight: 600,
                            fontSize: '13px',
                            background: isUp ? 'rgba(0,200,150,0.08)' : 'rgba(255,77,79,0.08)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                          }}>
                            {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                          </span>
                        </td>
                        <td style={{ color: '#A0A0A8', fontSize: '13px' }}>{formatMarketCap(coin.market_cap)}</td>
                        <td style={{ color: '#A0A0A8', fontSize: '13px' }}>{formatMarketCap(coin.total_volume)}</td>
                        <td>
                          <button
                            className="btn-gold"
                            style={{ padding: '6px 18px', fontSize: '12px' }}
                            onClick={() => navigate(`/trade?symbol=${coin.symbol.toUpperCase()}`)}
                          >
                            Trade
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}
