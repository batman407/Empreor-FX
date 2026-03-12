import { motion } from 'framer-motion'
import { Calendar, TrendingUp, AlertCircle, Clock } from 'lucide-react'

const events = [
  {
    date: 'Mar 19, 2026',
    time: '14:00 UTC',
    event: 'FOMC Interest Rate Decision',
    category: 'MACRO',
    impact: 'HIGH',
    impactColor: '#FF4D4F',
    description: 'Federal Reserve interest rate announcement — major BTC volatility expected',
  },
  {
    date: 'Mar 21, 2026',
    time: '08:30 UTC',
    event: 'US CPI Data Release',
    category: 'ECONOMIC',
    impact: 'HIGH',
    impactColor: '#FF4D4F',
    description: 'Consumer Price Index monthly report — inflation metric closely watched by crypto markets',
  },
  {
    date: 'Mar 24, 2026',
    time: '09:00 UTC',
    event: 'Bitcoin Spot ETF Flows Report',
    category: 'CRYPTO',
    impact: 'MEDIUM',
    impactColor: '#D4AF37',
    description: 'Weekly institutional ETF flow data — bullish/bearish sentiment indicator',
  },
  {
    date: 'Mar 28, 2026',
    time: '00:00 UTC',
    event: 'Ethereum Token Unlock',
    category: 'CRYPTO',
    impact: 'MEDIUM',
    impactColor: '#D4AF37',
    description: '48M ETH unlock from validator staking — potential selling pressure',
  },
  {
    date: 'Apr 02, 2026',
    time: '08:30 UTC',
    event: 'US Non-Farm Payrolls',
    category: 'ECONOMIC',
    impact: 'MEDIUM',
    impactColor: '#D4AF37',
    description: 'Monthly jobs report influencing Fed policy and risk appetite across crypto markets',
  },
  {
    date: 'Apr 10, 2026',
    time: '14:00 UTC',
    event: 'SEC Crypto Regulatory Hearing',
    category: 'REGULATORY',
    impact: 'HIGH',
    impactColor: '#FF4D4F',
    description: 'Congressional hearing on cryptocurrency market regulation framework',
  },
]

const categoryColors = {
  MACRO: '#7B7BFF',
  ECONOMIC: '#00C896',
  CRYPTO: '#D4AF37',
  REGULATORY: '#FF8C00',
}

export default function EconomicCalendar() {
  return (
    <section id="calendar" style={{ padding: '100px 0', background: 'var(--bg-primary)' }}>
      <div className="container-emperor">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '52px' }}
        >
          <div className="section-tag" style={{ margin: '0 auto 20px' }}>
            <Calendar size={12} />
            Economic Calendar
          </div>
          <h2 className="section-heading">
            Market-Moving{' '}
            <span className="text-gold-gradient">Events Calendar</span>
          </h2>
          <p style={{ color: '#A0A0A8', fontSize: '16px', marginTop: '16px', maxWidth: '520px', margin: '16px auto 0' }}>
            Track FOMC decisions, CPI data, ETF approvals, and crypto token unlocks that move the markets.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map((event, i) => (
            <motion.div
              key={event.event}
              className="glass-card"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              style={{
                padding: '20px 28px',
                display: 'grid',
                gridTemplateColumns: '160px 1fr auto',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              {/* Date/Time */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F5', marginBottom: '4px' }}>
                  {event.date}
                </div>
                <div style={{ fontSize: '12px', color: '#6B6B78', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} />
                  {event.time}
                </div>
              </div>

              {/* Event details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{
                    background: `${categoryColors[event.category]}20`,
                    border: `1px solid ${categoryColors[event.category]}40`,
                    color: categoryColors[event.category],
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                  }}>
                    {event.category}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F5' }}>{event.event}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#6B6B78', lineHeight: 1.5 }}>{event.description}</p>
              </div>

              {/* Impact */}
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                <div style={{
                  background: `${event.impactColor}15`,
                  border: `1px solid ${event.impactColor}40`,
                  color: event.impactColor,
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '6px',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <AlertCircle size={11} />
                  {event.impact}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #calendar .glass-card { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>
    </section>
  )
}
