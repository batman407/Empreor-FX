import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, DollarSign, Activity, AlertTriangle, ShieldCheck, Database, RefreshCw, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [error, setError] = useState(null)

  // Demo fallback data when supabase is active but empty
  const [mockMode, setMockMode] = useState(false)

  useEffect(() => {
    // Basic route protection
    if (sessionStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin-login')
      return
    }

    if (!supabase) {
      setLoading(false)
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error
      
      if (data && data.length > 0) {
        setUsers(data)
        setMockMode(false)
      } else {
        // Mock data for preview
        setMockMode(true)
        setUsers([
          { id: '1', name: 'John Emperor', email: 'john@example.com', balance: 10450.00, role: 'user', created_at: new Date().toISOString() },
          { id: '2', name: 'Sarah Tech', email: 'sarah@example.com', balance: 5200.50, role: 'vip', created_at: new Date(Date.now() - 86400000).toISOString() },
        ])
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Make sure you have created the profiles table in Supabase.')
      setMockMode(true)
      setUsers([
        { id: '1', name: 'Demo User 1', email: 'demo1@example.com', balance: 10000.00, role: 'user', created_at: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }

  // UI when Supabase is not connected
  if (!supabase) {
    return (
      <div style={{ padding: '100px 24px', minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card-strong" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Database size={28} color="#D4AF37" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 700, color: '#F5F5F5', margin: 0 }}>
                Connect to Supabase
              </h1>
              <div style={{ fontSize: '14px', color: '#A0A0A8', marginTop: '4px' }}>
                Admin dashboard requires database configuration
              </div>
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
            <AlertTriangle size={20} color="#FFA500" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '14px', color: '#F5F5F5', lineHeight: 1.6 }}>
              You haven't added your Supabase credentials yet. The admin panel needs a database to read/write real users and transactions.
            </div>
          </div>

          <h3 style={{ color: '#F5F5F5', fontSize: '15px', marginBottom: '16px' }}>How to set up:</h3>
          <ol style={{ color: '#A0A0A8', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
            <li>Go to <a href="https://supabase.com/" target="_blank" rel="noreferrer" style={{ color: '#D4AF37' }}>Supabase</a> and create a free project.</li>
            <li>In your project, go to <strong>Project Settings</strong> → <strong>API</strong>.</li>
            <li>Copy the <strong>Project URL</strong> and <strong>anon public key</strong>.</li>
            <li>Create a file named <code>.env.local</code> in the root of your code folder.</li>
            <li>Add these two lines, replacing the values:</li>
          </ol>
          
          <pre style={{ background: '#0B0B0F', border: '1px solid rgba(212,175,55,0.2)', padding: '16px', borderRadius: '8px', marginTop: '16px', fontSize: '13px', color: '#A8D8EA', overflowX: 'auto' }}>
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-long-anon-key-here
          </pre>

          <p style={{ color: '#A0A0A8', fontSize: '14px', marginTop: '16px', marginBottom: '24px' }}>
            Then, restart your development server (<code>npm run dev</code>) and reload this page.
          </p>

          <button className="btn-outline" onClick={() => navigate('/')} style={{ width: '100%', padding: '12px' }}>
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '70px 0 0 0', display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Admin Sidebar */}
      <div style={{ width: '240px', background: 'var(--bg-secondary)', borderRight: '1px solid rgba(212,175,55,0.1)', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
          <ShieldCheck size={28} color="#D4AF37" />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', fontWeight: 700, color: '#F5F5F5' }}>EMPEROR ADMIN</span>
        </div>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
            background: activeTab === 'users' ? 'rgba(212,175,55,0.1)' : 'transparent',
            color: activeTab === 'users' ? '#D4AF37' : '#A0A0A8',
            border: activeTab === 'users' ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
            fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginBottom: '8px', width: '100%', textAlign: 'left',
          }}
        >
          <Users size={18} /> User Management
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
            background: activeTab === 'financials' ? 'rgba(212,175,55,0.1)' : 'transparent',
            color: activeTab === 'financials' ? '#D4AF37' : '#A0A0A8',
            border: activeTab === 'financials' ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
            fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginBottom: '8px', width: '100%', textAlign: 'left',
          }}
        >
          <DollarSign size={18} /> Financials
        </button>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={() => {
              sessionStorage.removeItem('adminAuth')
              navigate('/')
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
              background: 'transparent', color: '#6B6B78', border: 'none', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer', width: '100%', textAlign: 'left',
            }}
          >
            <LogOut size={18} /> Exit Admin Node
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 700, margin: 0, color: '#F5F5F5' }}>
            System Dashboard
          </h1>
          <button 
            onClick={fetchData} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Sync Data
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '24px', color: '#FF4D4F', fontSize: '13px' }}>
            <strong>Database Error:</strong> {error}
          </div>
        )}

        {mockMode && !error && (
          <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '24px', color: '#D4AF37', fontSize: '13px' }}>
            Connected to Supabase successfully, but the 'profiles' table is empty. Showing sample data.
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="#00C896" /></div>
              <div style={{ color: '#6B6B78', fontSize: '13px', fontWeight: 600 }}>Total Registered Users</div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#F5F5F5', fontFamily: 'Outfit, sans-serif' }}>{loading ? '...' : users.length}</div>
          </div>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={20} color="#D4AF37" /></div>
              <div style={{ color: '#6B6B78', fontSize: '13px', fontWeight: 600 }}>Total Platform Balance</div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#F5F5F5', fontFamily: 'Outfit, sans-serif' }}>
              ${loading ? '...' : users.reduce((acc, u) => acc + (u.balance || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(123,123,255,0.1)', border: '1px solid rgba(123,123,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={20} color="#7B7BFF" /></div>
              <div style={{ color: '#6B6B78', fontSize: '13px', fontWeight: 600 }}>Trade Volume (24h)</div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#F5F5F5', fontFamily: 'Outfit, sans-serif' }}>$142,500</div>
          </div>
        </div>

        {/* User Table */}
        {activeTab === 'users' && (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(212,175,55,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#F5F5F5', fontWeight: 700 }}>Registered Profiles</h3>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#6B6B78', fontWeight: 600, letterSpacing: '0.5px' }}>USER</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#6B6B78', fontWeight: 600, letterSpacing: '0.5px' }}>EMAIL</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#6B6B78', fontWeight: 600, letterSpacing: '0.5px' }}>ROLE</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#6B6B78', fontWeight: 600, letterSpacing: '0.5px', textAlign: 'right' }}>BALANCE (USD)</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', color: '#6B6B78', fontWeight: 600, letterSpacing: '0.5px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6B6B78' }}>Loading database records...</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '16px 24px', color: '#F5F5F5', fontSize: '14px', fontWeight: 600 }}>{u.name || 'Unnamed'}</td>
                      <td style={{ padding: '16px 24px', color: '#A0A0A8', fontSize: '14px' }}>{u.email}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ background: u.role === 'vip' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)', color: u.role === 'vip' ? '#D4AF37' : '#A0A0A8', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                          {u.role || 'User'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#00C896', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>
                        ${(u.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button style={{ background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
