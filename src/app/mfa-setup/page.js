'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MfaSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [setupData, setSetupData] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const initiateMfaSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/totp/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to setup MFA');
      
      setSetupData(data);
      // We use a public API to generate the QR code image for the otpauth uri
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.uri)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnableMfa = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: totpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');

      // MFA enabled successfully! Update session or just redirect
      alert('Multi-Factor Authentication enabled successfully! Please save your backup codes.');
      router.push('/apply');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div style={styles.wrapper}>
      <div className="animate-fade-in-up" style={styles.card}>
        <h1 style={styles.title}>Set Up Multi-Factor Authentication (MFA)</h1>
        <p style={styles.subtitle}>Enhance your account security with TOTP.</p>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {!setupData ? (
          <button 
            onClick={initiateMfaSetup} 
            disabled={loading}
            style={styles.btn}
          >
            {loading ? 'Initializing...' : 'Begin Setup'}
          </button>
        ) : (
          <div style={styles.setupContainer}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              1. Scan this QR code with your Authenticator app (Google Authenticator, Authy, etc.):
            </p>
            
            <div style={styles.qrContainer}>
              <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />
            </div>

            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Or enter this code manually: <br/>
              <strong style={{ letterSpacing: '2px', color: 'var(--text-primary)' }}>{setupData.secret}</strong>
            </p>

            <form onSubmit={verifyAndEnableMfa} style={{ marginTop: '1.5rem' }}>
              <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                2. Enter the 6-digit code from your app to verify:
              </p>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                required
                style={styles.input}
              />
              <button 
                type="submit" 
                disabled={loading || totpCode.length !== 6}
                style={{...styles.btn, marginTop: '1rem'}}
              >
                {loading ? 'Verifying...' : 'Verify and Enable'}
              </button>
            </form>

            <div style={styles.backupCodesContainer}>
              <h4 style={{ color: 'var(--accent-orange)' }}>Save these backup codes</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                If you lose your device, use these to log in. Each can be used once.
              </p>
              <div style={styles.backupGrid}>
                {setupData.backupCodes.map((code, idx) => (
                  <div key={idx} style={styles.backupCode}>{code}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
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
    maxWidth: '500px', 
    background: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)',
    padding: '2.5rem',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-md)',
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
  errorBox: {
    padding: '0.75rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    color: '#ef4444',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    padding: '0.85rem',
    background: 'var(--gradient-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1.25rem',
    textAlign: 'center',
    letterSpacing: '5px',
    color: 'var(--text-primary)',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    outline: 'none',
  },
  setupContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  qrContainer: {
    background: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    width: 'fit-content',
    margin: '0 auto'
  },
  qrCode: {
    width: '200px',
    height: '200px'
  },
  backupCodesContainer: {
    marginTop: '2rem',
    padding: '1rem',
    background: 'rgba(249, 115, 22, 0.05)',
    border: '1px solid rgba(249, 115, 22, 0.2)',
    borderRadius: '8px'
  },
  backupGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem'
  },
  backupCode: {
    background: 'rgba(0,0,0,0.2)',
    padding: '0.5rem',
    textAlign: 'center',
    borderRadius: '4px',
    fontFamily: 'monospace',
    color: 'var(--text-primary)'
  }
};
