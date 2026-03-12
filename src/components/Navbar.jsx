import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const navItems = [
  { label: 'Markets', href: '/#markets' },
  { label: 'Trade', href: '/trade' },
  { label: 'Copy Trade', href: '/#copy-trading' },
  { label: 'Earn', href: '/#earn' },
  { label: 'VIP', href: '/#vip' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isLoggedIn, logout } = useStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScroll = (href) => {
    setMobileOpen(false)
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '')
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: scrolled ? '12px 0' : '20px 0',
        background: scrolled ? 'rgba(11,11,15,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(212,175,55,0.1)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="container-emperor" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="18" viewBox="0 0 100 80" fill="none">
              <polygon points="50,5 18,55 50,40 82,55" fill="#0B0B0F" />
              <rect x="10" y="58" width="80" height="16" rx="3" fill="#0B0B0F" />
            </svg>
          </div>
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '20px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '2px',
          }}>
            EMPEROR FX
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => item.href.startsWith('/#') ? handleScroll(item.href) : navigate(item.href)}
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden-mobile">
          {isLoggedIn ? (
            <>
              <button className="btn-outline" onClick={() => navigate('/dashboard')} style={{ padding: '9px 20px', fontSize: '13px' }}>
                Dashboard
              </button>
              <button className="btn-gold" onClick={() => { logout(); navigate('/') }} style={{ padding: '9px 20px', fontSize: '13px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => navigate('/login')} style={{ padding: '9px 20px', fontSize: '13px' }}>
                Sign In
              </button>
              <button className="btn-gold" onClick={() => navigate('/register')} style={{ padding: '9px 20px', fontSize: '13px' }}>
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Burger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-only"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <div style={{ width: '24px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={mobileOpen
                  ? i === 0 ? { rotate: 45, y: 10 } : i === 1 ? { opacity: 0 } : { rotate: -45, y: -10 }
                  : { rotate: 0, y: 0, opacity: 1 }
                }
                style={{
                  display: 'block',
                  height: '2px',
                  background: '#D4AF37',
                  borderRadius: '2px',
                  transformOrigin: 'center',
                }}
              />
            ))}
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'rgba(11,11,15,0.98)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(212,175,55,0.15)',
              padding: '20px 24px',
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.href.startsWith('/#') ? handleScroll(item.href) : navigate(item.href)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 0',
                  background: 'none',
                  border: 'none',
                  color: '#A0A0A8',
                  fontSize: '15px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(212,175,55,0.05)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {item.label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn-outline" onClick={() => { navigate('/login'); setMobileOpen(false) }} style={{ flex: 1, padding: '10px', fontSize: '13px' }}>Sign In</button>
              <button className="btn-gold" onClick={() => { navigate('/register'); setMobileOpen(false) }} style={{ flex: 1, padding: '10px', fontSize: '13px' }}>Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-only { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </motion.nav>
  )
}
