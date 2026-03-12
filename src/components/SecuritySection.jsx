import { motion } from 'framer-motion'
import { Shield, Key, Umbrella, FileCheck, Database, Lock } from 'lucide-react'

const securityItems = [
  {
    icon: Database,
    title: 'Cold Wallet Storage',
    desc: '95% of all digital assets stored in air-gapped cold wallets, completely offline and immune to online threats.',
  },
  {
    icon: Key,
    title: 'Two-Factor Authentication',
    desc: 'Mandatory 2FA via authenticator apps, hardware keys (YubiKey), and biometric verification for all actions.',
  },
  {
    icon: Umbrella,
    title: 'Insurance Fund Protection',
    desc: 'A dedicated $500M insurance fund protects user assets against security incidents and system failures.',
  },
  {
    icon: FileCheck,
    title: 'AML / KYC Compliance',
    desc: 'Full regulatory compliance across 90+ jurisdictions with institutional-grade identity verification protocols.',
  },
  {
    icon: Shield,
    title: 'Proof of Reserves',
    desc: 'Real-time cryptographic proof that Emperor FX holds 100% of user assets in verifiable on-chain reserves.',
  },
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    desc: 'Military-grade TLS 1.3 encryption for all data in transit. Zero-knowledge architecture for sensitive data.',
  },
]

export default function SecuritySection() {
  return (
    <section id="security" style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
      <div className="container-emperor">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}
        >
          {/* Left */}
          <div>
            <div className="section-tag" style={{ marginBottom: '20px' }}>
              <Shield size={12} />
              Security & Compliance
            </div>
            <h2 className="section-heading" style={{ marginBottom: '20px' }}>
              Institutional-Grade{' '}
              <span className="text-gold-gradient">Security Infrastructure</span>
            </h2>
            <p style={{ color: '#A0A0A8', fontSize: '16px', lineHeight: 1.8, marginBottom: '32px' }}>
              Emperor FX was built from the ground up with security as the foundation. Every layer of our infrastructure has been hardened against the most sophisticated threat actors in the industry.
            </p>

            {/* Security badges */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {['SOC 2 Type II', 'ISO 27001', 'PCI-DSS', 'GDPR Compliant'].map((badge) => (
                <div key={badge} style={{
                  background: 'rgba(212,175,55,0.06)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#D4AF37',
                  letterSpacing: '0.5px',
                }}>
                  {badge}
                </div>
              ))}
            </div>

            {/* Uptime stat */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Cinzel, serif', color: '#00C896' }}>99.99%</div>
                <div style={{ fontSize: '12px', color: '#6B6B78', marginTop: '4px' }}>Platform Uptime SLA</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(212,175,55,0.1)' }} />
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Cinzel, serif', color: '#D4AF37' }}>$500M</div>
                <div style={{ fontSize: '12px', color: '#6B6B78', marginTop: '4px' }}>Insurance Fund</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(212,175,55,0.1)' }} />
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Cinzel, serif', color: '#A0A0A8' }}>95%</div>
                <div style={{ fontSize: '12px', color: '#6B6B78', marginTop: '4px' }}>Cold Storage Ratio</div>
              </div>
            </div>
          </div>

          {/* Right: Security grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {securityItems.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  className="glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  style={{ padding: '24px' }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '14px',
                  }}>
                    <Icon size={18} color="#D4AF37" />
                  </div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#F5F5F5', marginBottom: '8px', lineHeight: 1.4 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6B6B78', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #security > div > div { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  )
}
