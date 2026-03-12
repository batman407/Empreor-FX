import { motion } from 'framer-motion'
import { Play, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DemoTrading() {
  const navigate = useNavigate()

  return (
    <section id="demo" style={{ padding: '100px 0', background: 'var(--bg-primary)' }}>
      <div className="container-emperor">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(20,20,25,0.9) 50%, rgba(212,175,55,0.03) 100%)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '24px',
            padding: '80px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div className="radial-glow" style={{ top: '-50%', left: '50%', transform: 'translateX(-50%)' }} />

          {/* Virtual balance badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '100px',
              padding: '10px 24px',
              marginBottom: '32px',
            }}
          >
            <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Cinzel, serif', color: '#D4AF37' }}>
              $10,000
            </span>
            <span style={{ fontSize: '14px', color: '#A0A0A8' }}>Virtual Balance Included</span>
          </motion.div>

          <h2
            className="section-heading"
            style={{ marginBottom: '20px' }}
          >
            Practice Crypto Trading with{' '}
            <span className="text-gold-gradient">$10,000 Virtual Balance</span>
          </h2>

          <p style={{
            color: '#A0A0A8',
            fontSize: '17px',
            lineHeight: 1.8,
            maxWidth: '600px',
            margin: '0 auto 40px',
          }}>
            Master the markets risk-free. Experience the full Emperor FX platform with simulated funds — real charts, real prices, zero risk.
          </p>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
            {[
              ['Real-time price feeds', true],
              ['Full order types', true],
              ['Live charts', true],
              ['24/7 demo access', true],
            ].map(([label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A0A0A8', fontSize: '14px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00C896' }} />
                {label}
              </div>
            ))}
          </div>

          <button
            className="btn-gold"
            onClick={() => navigate('/trade?demo=true')}
            style={{
              padding: '18px 48px',
              fontSize: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Play size={18} />
            Launch Demo Mode
          </button>

          {/* Disclaimer */}
          <div style={{
            marginTop: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#6B6B78',
            fontSize: '12px',
          }}>
            <AlertCircle size={14} />
            Demo environment — No real funds involved. Past performance is not indicative of future results.
          </div>
        </motion.div>
      </div>
    </section>
  )
}
