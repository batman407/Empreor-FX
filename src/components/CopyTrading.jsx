import { motion } from 'framer-motion'
import { Users, TrendingUp, Star, Copy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const traders = [
  {
    name: 'Marcus Chen',
    handle: '@marcus_elite',
    roi: '+284%',
    roiNum: 284,
    risk: 'Low',
    riskColor: '#00C896',
    followers: '12.4K',
    winRate: '87%',
    trades: 1240,
    avatar: 'MC',
    badge: 'Emperor',
  },
  {
    name: 'Sophia Laurent',
    handle: '@sophia_fx',
    roi: '+196%',
    roiNum: 196,
    risk: 'Medium',
    riskColor: '#D4AF37',
    followers: '8.7K',
    winRate: '79%',
    trades: 890,
    avatar: 'SL',
    badge: 'Platinum',
  },
  {
    name: 'Raj Patel',
    handle: '@rajcrypto',
    roi: '+341%',
    roiNum: 341,
    risk: 'Medium',
    riskColor: '#D4AF37',
    followers: '21.2K',
    winRate: '82%',
    trades: 2100,
    avatar: 'RP',
    badge: 'Emperor',
  },
  {
    name: 'Elena Voss',
    handle: '@elenafx_pro',
    roi: '+157%',
    roiNum: 157,
    risk: 'Low',
    riskColor: '#00C896',
    followers: '5.1K',
    winRate: '91%',
    trades: 560,
    avatar: 'EV',
    badge: 'Gold',
  },
]

export default function CopyTrading() {
  const navigate = useNavigate()

  return (
    <section id="copy-trading" style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
      <div className="container-emperor">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '60px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <div className="section-tag" style={{ marginBottom: '20px' }}>
                <Copy size={12} />
                Copy Trading
              </div>
              <h2 className="section-heading" style={{ marginBottom: '20px' }}>
                Copy Professional Crypto{' '}
                <span className="text-gold-gradient">Traders Automatically</span>
              </h2>
              <p style={{ color: '#A0A0A8', fontSize: '16px', lineHeight: 1.8, marginBottom: '24px' }}>
                Leverage the expertise of top-performing traders on Emperor FX. Automatically mirror their positions in real-time — no experience required.
              </p>
              <ul style={{ listStyle: 'none', marginBottom: '36px' }}>
                {[
                  'Allocate any amount from $50 to $1,000,000',
                  'Set maximum drawdown limits to control risk',
                  'Diversify across multiple traders automatically',
                  'Stop copying anytime with one click',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#A0A0A8', fontSize: '14px' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'rgba(212,175,55,0.15)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37' }} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="btn-gold" onClick={() => navigate('/register')} style={{ padding: '14px 32px' }}>
                Start Copy Trading
              </button>
            </div>

            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {traders.map((trader, i) => (
                  <motion.div
                    key={trader.name}
                    className="trader-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '13px', color: '#0B0B0F',
                        flexShrink: 0,
                      }}>
                        {trader.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#F5F5F5' }}>{trader.name}</div>
                        <div style={{ fontSize: '11px', color: '#6B6B78' }}>{trader.handle}</div>
                      </div>
                    </div>

                    {/* ROI */}
                    <div style={{
                      fontSize: '28px', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                      color: '#00C896', marginBottom: '12px',
                      textShadow: '0 0 20px rgba(0,200,150,0.3)',
                    }}>
                      {trader.roi}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6B6B78', marginBottom: '14px', letterSpacing: '0.5px' }}>
                      12-MONTH RETURN
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B6B78' }}>Win Rate</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F5' }}>{trader.winRate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B6B78' }}>Risk</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: trader.riskColor }}>{trader.risk}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B6B78', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Users size={10} /> Followers
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F5' }}>{trader.followers}</div>
                      </div>
                    </div>

                    <button
                      className="btn-gold"
                      style={{ width: '100%', padding: '9px', fontSize: '12px', textAlign: 'center' }}
                      onClick={() => navigate('/register')}
                    >
                      Copy Trader
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #copy-trading > div > div > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
