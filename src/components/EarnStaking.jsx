import { motion } from 'framer-motion'
import { TrendingUp, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const stakingOptions = [
  {
    asset: 'Ethereum',
    symbol: 'ETH',
    apy: '6%',
    apyNum: 6,
    minStake: '$100',
    lockPeriod: 'Flexible',
    color: '#7B7BFF',
    gradient: 'linear-gradient(135deg, rgba(123,123,255,0.15), rgba(123,123,255,0.03))',
  },
  {
    asset: 'Tether',
    symbol: 'USDT',
    apy: '8%',
    apyNum: 8,
    minStake: '$50',
    lockPeriod: '30 Days',
    color: '#00C896',
    gradient: 'linear-gradient(135deg, rgba(0,200,150,0.15), rgba(0,200,150,0.03))',
    featured: true,
  },
  {
    asset: 'Bitcoin',
    symbol: 'BTC',
    apy: '4%',
    apyNum: 4,
    minStake: '$500',
    lockPeriod: 'Flexible',
    color: '#F7931A',
    gradient: 'linear-gradient(135deg, rgba(247,147,26,0.15), rgba(247,147,26,0.03))',
  },
  {
    asset: 'Solana',
    symbol: 'SOL',
    apy: '7.5%',
    apyNum: 7.5,
    minStake: '$200',
    lockPeriod: '14 Days',
    color: '#9945FF',
    gradient: 'linear-gradient(135deg, rgba(153,69,255,0.15), rgba(153,69,255,0.03))',
  },
]

export default function EarnStaking() {
  const navigate = useNavigate()

  return (
    <section id="earn" style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
      <div className="container-emperor">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div className="section-tag" style={{ margin: '0 auto 20px' }}>
            <TrendingUp size={12} />
            Earn & Stake
          </div>
          <h2 className="section-heading">
            Earn Passive Income on{' '}
            <span className="text-gold-gradient">Your Crypto</span>
          </h2>
          <p style={{ color: '#A0A0A8', fontSize: '16px', marginTop: '16px', maxWidth: '520px', margin: '16px auto 0' }}>
            Put your digital assets to work. Stake with Emperor FX and earn industry-leading annual yields.
          </p>
        </motion.div>

        <div id="earn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {stakingOptions.map((option, i) => (
            <motion.div
              key={option.symbol}
              className="staking-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ background: option.gradient, cursor: 'pointer' }}
              onClick={() => navigate('/register')}
            >
              {option.featured && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
                  color: '#0B0B0F',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '100px',
                  letterSpacing: '0.5px',
                }}>
                  POPULAR
                </div>
              )}

              {/* Asset icon placeholder */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: `rgba(${option.color === '#00C896' ? '0,200,150' : option.color === '#7B7BFF' ? '123,123,255' : option.color === '#F7931A' ? '247,147,26' : '153,69,255'}, 0.2)`,
                border: `2px solid ${option.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '16px', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                color: option.color,
              }}>
                {option.symbol.slice(0, 2)}
              </div>

              <div style={{ fontSize: '14px', color: '#A0A0A8', marginBottom: '8px' }}>{option.asset}</div>
              <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Cinzel, serif', color: option.color, marginBottom: '4px' }}>
                {option.apy}
              </div>
              <div style={{ fontSize: '11px', color: '#6B6B78', letterSpacing: '1px', marginBottom: '20px' }}>ANNUAL YIELD</div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B6B78' }}>Min. Stake</span>
                  <span style={{ fontSize: '12px', color: '#F5F5F5', fontWeight: 600 }}>{option.minStake}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6B6B78', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={10} /> Lock Period
                  </span>
                  <span style={{ fontSize: '12px', color: '#F5F5F5', fontWeight: 600 }}>{option.lockPeriod}</span>
                </div>
              </div>

              <button
                className="btn-gold"
                style={{ width: '100%', marginTop: '20px', padding: '10px', fontSize: '13px' }}
                onClick={(e) => { e.stopPropagation(); navigate('/register') }}
              >
                Stake {option.symbol}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          #earn-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          #earn-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
