import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Check, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'
import useStore from '../store/useStore'

const features = ['$10,000 demo balance', 'Real-time market data', 'Copy trading access', 'Zero fees on demo']

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Symbol', ok: /[@$!%*?&]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const color = score <= 1 ? '#FF4D4F' : score <= 2 ? '#F7931A' : score === 3 ? '#D4AF37' : '#00C896'
  if (!password) return null
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= score ? color : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: '11px', color: c.ok ? '#00C896' : '#6B6B78', display: 'flex', alignItems: 'center', gap: '3px' }}>
            {c.ok ? <CheckCircle size={10} /> : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { registerUser } = useStore()
  const [form, setForm] = useState({ name: '', email: '', country: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (!agreed) { setError('Please accept the Terms of Service'); return }

    setLoading(true)
    setError('')

    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        country: form.country,
      })
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Error creating account'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '13px',
    color: '#F5F5F5',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '40px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="radial-glow" style={{ top: '20%', left: '60%' }} />
      <div className="radial-glow" style={{ bottom: '10%', left: '20%', background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', maxWidth: '960px', width: '100%', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Left: Features */}
        <motion.div
          initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
          className="hidden-mobile"
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #D4AF37, #F6E27A)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="20" viewBox="0 0 100 80" fill="none">
                <polygon points="50,5 18,55 50,40 82,55" fill="#0B0B0F" />
                <rect x="10" y="58" width="80" height="16" rx="3" fill="#0B0B0F" />
              </svg>
            </div>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', fontWeight: 700, letterSpacing: '2px', background: 'linear-gradient(135deg, #D4AF37, #F6E27A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EMPEROR FX
            </span>
          </Link>

          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '36px', fontWeight: 900, color: '#F5F5F5', lineHeight: 1.2, marginBottom: '16px' }}>
            Begin Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #D4AF37, #F6E27A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reign</span>
          </h2>
          <p style={{ color: '#A0A0A8', fontSize: '15px', lineHeight: 1.8, marginBottom: '36px' }}>
            Join 2.4 million traders worldwide on the platform built for digital asset dominance.
          </p>

          <ul style={{ listStyle: 'none' }}>
            {features.map((f, i) => (
              <motion.li key={f} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={14} color="#00C896" />
                </div>
                <span style={{ color: '#A0A0A8', fontSize: '15px' }}>{f}</span>
              </motion.li>
            ))}
          </ul>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
            {['256-bit SSL', 'Bank-grade Security', 'Regulated'].map(b => (
              <div key={b} style={{ fontSize: '11px', color: '#6B6B78', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '4px 12px' }}>
                🔒 {b}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="glass-card-strong" style={{ padding: '36px' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 700, color: '#F5F5F5', marginBottom: '24px', textAlign: 'center' }}>
              Create Free Account
            </h1>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.35)', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: '#FF6B6B', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.6px' }}>FULL NAME</label>
                <input type="text" id="reg-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Emperor" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'} onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'} />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.6px' }}>EMAIL ADDRESS</label>
                <input type="email" id="reg-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'} onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'} />
              </div>

              {/* Country */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.6px' }}>COUNTRY</label>
                <input type="text" id="reg-country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Nigeria, USA, UK..." style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'} onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'} />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.6px' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} id="reg-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'} onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B78' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.6px' }}>CONFIRM PASSWORD</label>
                <input type="password" id="reg-confirm" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat password"
                  style={{ ...inputStyle, borderColor: form.confirm && form.confirm !== form.password ? 'rgba(255,77,79,0.5)' : 'rgba(212,175,55,0.2)' }}
                  onFocus={(e) => e.target.style.borderColor = form.confirm !== form.password ? 'rgba(255,77,79,0.6)' : 'rgba(212,175,55,0.6)'}
                  onBlur={(e) => e.target.style.borderColor = form.confirm && form.confirm !== form.password ? 'rgba(255,77,79,0.5)' : 'rgba(212,175,55,0.2)'} />
                {form.confirm && form.confirm !== form.password && (
                  <p style={{ fontSize: '11px', color: '#FF6B6B', marginTop: '4px' }}>Passwords don't match</p>
                )}
              </div>

              {/* Terms */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '22px' }}>
                <div onClick={() => setAgreed(!agreed)} style={{
                  width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, marginTop: '2px', cursor: 'pointer',
                  border: `1px solid ${agreed ? '#D4AF37' : 'rgba(212,175,55,0.3)'}`,
                  background: agreed ? 'rgba(212,175,55,0.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  {agreed && <Check size={11} color="#D4AF37" />}
                </div>
                <label style={{ fontSize: '12px', color: '#A0A0A8', lineHeight: 1.6, cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
                  I agree to the{' '}<a href="#" style={{ color: '#D4AF37', textDecoration: 'none' }}>Terms of Service</a>{' '}and{' '}
                  <a href="#" style={{ color: '#D4AF37', textDecoration: 'none' }}>Privacy Policy</a>.
                  <span style={{ color: '#6B6B78' }}> Emperor FX. No real funds are committed.</span>
                </label>
              </div>

              <button type="submit" className="btn-gold" disabled={loading} id="reg-submit"
                style={{ width: '100%', padding: '14px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading
                  ? <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #0B0B0F', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Creating account...</>
                  : <><ChevronRight size={16} /> Create Free Account</>
                }
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', color: '#6B6B78', fontSize: '13px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
