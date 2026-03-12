import { motion } from 'framer-motion'
import { Crown, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const tiers = [
  {
    name: 'Silver',
    icon: '🥈',
    color: '#C0C0C0',
    volumeReq: '$0 – $10K',
    tradingFee: '0.10%',
    withdrawalLimit: '$500/day',
    copyTrading: true,
    aiInsights: false,
    dedicatedManager: false,
    apiAccess: false,
    vipSupport: false,
  },
  {
    name: 'Gold',
    icon: '🥇',
    color: '#D4AF37',
    volumeReq: '$10K – $100K',
    tradingFee: '0.07%',
    withdrawalLimit: '$5K/day',
    copyTrading: true,
    aiInsights: true,
    dedicatedManager: false,
    apiAccess: true,
    vipSupport: false,
  },
  {
    name: 'Platinum',
    icon: '💎',
    color: '#A8D8EA',
    volumeReq: '$100K – $1M',
    tradingFee: '0.04%',
    withdrawalLimit: '$50K/day',
    copyTrading: true,
    aiInsights: true,
    dedicatedManager: true,
    apiAccess: true,
    vipSupport: true,
    featured: true,
  },
  {
    name: 'Emperor Elite',
    icon: '👑',
    color: '#D4AF37',
    volumeReq: '$1M+',
    tradingFee: '0.01%',
    withdrawalLimit: 'Unlimited',
    copyTrading: true,
    aiInsights: true,
    dedicatedManager: true,
    apiAccess: true,
    vipSupport: true,
  },
]

const featureRows = [
  { key: 'tradingFee', label: 'Trading Fee', format: (v) => v },
  { key: 'withdrawalLimit', label: 'Daily Withdrawal', format: (v) => v },
  { key: 'copyTrading', label: 'Copy Trading', format: (v) => (v ? <Check size={16} color="#00C896" /> : <X size={16} color="#6B6B78" />) },
  { key: 'aiInsights', label: 'Emperor AI Signals', format: (v) => (v ? <Check size={16} color="#00C896" /> : <X size={16} color="#6B6B78" />) },
  { key: 'dedicatedManager', label: 'Dedicated Manager', format: (v) => (v ? <Check size={16} color="#00C896" /> : <X size={16} color="#6B6B78" />) },
  { key: 'apiAccess', label: 'Advanced API Access', format: (v) => (v ? <Check size={16} color="#00C896" /> : <X size={16} color="#6B6B78" />) },
  { key: 'vipSupport', label: '24/7 VIP Support', format: (v) => (v ? <Check size={16} color="#00C896" /> : <X size={16} color="#6B6B78" />) },
]

export default function VIPTiers() {
  const navigate = useNavigate()

  return (
    <section id="vip" style={{ padding: '100px 0', background: 'var(--bg-primary)' }}>
      <div className="container-emperor">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div className="section-tag" style={{ margin: '0 auto 20px' }}>
            <Crown size={12} />
            VIP Program
          </div>
          <h2 className="section-heading">
            Your Path to{' '}
            <span className="text-gold-gradient">Emperor Status</span>
          </h2>
          <p style={{ color: '#A0A0A8', fontSize: '16px', marginTop: '16px', maxWidth: '520px', margin: '16px auto 0' }}>
            The more you trade, the more exclusive your privileges. Unlock increasingly powerful benefits as you ascend the ranks.
          </p>
        </motion.div>

        {/* Tier cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '48px' }}>
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`tier-card ${tier.featured ? 'featured' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {tier.featured && (
                <div style={{
                  position: 'absolute',
                  top: '-1px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
                  color: '#0B0B0F', fontSize: '10px', fontWeight: 700,
                  padding: '4px 16px', borderRadius: '0 0 8px 8px', letterSpacing: '1px',
                }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>{tier.icon}</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', fontWeight: 700, color: tier.color }}>
                  {tier.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6B6B78', marginTop: '6px' }}>Vol: {tier.volumeReq}</div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: tier.color }}>
                  {tier.tradingFee}
                </div>
                <div style={{ fontSize: '11px', color: '#6B6B78', letterSpacing: '1px' }}>MAKER/TAKER FEE</div>
              </div>

              {featureRows.slice(2).map((row) => (
                <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '12px', color: '#6B6B78' }}>{row.label}</span>
                  <span>{row.format(tier[row.key])}</span>
                </div>
              ))}

              <button
                className={tier.featured ? 'btn-gold' : 'btn-outline'}
                style={{ width: '100%', marginTop: '20px', padding: '10px', fontSize: '13px' }}
                onClick={() => navigate('/register')}
              >
                {tier.name === 'Emperor Elite' ? 'Apply Now' : 'Get Started'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          #vip > div > div:nth-child(2) { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          #vip > div > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
