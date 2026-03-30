import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: () => Promise<void>;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await onLogin();
    } catch (err: any) {
      setError(err.message ?? 'Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative', zIndex: 10,
      height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Ambient glow behind card */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(124,106,255,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div className="animate-pop-in" style={{
        width: 380,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-mid)',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Top gradient stripe */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, var(--accent) 0%, #a78bfa 50%, #60a5fa 100%)',
        }} />

        {/* Header */}
        <div style={{ padding: '28px 32px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px var(--accent-glow)',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h9M2 12h11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                FormThread
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
                conversational forms
              </div>
            </div>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            Sign in to your workspace
          </h1>
          <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
            role-based access · real-time threads
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Sign in with your Google account. Your role is assigned automatically based on your account.
          </p>

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 8,
              background: 'rgba(248,113,113,0.07)',
              border: '1px solid rgba(248,113,113,0.2)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ color: '#f87171', fontSize: 12 }}>⚠</span>
              <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: '#f87171', margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '12px 20px',
              borderRadius: 10,
              border: '1px solid var(--border-mid)',
              background: loading ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-mid)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
            }}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
                  Redirecting to Google…
                </span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Continue with Google
                </span>
              </>
            )}
          </button>

          <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
            By continuing you agree to the Terms of Service.<br/>
            Role is assigned based on your account.
          </p>
        </div>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="animate-spin">
    <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none"/>
    <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export default AuthPage;
