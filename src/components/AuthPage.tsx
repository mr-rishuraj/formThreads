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
      flexDirection: 'column', gap: 20,
    }}>
      {/* Game title above card */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 28,
          color: 'var(--accent)',
          textShadow: '0 0 24px var(--accent-glow), 4px 4px 0 rgba(0,0,0,0.9)',
          letterSpacing: '0.06em',
          marginBottom: 10,
          lineHeight: 1.5,
        }}>
          SOLVE FOR<br/>PILANI
        </div>
        <div style={{
          fontFamily: "'VT323', monospace",
          fontSize: 18,
          color: 'var(--text-muted)',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
        }}>
          · · · RESPONSE ENGINE · · ·
        </div>
      </div>

      {/* Card */}
      <div className="animate-pop-in" style={{
        width: 380,
        background: 'var(--bg-surface)',
        border: '2px solid var(--border-mid)',
        boxShadow: '6px 6px 0 rgba(0,0,0,0.7), 0 0 40px var(--accent-glow)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Accent top stripe */}
        <div style={{ height: 4, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)' }} />

        {/* Player select header */}
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
        }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7,
            color: 'var(--text-muted)',
            letterSpacing: '0.2em',
            marginBottom: 10,
          }}>
            ── PLAYER SELECT ──
          </div>
          <h1 style={{
            fontFamily: "'VT323', monospace",
            fontSize: 28, color: 'var(--text-primary)',
            margin: '0 0 4px', letterSpacing: '0.02em',
          }}>
            Sign in to continue
          </h1>
          <p style={{
            fontFamily: "'VT323', monospace", fontSize: 14,
            color: 'var(--text-muted)', margin: 0,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Role assigned automatically · Real-time threads
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Save slot */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-mid)',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--bg-hover)',
              border: '2px solid var(--border-mid)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: 'var(--text-tertiary)' }}>?</span>
            </div>
            <div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SAVE SLOT 1</div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--text-secondary)' }}>Your Google account</div>
            </div>
            <div style={{ marginLeft: 'auto', fontFamily: "'VT323', monospace", fontSize: 24, color: 'var(--accent)' }} className="animate-pixel-blink">
              ▶
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(255,68,102,0.07)',
              border: '2px solid rgba(255,68,102,0.3)',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontFamily: "'VT323', monospace", color: 'var(--status-flag)', fontSize: 18, flexShrink: 0 }}>■</span>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--status-flag)', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Press Start button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="pixel-btn"
            style={{
              width: '100%', padding: '14px 20px',
              border: `2px solid ${loading ? 'var(--border-mid)' : 'var(--accent)'}`,
              background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '4px 4px 0 rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--accent-hover)';
                e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,0,0,0.6)';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.5)';
              }
            }}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                  Loading…
                </span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'white', letterSpacing: '0.05em' }}>
                  Press Start
                </span>
              </>
            )}
          </button>

          <p style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, margin: 0, letterSpacing: '0.05em' }}>
            BY CONTINUING YOU AGREE TO THE TERMS.<br/>
            ROLE IS ASSIGNED BASED ON YOUR ACCOUNT.
          </p>
        </div>
      </div>

      {/* Blinking insert coin */}
      <p style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7, color: 'var(--text-muted)',
        letterSpacing: '0.1em', margin: 0,
      }} className="animate-pixel-blink">
        INSERT COIN TO CONTINUE
      </p>
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
    <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export default AuthPage;
