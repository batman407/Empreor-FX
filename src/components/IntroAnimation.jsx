import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'

const ParticleField = ({ canvasRef }) => {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.7 + 0.1,
      color: Math.random() > 0.5 ? '#D4AF37' : '#F6E27A',
    }))

    let animId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1
      })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [canvasRef])
  return null
}

export default function IntroAnimation() {
  const setShowIntro = useStore((s) => s.setShowIntro)
  const [phase, setPhase] = useState(0) // 0=logo spin, 1=impact, 2=badge, 3=tagline, 4=fade
  const canvasRef = useRef(null)

  useEffect(() => {
    // Phase timeline
    const timers = [
      setTimeout(() => setPhase(1), 2000),  // impact after 2s
      setTimeout(() => setPhase(2), 2600),  // badge
      setTimeout(() => setPhase(3), 3400),  // tagline
      setTimeout(() => setPhase(4), 4800),  // fade out
      setTimeout(() => setShowIntro(false), 5600), // done
    ]
    return () => timers.forEach(clearTimeout)
  }, [setShowIntro])

  const handleSkip = () => {
    setPhase(4)
    setTimeout(() => setShowIntro(false), 600)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        className="intro-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 4 ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Particle canvas */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
        <ParticleField canvasRef={canvasRef} />

        {/* Ambient radial glow */}
        <div style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 65%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          {/* Logo - rotating 3D effect via CSS */}
          <motion.div
            initial={{ rotateY: 0, opacity: 0, scale: 0.5 }}
            animate={
              phase === 0
                ? { rotateY: [0, 360, 720, 1080], opacity: 1, scale: 1 }
                : phase === 1
                ? { rotateY: 1080, scale: [1, 1.05, 0.97, 1], opacity: 1 }
                : { rotateY: 1080, scale: 1, opacity: 1 }
            }
            transition={
              phase === 0
                ? { duration: 2, ease: 'easeInOut' }
                : { duration: 0.4, ease: 'easeOut' }
            }
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          >
            {/* EMPEROR FX Text */}
            <h1
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(42px, 8vw, 80px)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #A8860A 0%, #D4AF37 30%, #F6E27A 50%, #D4AF37 70%, #A8860A 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '8px',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.5))',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              EMPEROR FX
            </h1>
          </motion.div>

          {/* Impact shockwave */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{}}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  border: '2px solid rgba(212,175,55,0.6)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>

          {/* Gold sparks on impact */}
          <AnimatePresence>
            {phase === 1 && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{
                      scale: 1,
                      x: Math.cos((i / 8) * Math.PI * 2) * (80 + Math.random() * 60),
                      y: Math.sin((i / 8) * Math.PI * 2) * (80 + Math.random() * 60),
                      opacity: 0,
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: '#F6E27A',
                      boxShadow: '0 0 6px #D4AF37',
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Badge - circular outline + crown */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '-70px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Crown SVG */}
                <motion.div
                  animate={{ boxShadow: ['0 0 0 0 rgba(212,175,55,0.4)', '0 0 20px 8px rgba(212,175,55,0)', '0 0 0 0 rgba(212,175,55,0.4)'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <svg width="48" height="40" viewBox="0 0 100 80" fill="none">
                    <polygon points="50,8 20,55 50,42 80,55" fill="#D4AF37" />
                    <rect x="12" y="58" width="76" height="14" rx="3" fill="#D4AF37" />
                  </svg>
                </motion.div>
                {/* Crown glow pulse */}
                <motion.div
                  initial={{ width: '60px', opacity: 0 }}
                  animate={{ width: '160px', opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', marginTop: '8px' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Circular border ring */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '340px',
                  height: '340px',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              >
                <svg width="340" height="340" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <motion.circle
                    cx="170" cy="170" r="165"
                    stroke="url(#goldGrad)" strokeWidth="1"
                    fill="none" strokeDasharray="4 8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6, rotate: [0, 360] }}
                    transition={{ opacity: { duration: 0.5 }, rotate: { repeat: Infinity, duration: 20, linear: true } }}
                  />
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#F6E27A" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tagline */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: 'clamp(13px, 2vw, 18px)',
                  letterSpacing: '5px',
                  color: '#A0A0A8',
                  marginTop: '28px',
                }}
              >
                TRADE.{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #D4AF37, #F6E27A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 700,
                }}>
                  CONQUER.
                </span>
                {' '}ACCUMULATE.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          whileHover={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          onClick={handleSkip}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            background: 'transparent',
            border: '1px solid rgba(212,175,55,0.3)',
            color: '#A0A0A8',
            padding: '8px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            letterSpacing: '1px',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s ease',
          }}
        >
          SKIP INTRO
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}
