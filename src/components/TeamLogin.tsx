import React, { useState } from 'react';

interface TeamLoginProps {
  onLogin: (name: string, accessKey: string) => Promise<boolean>;
  onSwitchToAdmin: () => void;
  error: string | null;
  loading: boolean;
}

const TeamLogin: React.FC<TeamLoginProps> = ({ onLogin, onSwitchToAdmin, error, loading }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;
    await onLogin(name.trim(), key.trim().toUpperCase());
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '2px solid var(--border-mid)',
    color: 'var(--text-primary)',
    fontFamily: "'VT323', monospace",
    fontSize: 20,
    padding: '10px 14px',
    outline: 'none',
    letterSpacing: '0.05em',
  };

  return (
    <div style={{
      position: 'relative', zIndex: 10,
      height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
    }}>
      <div style={{
        width: 380,
        background: 'var(--bg-surface)',
        border: '2px solid var(--border-mid)',
        boxShadow: '6px 6px 0 rgba(0,0,0,0.6)',
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32,
              background: 'var(--accent)',
              border: '2px solid var(--accent)',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.5), 0 0 12px var(--accent-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 3h12M1 7h8M1 11h10" stroke="white" strokeWidth="2" strokeLinecap="square"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--text-primary)', lineHeight: 1.8 }}>
                SOLVE FOR PILANI
              </div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--accent)', letterSpacing: '0.15em' }}>
                ROUND 2
              </div>
            </div>
          </div>
          <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 22, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.05em' }}>
            Team Login
          </h1>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Enter your team credentials to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Team Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Team Alpha"
              disabled={loading}
              style={inputStyle}
              onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--accent)'}
              onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border-mid)'}
              autoComplete="off"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Access Key
            </label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              disabled={loading}
              style={{ ...inputStyle, letterSpacing: '0.3em' }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--accent)'}
              onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border-mid)'}
              autoComplete="off"
              maxLength={12}
            />
          </div>

          {error && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255,68,102,0.08)',
              border: '1px solid rgba(255,68,102,0.35)',
              fontFamily: "'VT323', monospace", fontSize: 15,
              color: 'var(--status-flag)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim() || !key.trim() || loading}
            className="pixel-btn"
            style={{
              padding: '12px',
              background: name.trim() && key.trim() && !loading ? 'var(--accent)' : 'var(--bg-elevated)',
              border: `2px solid ${name.trim() && key.trim() && !loading ? 'var(--accent)' : 'var(--border-mid)'}`,
              color: name.trim() && key.trim() && !loading ? 'white' : 'var(--text-muted)',
              fontFamily: "'VT323', monospace", fontSize: 18,
              cursor: name.trim() && key.trim() && !loading ? 'pointer' : 'not-allowed',
              boxShadow: name.trim() && key.trim() ? '3px 3px 0 rgba(0,0,0,0.4)' : 'none',
              letterSpacing: '0.1em',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {[0,1,2].map(i => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </span>
            ) : 'Enter'}
          </button>
        </form>

        {/* Admin link */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, textAlign: 'center' }}>
          <button
            onClick={onSwitchToAdmin}
            style={{
              background: 'none', border: 'none',
              fontFamily: "'VT323', monospace", fontSize: 14,
              color: 'var(--text-muted)', cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--accent)'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
          >
            Admin? Sign in with Google →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamLogin;
