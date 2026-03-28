import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ChevronRight, AlertCircle, Shield } from 'lucide-react'
import useStore from '../store/useStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginUser } = useStore()
  const [form, setForm] = useState({ email: '', password: '', totpCode: '' })
  const [showPass, setShowPass] = useState(false)
  const [needs2FA, setNeeds2FA] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')

    try {
      const result = await loginUser({
        email: form.email,
        password: form.password,
        totpCode: form.totpCode || undefined,
      })

      if (result?.requires2FA) {
        setNeeds2FA(true)
        setLoading(false)
        return
      }

      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Login failed'
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
    padding: '13px 16px',
    fontSize: '14px',
    color: '#F5F5F5',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div className="radial-glow" style={{ top: '30%', left: '50%', transform: 'translateX(-50%)' }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px', opacity: 0.02, pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '460px', padding: '24px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(212,175,55,0.3)',
            }}>
              <svg width="28" height="24" viewBox="0 0 100 80" fill="none">
                <polygon points="50,5 18,55 50,40 82,55" fill="#0B0B0F" />
                <rect x="10" y="58" width="80" height="16" rx="3" fill="#0B0B0F" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'Cinzel, serif', fontSize: '22px', fontWeight: 700, letterSpacing: '3px',
              background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              EMPEROR FX
            </span>
          </Link>
          <p style={{ color: '#6B6B78', fontSize: '14px', marginTop: '10px' }}>Welcome back to the throne</p>
        </div>

        {/* Card */}
        <div className="glass-card-strong" style={{ padding: '40px' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 700, color: '#F5F5F5', marginBottom: '28px', textAlign: 'center' }}>
            {needs2FA ? 'Two-Factor Auth' : 'Sign In'}
          </h1>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.35)',
                borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#FF6B6B',
                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <AlertCircle size={15} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {!needs2FA ? (
              <>
                {/* Email */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.8px' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.8px' }}>
                    PASSWORD
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      id="login-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: '44px' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B78', padding: '4px',
                    }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* 2FA Code Input */
              <div style={{ marginBottom: '28px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Shield size={40} color="#D4AF37" />
                  <p style={{ color: '#A0A0A8', fontSize: '14px', marginTop: '12px' }}>
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
                <label style={{ fontSize: '11px', color: '#A0A0A8', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.8px' }}>
                  AUTHENTICATOR CODE
                </label>
                <input
                  type="text"
                  id="login-totp"
                  value={form.totpCode}
                  onChange={(e) => setForm({ ...form, totpCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="000000"
                  maxLength={6}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 700 }}
                  autoFocus
                  onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-gold"
              disabled={loading || (needs2FA && form.totpCode.length < 6)}
              id="login-submit"
              style={{
                width: '100%', padding: '14px', fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #0B0B0F', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Signing in...
                  </span>
                : <><ChevronRight size={16} /> {needs2FA ? 'Verify Code' : 'Sign In to Emperor FX'}</>
              }
            </button>
          </form>

          {needs2FA && (
            <button onClick={() => { setNeeds2FA(false); setForm(f => ({ ...f, totpCode: '' })) }}
              style={{ width: '100%', background: 'none', border: 'none', color: '#6B6B78', fontSize: '13px', cursor: 'pointer', marginTop: '16px', textAlign: 'center' }}>
              ← Back to login
            </button>
          )}

          {!needs2FA && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <a href="#" style={{ color: '#D4AF37', fontSize: '13px', textDecoration: 'none' }}>Forgot your password?</a>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6B6B78', fontSize: '14px' }}>
          New to Emperor FX?{' '}
          <Link to="/register" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Create Account</Link>
        </p>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
