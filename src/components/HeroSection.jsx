import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'
import { fetchMarketData } from '../services/api'

const TICKER_SYMBOLS = ['BTC', 'ETH', 'SOL']

function AnimatedCounter({ target, prefix = '', suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const start = Date.now()
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setVal(Math.floor(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
        else setVal(target)
      }
      tick()
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref}>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  )
}

export default function HeroSection() {
  const navigate = useNavigate()
  const { marketData, setMarketData, setLoadingMarket } = useStore()
  const [tickerData, setTickerData] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoadingMarket(true)
      const data = await fetchMarketData()
      setMarketData(data)
      setTickerData(data.filter(c => TICKER_SYMBOLS.includes(c.symbol.toUpperCase())))
      setLoadingMarket(false)
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [setMarketData, setLoadingMarket])

  const stats = [
    { label: 'Active Traders', value: 2400000, suffix: '+', prefix: '' },
    { label: 'Daily Volume', value: 47, suffix: 'B+', prefix: '$' },
    { label: 'Countries', value: 180, suffix: '+', prefix: '' },
    { label: 'Assets', value: 350, suffix: '+', prefix: '' },
  ]

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: '100px',
      }}
    >
      {/* Background elements */}
      <div className="radial-glow" style={{ top: '20%', left: '-10%' }} />
      <div className="radial-glow" style={{ top: '60%', right: '-10%', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />

      {/* Grid lines bg */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div className="container-emperor" style={{ width: '100%', paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>

          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <div className="section-tag" style={{ marginBottom: '24px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00C896', display: 'inline-block' }} />
                Live Markets Active
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(36px, 5.5vw, 72px)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '24px',
                color: '#F5F5F5',
              }}
            >
              Rule the{' '}
              <span style={{
                background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block',
                filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.3))',
              }}>
                Digital Asset
              </span>
              Markets
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              style={{
                fontSize: '18px',
                lineHeight: 1.7,
                color: '#A0A0A8',
                marginBottom: '36px',
                maxWidth: '480px',
              }}
            >
              Institutional-grade cryptocurrency trading platform built for global investors. Access 350+ digital assets with lightning-fast execution.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '52px' }}
            >
              <button
                className="btn-gold"
                onClick={() => navigate('/register')}
                style={{ padding: '15px 36px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Start Trading <ChevronRight size={16} />
              </button>
              <button
                className="btn-outline"
                onClick={() => navigate('/trade?demo=true')}
                style={{ padding: '15px 36px', fontSize: '15px' }}
              >
                Try Demo Account
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', paddingTop: '28px', borderTop: '1px solid rgba(212,175,55,0.1)' }}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B6B78', marginTop: '4px', letterSpacing: '0.5px' }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side - Chart + ticker */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ position: 'relative' }}
          >
            {/* Live ticker bar */}
            <div className="glass-card" style={{ marginBottom: '16px', padding: '12px 20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {(tickerData.length > 0 ? tickerData : [
                { symbol: 'btc', current_price: 67450, price_change_percentage_24h: 2.34 },
                { symbol: 'eth', current_price: 3580, price_change_percentage_24h: 1.87 },
                { symbol: 'sol', current_price: 182, price_change_percentage_24h: 4.15 },
              ]).map((coin) => (
                <div key={coin.symbol} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#F5F5F5', letterSpacing: '0.5px' }}>
                    {coin.symbol.toUpperCase()}/USDT
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#F5F5F5' }}>
                    ${coin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: coin.price_change_percentage_24h >= 0 ? '#00C896' : '#FF4D4F',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}>
                    {coin.price_change_percentage_24h >= 0
                      ? <TrendingUp size={12} />
                      : <TrendingDown size={12} />
                    }
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>

            {/* TradingView Widget */}
            <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '12px', height: '420px', position: 'relative' }}>
              <iframe
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_hero&symbol=BINANCE%3ABTCUSDT&interval=H&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=141419&studies=&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideasbutton=1&bgcolor=141419&gridcolor=1C1C24&linecolor=D4AF37"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowTransparency="true"
                title="BTC/USDT Live Chart"
              />
            </div>

            {/* Floating glow */}
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          </motion.div>
        </div>
      </div>

      {/* Mobile override */}
      <style>{`
        @media (max-width: 900px) {
          #hero > div > div { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  )
}
