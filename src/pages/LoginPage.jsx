import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    
    try {
      if (supabase) {
        // Find user by email in the database
        const { data, error } = await supabase.from('profiles').select('name').eq('email', form.email)
        if (error || !data || data.length === 0) {
          setError('Invalid email or password')
          setLoading(false)
          return
        }
        login({ email: form.email, name: data[0].name, joined: new Date().toISOString() })
      } else {
        await new Promise(r => setTimeout(r, 1200))
        login({ email: form.email, name: form.email.split('@')[0], joined: new Date().toISOString() })
      }
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
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
      <div className="radial-glow" style={{ top: '30%', left: '50%', transform: 'translateX(-50%)' }} />

      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px', opacity: 0.02, pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative', zIndex: 1 }}
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
          <p style={{ color: '#6B6B78', fontSize: '14px', marginTop: '12px' }}>Welcome back to the throne</p>
        </div>

        {/* Card */}
        <div className="glass-card-strong" style={{ padding: '40px' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 700, color: '#F5F5F5', marginBottom: '28px', textAlign: 'center' }}>
            Sign In
          </h1>

          {error && (
            <div style={{
              background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)',
              borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#FF4D4F',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', color: '#A0A0A8', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                id="login-email"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                  padding: '12px 16px', fontSize: '14px', color: '#F5F5F5',
                  outline: 'none', fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: '#A0A0A8', display: 'block', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  id="login-password"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
                    padding: '12px 44px 12px 16px', fontSize: '14px', color: '#F5F5F5',
                    outline: 'none', fontFamily: 'Inter, sans-serif',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.2)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B78', padding: '4px',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-gold"
              disabled={loading}
              id="login-submit"
              style={{
                width: '100%', padding: '14px', fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : <><ChevronRight size={16} /> Sign In to Emperor FX</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a href="#" style={{ color: '#D4AF37', fontSize: '13px', textDecoration: 'none' }}>Forgot your password?</a>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6B6B78', fontSize: '14px' }}>
          New to Emperor FX?{' '}
          <Link to="/register" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Create Account</Link>
        </p>
      </motion.div>
    </div>
  )
}
