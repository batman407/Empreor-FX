import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Check, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'

const features = ['$10,000 demo balance', 'Real-time market data', 'Copy trading access', 'Zero fees on demo']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (!agreed) { setError('Please accept the terms of service'); return }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 1500))
    login({ email: form.email, name: form.name, joined: new Date().toISOString() })
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="radial-glow" style={{ top: '20%', left: '60%' }} />
      <div className="radial-glow" style={{ bottom: '10%', left: '20%', background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', maxWidth: '960px', width: '100%', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Left: Features */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden-mobile"
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{
              width: '44px', height: '44px',
              background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="20" viewBox="0 0 100 80" fill="none">
                <polygon points="50,5 18,55 50,40 82,55" fill="#0B0B0F" />
                <rect x="10" y="58" width="80" height="16" rx="3" fill="#0B0B0F" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'Cinzel, serif', fontSize: '20px', fontWeight: 700, letterSpacing: '2px',
              background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              EMPEROR FX
            </span>
          </Link>

          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '36px', fontWeight: 900, color: '#F5F5F5', lineHeight: 1.2, marginBottom: '20px' }}>
            Begin Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #D4AF37, #F6E27A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Reign
            </span>
          </h2>
          <p style={{ color: '#A0A0A8', fontSize: '16px', lineHeight: 1.8, marginBottom: '36px' }}>
            Join 2.4 million traders worldwide on the platform built for digital asset dominance.
          </p>

          <ul style={{ listStyle: 'none' }}>
            {features.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Check size={14} color="#00C896" />
                </div>
                <span style={{ color: '#A0A0A8', fontSize: '15px' }}>{f}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-card-strong" style={{ padding: '40px' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 700, color: '#F5F5F5', marginBottom: '28px', textAlign: 'center' }}>
              Create Free Account
            </h1>

            {error && (
              <div style={{
                background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)',
                borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#FF4D4F', marginBottom: '20px',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {[
                { key: 'name', label: 'FULL NAME', type: 'text', placeholder: 'John Emperor', id: 'reg-name' },
                { key: 'email', label: 'EMAIL ADDRESS', type: 'email', placeholder: 'you@example.com', id: 'reg-email' },
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.5px' }}>{field.label}</label>
                  <input
                    type={field.type}
                    id={field.id}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                      padding: '11px 14px', fontSize: '13px', color: '#F5F5F5',
                      outline: 'none', fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
                  />
                </div>
              ))}

              {/* Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.5px' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="reg-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 characters"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                      padding: '11px 40px 11px 14px', fontSize: '13px', color: '#F5F5F5',
                      outline: 'none', fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B78' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.5px' }}>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  id="reg-confirm"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat password"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                    padding: '11px 14px', fontSize: '13px', color: '#F5F5F5',
                    outline: 'none', fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
                />
              </div>

              {/* Terms */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px' }}>
                <div
                  onClick={() => setAgreed(!agreed)}
                  style={{
                    width: '18px', height: '18px', borderRadius: '4px',
                    border: `1px solid ${agreed ? '#D4AF37' : 'rgba(212,175,55,0.3)'}`,
                    background: agreed ? 'rgba(212,175,55,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, marginTop: '2px',
                  }}
                >
                  {agreed && <Check size={11} color="#D4AF37" />}
                </div>
                <label style={{ fontSize: '12px', color: '#A0A0A8', lineHeight: 1.6, cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
                  I agree to the{' '}
                  <a href="#" style={{ color: '#D4AF37', textDecoration: 'none' }}>Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" style={{ color: '#D4AF37', textDecoration: 'none' }}>Privacy Policy</a>.
                  Emperor FX is a demo platform. No real funds are traded.
                </label>
              </div>

              <button
                type="submit"
                className="btn-gold"
                disabled={loading}
                id="reg-submit"
                style={{
                  width: '100%', padding: '14px', fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Creating account...' : <><ChevronRight size={16} /> Create Free Account</>}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', color: '#6B6B78', fontSize: '13px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`@media (max-width: 768px) { .hidden-mobile { display: none !important; } }`}</style>
    </div>
  )
}
