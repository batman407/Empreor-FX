import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function FinalCTA() {
  const navigate = useNavigate()

  return (
    <section style={{ padding: '120px 0', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background decoration */}
      <div className="radial-glow" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px' }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        opacity: 0.02,
        pointerEvents: 'none',
      }} />

      <div className="container-emperor" style={{ textAlign: 'center', position: 'relative' }}>
        {/* Crown icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(212,175,55,0.3)',
          }}>
            <svg width="36" height="30" viewBox="0 0 100 80" fill="none">
              <polygon points="50,5 18,55 50,40 82,55" fill="#0B0B0F" />
              <rect x="10" y="58" width="80" height="16" rx="3" fill="#0B0B0F" />
            </svg>
          </div>
        </motion.div>

        <motion.h2
          className="section-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', marginBottom: '20px' }}
        >
          Take Your Throne in the{' '}
          <span className="text-gold-gradient">Digital Markets</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          style={{ color: '#A0A0A8', fontSize: '18px', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 48px' }}
        >
          Join 2.4 million traders worldwide who chose Emperor FX as their platform of dominance. Your empire begins now.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            className="btn-gold"
            onClick={() => navigate('/register')}
            style={{
              padding: '18px 52px',
              fontSize: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 0 40px rgba(212,175,55,0.3)',
            }}
          >
            Create Free Account <ChevronRight size={18} />
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate('/trade?demo=true')}
            style={{ padding: '18px 40px', fontSize: '16px' }}
          >
            Try Demo First
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}
        >
          {[
            { value: '2.4M+', label: 'Active Users' },
            { value: '$4.7B+', label: 'Daily Volume' },
            { value: '180+', label: 'Countries' },
            { value: '99.99%', label: 'Uptime' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '22px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#6B6B78', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
