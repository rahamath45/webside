'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Redirect to internal application page
      router.push('/apply');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Back Button */}
      <button onClick={() => router.push('/')} style={styles.backBtn} id="back-home-btn">
        ← Back to Home
      </button>

      <div className="animate-fade-in-up" style={styles.card}>
        {/* Logos */}
        <div style={styles.logoGroup}>
          <div style={styles.logoWrapper}>
            <img src="/logos/certin-logo.png" alt="CERT-In" style={{ ...styles.logoImage, height: '20px' }} />
          </div>
          <div style={styles.logoDivider} />
          <div style={styles.logoWrapper}>
            <img src="/logos/ican-logo.png" alt="ICAN" style={{ ...styles.logoImage, height: '24px' }} />
          </div>
          <div style={styles.logoDivider} />
          <div style={styles.logoWrapper}>
            <img src="/logos/itel-logo.png" alt="ITEL" style={{ ...styles.logoImage, height: '26px' }} />
          </div>
        </div>

        <h1 style={styles.title}>Sign In</h1>
        <p style={styles.subtitle}>
          Authenticate to access the product submission form
        </p>

        {error && (
          <div style={styles.errorBox} className="animate-fade-in" id="login-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--space-sm)' }}
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <span style={styles.spinner} />
                Authenticating...
              </>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Sign In & Continue to Form</span>
            )}
          </button>
        </form>


      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 'var(--space-xl)', position: 'relative', overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
  bgOrb1: {
    position: 'absolute', width: 600, height: 600, borderRadius: '50%', top: '-15%', right: '-10%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
    animation: 'float 8s ease-in-out infinite',
  },
  bgOrb2: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%', bottom: '-10%', left: '-10%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
    animation: 'float 10s ease-in-out infinite reverse',
  },
  backBtn: {
    position: 'absolute', top: 24, left: 24, background: 'none', border: 'none',
    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem',
    fontFamily: 'var(--font-primary)', zIndex: 10,
    transition: 'color var(--transition-fast)',
  },
  card: {
    width: '100%', maxWidth: 440, padding: 'var(--space-2xl)',
    background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.09)', borderRadius: 'var(--radius-xl)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
    position: 'relative', zIndex: 2,
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '0.85rem 1.25rem',
    marginBottom: 'var(--space-xl)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
  },
  logoWrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 0.5rem',
  },
  logoDivider: {
    width: '1px',
    height: '24px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  logoImage: {
    objectFit: 'contain',
  },
  title: {
    fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800,
    textAlign: 'center', marginBottom: 'var(--space-xs)', color: '#ffffff',
  },
  subtitle: {
    color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.95rem',
    marginBottom: 'var(--space-xl)',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171', fontSize: '0.9rem', marginBottom: 'var(--space-lg)',
  },
  form: { marginBottom: 'var(--space-lg)' },
  spinner: {
    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin-slow 0.8s linear infinite', display: 'inline-block',
  },
  info: {
    padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
    background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)',
    textAlign: 'center',
  },
  infoText: { color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6 },
};
