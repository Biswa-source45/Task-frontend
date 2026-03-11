import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Particle canvas background
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const NUM = 90;
    const particles = Array.from({ length: NUM }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.6 + Math.random() * 1.6,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      o: 0.15 + Math.random() * 0.55,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // connections
      for (let i = 0; i < NUM; i++) {
        for (let j = i + 1; j < NUM; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      // dots
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Particle background */}
      <ParticleCanvas />

      {/* Gradient blobs */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-15%', left: '-10%',
            width: '65vw', height: '65vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(120,80,255,0.18), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', bottom: '-15%', right: '-10%',
            width: '55vw', height: '55vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(80,180,255,0.14), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 860, margin: '0 auto' }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 16px', borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)',
            fontSize: 13, color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.04em', backdropFilter: 'blur(8px)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            Leave Management System
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.15 }}
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: 24,
          }}
        >
          Manage Your Team
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Effortlessly
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 560,
            margin: '0 auto 44px',
            lineHeight: 1.75,
            fontWeight: 400,
          }}
        >
          A seamless platform for leave applications, team management, and balance tracking—built for modern workplaces.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(255,255,255,0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 36px',
              borderRadius: 100,
              border: 'none',
              background: '#fff',
              color: '#000',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.01em',
              transition: 'box-shadow 0.3s',
              boxShadow: '0 0 30px rgba(255,255,255,0.15)',
            }}
          >
            Get Started →
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 36px',
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.01em',
              backdropFilter: 'blur(8px)',
              transition: 'background 0.3s',
            }}
          >
            Sign In
          </motion.button>
        </motion.div>

        
      </div>
    </div>
  );
};

export default Landing;
