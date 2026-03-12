import { motion } from 'framer-motion'
import { Shield, Zap, BarChart, Brain, Globe, DollarSign } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Bank-Level Security',
    desc: 'Cold wallet storage, 2FA, AML/KYC compliance, and insurance fund protection safeguard every account.',
  },
  {
    icon: Zap,
    title: 'Lightning-Fast Execution',
    desc: 'Sub-millisecond order matching powered by our proprietary trading engine built for institutional volume.',
  },
  {
    icon: BarChart,
    title: 'Advanced Trading Tools',
    desc: 'Professional charting, 100+ indicators, futures, margin trading, and algorithmic order types.',
  },
  {
    icon: Brain,
    title: 'Emperor AI Insights',
    desc: 'AI-powered market signals, sentiment analysis, and real-time alerts to keep you ahead of the market.',
  },
  {
    icon: Globe,
    title: 'Global Infrastructure',
    desc: 'Servers across 12 regions ensure 99.99% uptime with <10ms latency for traders worldwide.',
  },
  {
    icon: DollarSign,
    title: 'Ultra-Low Trading Fees',
    desc: 'Start at 0.1% maker/taker fees. VIP tiers unlock fees as low as 0.01% for high-volume traders.',
  },
]

export default function PlatformPower() {
  return (
    <section style={{ padding: '100px 0', background: 'var(--bg-primary)' }}>
      <div className="container-emperor">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div className="section-tag" style={{ margin: '0 auto 20px' }}>
            Platform Capabilities
          </div>
          <h2 className="section-heading">
            Built for the{' '}
            <span className="text-gold-gradient">Global Elite</span>
          </h2>
          <p style={{ color: '#A0A0A8', marginTop: '16px', fontSize: '16px', maxWidth: '560px', margin: '16px auto 0' }}>
            Every feature engineered to give serious traders an institutional edge in global digital asset markets.
          </p>
        </motion.div>

        <div id="platform-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}>
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                className="glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}
              >
                {/* Top accent */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                }} />

                {/* Icon */}
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <Icon size={24} color="#D4AF37" />
                </div>

                <h3 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#F5F5F5',
                  marginBottom: '12px',
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#A0A0A8', fontSize: '14px', lineHeight: 1.7 }}>
                  {feature.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #platform-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          #platform-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
