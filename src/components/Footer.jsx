import { Link } from 'react-router-dom'

const footerLinks = {
  Company: ['About Us', 'Careers', 'Press', 'Blog', 'Partners'],
  Products: ['Spot Trading', 'Futures', 'Copy Trading', 'Staking', 'API'],
  Support: ['Help Center', 'Contact Us', 'Trading Guides', 'FAQ', 'Status'],
  Legal: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Risk Disclosure', 'AML Policy'],
}

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid rgba(212,175,55,0.1)', padding: '80px 0 40px' }}>
      <div className="container-emperor">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '48px', marginBottom: '60px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="16" viewBox="0 0 100 80" fill="none">
                  <polygon points="50,5 18,55 50,40 82,55" fill="#0B0B0F" />
                  <rect x="10" y="58" width="80" height="16" rx="3" fill="#0B0B0F" />
                </svg>
              </div>
              <span style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '18px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '2px',
              }}>
                EMPEROR FX
              </span>
            </div>

            <p style={{ color: '#A0A0A8', fontSize: '14px', lineHeight: 1.8, marginBottom: '24px', maxWidth: '240px' }}>
              The global digital asset exchange built for the elite. Trade, conquer, accumulate.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {['𝕏', 'T', 'in', 'yt'].map((icon) => (
                <div key={icon} style={{
                  width: '36px', height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(212,175,55,0.06)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, color: '#A0A0A8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#D4AF37',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                {category}
              </h3>
              <ul style={{ listStyle: 'none' }}>
                {links.map((link) => (
                  <li key={link} style={{ marginBottom: '12px' }}>
                    <a href="#" style={{
                      color: '#A0A0A8',
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#D4AF37'}
                    onMouseLeave={(e) => e.target.style.color = '#A0A0A8'}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Gold separator */}
        <div className="gold-separator" style={{ width: '100%', marginBottom: '32px' }} />

        {/* Bottom row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div style={{ color: '#6B6B78', fontSize: '13px' }}>
            © 2026 Emperor FX. All rights reserved.
          </div>

          {/* Risk disclaimer */}
          <div style={{
            background: 'rgba(255,77,79,0.05)',
            border: '1px solid rgba(255,77,79,0.15)',
            borderRadius: '8px',
            padding: '12px 20px',
            maxWidth: '560px',
            fontSize: '11px',
            color: '#6B6B78',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: '#FF4D4F' }}>⚠️ Risk Disclaimer:</strong>{' '}
            Emperor FX is a demo trading platform. Trading results shown are simulated and do not represent real financial outcomes. Cryptocurrency trading involves significant risk of loss. Never invest more than you can afford to lose. Emperor FX does not provide investment advice.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          footer > div > div:first-child { grid-template-columns: 1fr !important; }
          footer > div > div:last-child { flex-direction: column !important; }
        }
      `}</style>
    </footer>
  )
}
