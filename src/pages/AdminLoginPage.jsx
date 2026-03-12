import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert, Eye, EyeOff, ChevronRight } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Hardcoded secure admin password for demo purposes
    await new Promise(r => setTimeout(r, 800))
    
    if (password === 'emperor2026') {
      // Set simple flag in sessionStorage (in a real app, use JWT/Supabase Auth)
      sessionStorage.setItem('adminAuth', 'true')
      navigate('/admin')
    } else {
      setError('Invalid admin credentials. Access Denied.')
    }
    setLoading(false)
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
      {/* Background threat-red glow for admin area */}
      <div className="radial-glow" style={{ top: '30%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(255,77,79,0.05) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '420px', padding: '24px', position: 'relative', zIndex: 1 }}
      >
        <div className="glass-card-strong" style={{ padding: '40px', border: '1px solid rgba(255,77,79,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <ShieldAlert size={28} color="#FF4D4F" />
            </div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', fontWeight: 700, color: '#F5F5F5', margin: 0, letterSpacing: '1px' }}>
              RESTRICTED AREA
            </h1>
            <p style={{ color: '#A0A0A8', fontSize: '13px', marginTop: '8px' }}>
              System Administrator Access Only
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)',
              borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#FF4D4F',
              marginBottom: '20px', textAlign: 'center', fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: '#6B6B78', display: 'block', marginBottom: '8px', fontWeight: 700, letterSpacing: '1px' }}>
                MASTER PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access code"
                  style={{
                    width: '100%', background: 'rgba(11,11,15,0.5)',
                    border: '1px solid rgba(255,77,79,0.3)', borderRadius: '8px',
                    padding: '14px 44px 14px 16px', fontSize: '15px', color: '#F5F5F5',
                    outline: 'none', fontFamily: 'Inter, sans-serif',
                    transition: 'border-color 0.2s',
                    letterSpacing: showPass ? 'normal' : '3px',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255,77,79,0.8)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,77,79,0.3)'}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B78',
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                background: loading || !password ? 'rgba(255,77,79,0.2)' : 'linear-gradient(135deg, #FF4D4F, #CC3D3F)',
                color: loading || !password ? '#6B6B78' : '#fff',
                fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                cursor: loading || !password ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Authenticating...' : <><ChevronRight size={16} /> INITIALIZE OVERRIDE</>}
            </button>
          </form>

          <button 
            onClick={() => navigate('/')}
            style={{ 
              background: 'none', border: 'none', color: '#6B6B78', fontSize: '13px', 
              width: '100%', marginTop: '20px', cursor: 'pointer',
              textDecoration: 'underline', textDecorationColor: 'rgba(107,107,120,0.5)'
            }}
          >
            Abort and return to public platform
          </button>
        </div>
      </motion.div>
    </div>
  )
}
