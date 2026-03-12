import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Clock, BarChart2, Settings, LogOut, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'
import { fetchMarketData } from '../services/api'

const COLORS = ['#D4AF37', '#7B7BFF', '#00C896', '#F7931A', '#9945FF', '#FF4D4F']

const sideItems = [
  { icon: BarChart2, label: 'Overview', page: 'overview' },
  { icon: TrendingUp, label: 'Trade', page: 'trade' },
  { icon: Wallet, label: 'Portfolio', page: 'portfolio' },
  { icon: Clock, label: 'History', page: 'history' },
  { icon: Settings, label: 'Settings', page: 'settings' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout, demoBalance, portfolio, demoTransactions, marketData, setMarketData } = useStore()

  useEffect(() => {
    if (!isLoggedIn) navigate('/login')
  }, [isLoggedIn, navigate])

  useEffect(() => {
    const load = async () => {
      if (marketData.length === 0) {
        const data = await fetchMarketData()
        setMarketData(data)
      }
    }
    load()
  }, [marketData.length, setMarketData])

  // Build portfolio pie data
  const portfolioItems = [
    { name: 'USDT', value: demoBalance },
    ...Object.entries(portfolio)
      .filter(([k]) => k !== 'USDT')
      .map(([symbol, amount]) => {
        const coin = marketData.find(c => c.symbol.toUpperCase() === symbol)
        return { name: symbol, value: coin ? amount * coin.current_price : 0 }
      })
      .filter(i => i.value > 0),
  ]

  const totalPortfolio = portfolioItems.reduce((s, i) => s + i.value, 0)

  const statCards = [
    {
      label: 'Total Portfolio',
      value: `$${totalPortfolio.toFixed(2)}`,
      change: '+2.34%',
      isUp: true,
      icon: Wallet,
      color: '#D4AF37',
    },
    {
      label: 'Available USDT',
      value: `$${demoBalance.toFixed(2)}`,
      change: 'Demo Balance',
      isUp: true,
      icon: TrendingUp,
      color: '#00C896',
    },
    {
      label: 'Open Positions',
      value: Object.values(portfolio).filter((v, i) => i > 0 && v > 0).length,
      change: 'Active trades',
      isUp: true,
      icon: BarChart2,
      color: '#7B7BFF',
    },
    {
      label: 'Total Trades',
      value: demoTransactions.length,
      change: 'All time',
      isUp: true,
      icon: Clock,
      color: '#F7931A',
    },
  ]

  if (!isLoggedIn) return null

  return (
    <div style={{ paddingTop: '70px', display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid rgba(212,175,55,0.1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: '70px', bottom: 0, left: 0,
        overflowY: 'auto',
      }}>
        {/* User */}
        <div style={{
          background: 'rgba(212,175,55,0.05)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '14px', color: '#0B0B0F',
            marginBottom: '8px',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#F5F5F5', marginBottom: '2px' }}>
            {user?.name || 'Emperor Trader'}
          </div>
          <div style={{ fontSize: '11px', color: '#6B6B78' }}>Silver Member</div>
        </div>

        {/* Nav items */}
        {sideItems.map((item) => {
          const Icon = item.icon
          const isActive = item.page === 'overview'
          return (
            <button
              key={item.label}
              onClick={() => item.page === 'trade' ? navigate('/trade?demo=true') : null}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', borderRadius: '8px', marginBottom: '4px',
                background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
                color: isActive ? '#D4AF37' : '#A0A0A8',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                width: '100%', textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F5F5F5' } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A0A0A8' } }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          )
        })}

        {/* Logout */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={() => { logout(); navigate('/') }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 14px', borderRadius: '8px',
              background: 'transparent', border: '1px solid transparent',
              color: '#6B6B78', fontSize: '14px', cursor: 'pointer', width: '100%', textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4D4F'; e.currentTarget.style.background = 'rgba(255,77,79,0.05)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B78'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '220px', flex: 1, padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', fontWeight: 700, color: '#F5F5F5' }}>
            Welcome back, <span className="text-gold-gradient">{user?.name || 'Emperor'}</span>
          </h1>
          <p style={{ color: '#6B6B78', marginTop: '6px', fontSize: '14px' }}>
            Here's your portfolio overview for today
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${stat.color}15`,
                    border: `1px solid ${stat.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={stat.color} />
                  </div>
                  <span style={{ fontSize: '12px', color: stat.isUp ? '#00C896' : '#FF4D4F', fontWeight: 600 }}>
                    {stat.change}
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#F5F5F5', marginBottom: '4px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: '#6B6B78' }}>{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Portfolio chart + Recent transactions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Portfolio chart */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ padding: '28px' }}
          >
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 700, color: '#F5F5F5', marginBottom: '24px' }}>
              Asset Allocation
            </h2>
            {portfolioItems.length > 0 && totalPortfolio > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={portfolioItems}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {portfolioItems.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`$${v.toFixed(2)}`, '']}
                      contentStyle={{
                        background: '#1C1C24', border: '1px solid rgba(212,175,55,0.2)',
                        borderRadius: '8px', fontSize: '13px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px', justifyContent: 'center' }}>
                  {portfolioItems.map((item, i) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: '12px', color: '#A0A0A8' }}>
                        {item.name} ({((item.value / totalPortfolio) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B6B78', fontSize: '14px' }}>
                <p>Start trading to see your asset allocation</p>
                <button className="btn-gold" style={{ marginTop: '16px', padding: '10px 24px', fontSize: '13px' }} onClick={() => navigate('/trade?demo=true')}>
                  Start Trading
                </button>
              </div>
            )}
          </motion.div>

          {/* Recent transactions */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            style={{ padding: '28px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 700, color: '#F5F5F5' }}>
                Recent Transactions
              </h2>
              <button onClick={() => navigate('/trade?demo=true')} style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Trade <ChevronRight size={14} />
              </button>
            </div>
            {demoTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B6B78', fontSize: '14px' }}>
                No transactions yet
              </div>
            ) : (
              demoTransactions.slice(0, 8).map((tx) => (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: tx.type === 'BUY' ? 'rgba(0,200,150,0.1)' : 'rgba(255,77,79,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {tx.type === 'BUY' ? <ArrowUpRight size={16} color="#00C896" /> : <ArrowDownRight size={16} color="#FF4D4F" />}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F5' }}>
                        {tx.type} {tx.symbol}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B6B78' }}>
                        {new Date(tx.time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: tx.type === 'BUY' ? '#FF4D4F' : '#00C896' }}>
                      {tx.type === 'BUY' ? '-' : '+'}${tx.value.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B6B78' }}>
                      {tx.amount.toFixed(6)} {tx.symbol}
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>

        {/* CTA section */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(20,20,25,0.8))',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 700, color: '#F5F5F5', marginBottom: '8px' }}>
              Ready to level up? Upgrade to VIP
            </h3>
            <p style={{ color: '#A0A0A8', fontSize: '14px' }}>Unlock lower fees, AI signals, and dedicated support</p>
          </div>
          <button className="btn-gold" onClick={() => navigate('/#vip')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            View VIP Plans
          </button>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          #dashboard-main { margin-left: 0 !important; }
          #dashboard-sidebar { display: none !important; }
        }
        @media (max-width: 900px) {
          #dashboard-stats { grid-template-columns: repeat(2, 1fr) !important; }
          #dashboard-charts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
