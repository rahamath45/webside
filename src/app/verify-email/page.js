'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const status = searchParams.get('status');

  const [message, setMessage] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (status === 'success' || status === 'already_verified') {
      setMessage('Your email has been successfully verified! You can now log in.');
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else if (error === 'invalid_token') {
      setMessage('The verification link is invalid. Please sign up again.');
    } else if (error === 'expired_token') {
      setMessage('The verification link has expired. Please sign up again.');
    } else if (error) {
      setMessage('An error occurred during verification. Please try again.');
    }
  }, [error, status, router]);

  return (
    <div style={styles.wrapper}>
      <div className="animate-fade-in-up" style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBox}>IT</div>
        </div>
        
        <h1 style={styles.title}>Email Verification</h1>
        <p style={styles.subtitle}>CERT-In & ICAN Joint Initiative</p>

        <div style={isSuccess ? styles.successBox : (error ? styles.errorBox : styles.infoBox)}>
          {message}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/login" style={styles.link}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '1rem',
    background: 'var(--bg-primary)',
    fontFamily: 'var(--font-primary), sans-serif',
  },
  card: {
    width: '100%', 
    maxWidth: '420px', 
    background: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)',
    padding: '2.5rem',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    flexDirection: 'column',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.25rem',
  },
  logoBox: {
    width: '48px',
    height: '48px',
    background: 'var(--accent-indigo)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textAlign: 'center',
    margin: '0 0 0.25rem 0',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    margin: '0 0 1.5rem 0',
  },
  successBox: {
    padding: '1rem',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    color: '#166534',
    textAlign: 'center',
  },
  errorBox: {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    color: '#ef4444',
    textAlign: 'center',
  },
  infoBox: {
    padding: '1rem',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    borderRadius: '8px',
    color: '#60a5fa',
    textAlign: 'center',
  },
  link: {
    color: 'var(--accent-indigo)',
    fontWeight: '600',
    textDecoration: 'none',
  }
};
