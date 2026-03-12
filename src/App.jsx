import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useStore from './store/useStore'

import IntroAnimation from './components/IntroAnimation'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import LandingPage from './pages/LandingPage'
import TradePage from './pages/TradePage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Pages that hide footer
const NO_FOOTER = ['/trade', '/dashboard', '/admin', '/admin-login']

export default function App() {
  const { showIntro } = useStore()
  const location = useLocation()

  const hideFooter = NO_FOOTER.some(p => location.pathname.startsWith(p))

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      {/* Cinematic intro */}
      <AnimatePresence>
        {showIntro && <IntroAnimation key="intro" />}
      </AnimatePresence>

      {/* Main app */}
      {!showIntro && (
        <>
          {/* Background particles canvas  */}
          <div style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,0.04) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 100% 100%, rgba(212,175,55,0.03) 0%, transparent 60%)
            `,
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/trade" element={<TradePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
              </Routes>
            </AnimatePresence>
            {!hideFooter && <Footer />}
          </div>
        </>
      )}
    </>
  )
}
