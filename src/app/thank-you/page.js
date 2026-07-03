'use client';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div style={styles.wrapper}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div className="animate-fade-in-up" style={styles.card}>
        {/* Animated Check */}
        <div style={styles.checkCircle}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="url(#grad)" strokeWidth="3" opacity="0.3" />
            <circle cx="32" cy="32" r="30" stroke="url(#grad)" strokeWidth="3"
              strokeDasharray="188.5" strokeDashoffset="188.5"
              style={{ animation: 'checkmark-draw 0.8s ease-out 0.3s forwards' }} />
            <path d="M20 32 L28 40 L44 24" stroke="#22c55e" strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="40" strokeDashoffset="40"
              style={{ animation: 'checkmark-draw 0.5s ease-out 0.9s forwards' }} />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 style={styles.title}>Submission Received!</h1>
        <p style={styles.desc}>
          Thank you for submitting your product information to the
          <strong> CERT-In & ICAN Indigenous Cybersecurity </strong>
          initiative.
        </p>

        <div style={styles.infoBox}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <div>
            <p style={styles.infoTitle}>Submission Completed</p>
            <p style={styles.infoDesc}>
              Your product registration data has been compiled into a secure PDF report and emailed to the initiative coordinators.
            </p>
          </div>
        </div>

        <div style={styles.steps}>
          <div style={styles.step}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style={styles.stepText}>Form submitted successfully</span>
          </div>
          <div style={styles.step}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.26.6.87 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span style={styles.stepText}>Report is being generated</span>
          </div>
          <div style={styles.step}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span style={styles.stepText}>PDF emailed to coordinators</span>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={() => router.push('/')}
          style={{ width: '100%' }} id="back-home-btn">
          ← Back to Home
        </button>
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
    position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '-10%', right: '-15%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
    animation: 'float 8s ease-in-out infinite',
  },
  bgOrb2: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%', bottom: '-10%', left: '-10%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
    animation: 'float 10s ease-in-out infinite reverse',
  },
  card: {
    width: '100%', maxWidth: 500, padding: 'var(--space-2xl)',
    background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)',
    textAlign: 'center', position: 'relative', zIndex: 2,
  },
  checkCircle: { marginBottom: 'var(--space-xl)' },
  title: {
    fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700,
    marginBottom: 'var(--space-md)', color: '#22c55e',
  },
  desc: {
    color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7,
    marginBottom: 'var(--space-xl)',
  },
  infoBox: {
    display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)',
    padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)',
    background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)',
    textAlign: 'left', marginBottom: 'var(--space-xl)',
  },
  infoTitle: { fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' },
  infoDesc: { color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 },
  steps: {
    display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
    marginBottom: 'var(--space-xl)',
  },
  step: {
    display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
    padding: 'var(--space-sm) var(--space-md)',
    borderRadius: 'var(--radius-sm)', background: 'var(--bg-glass)',
  },
  stepText: { color: 'var(--text-secondary)', fontSize: '0.9rem' },
};
