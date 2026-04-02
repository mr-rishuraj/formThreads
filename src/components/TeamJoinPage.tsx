import React, { useState } from 'react';
import type { Team } from '../types';

interface TeamJoinPageProps {
  userName: string;
  onJoin: (code: string) => Promise<Team | null>;
  onLogout: () => void;
}

const TeamJoinPage: React.FC<TeamJoinPageProps> = ({ userName, onJoin, onLogout }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError('Enter a party code.'); return; }
    if (trimmed.length !== 6) { setError('Party code must be 6 characters.'); return; }
    setLoading(true);
    setError(null);
    const team = await onJoin(trimmed);
    if (team) {
      setSuccess(`Joined "${team.name}"! Loading workspace…`);
    } else {
      setError('Invalid code. Check with your admin.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'relative', zIndex: 10,
      height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 18,
          color: 'var(--accent)',
          textShadow: '0 0 20px var(--accent-glow), 3px 3px 0 rgba(0,0,0,0.9)',
          letterSpacing: '0.06em',
          marginBottom: 8, lineHeight: 1.6,
        }}>
          SOLVE FOR<br/>PILANI
        </div>
        <div style={{
          fontFamily: "'VT323', monospace",
          fontSize: 16, color: 'var(--text-muted)',
          letterSpacing: '0.3em',
        }}>
          · · · RESPONSE ENGINE · · ·
        </div>
      </div>

      {/* Card */}
      <div className="animate-pop-in" style={{
        width: 380,
        background: 'var(--bg-surface)',
        border: '2px solid var(--border-mid)',
        boxShadow: '6px 6px 0 rgba(0,0,0,0.7), 0 0 30px var(--accent-glow)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 4, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }} />

        {/* Header */}
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 32, height: 32,
              background: 'var(--accent)',
              border: '2px solid var(--accent)',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h9M2 12h11" stroke="white" strokeWidth="2" strokeLinecap="square"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--text-primary)', lineHeight: 1.8 }}>SFP</div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--accent)', letterSpacing: '0.15em' }}>SOLVE FOR PILANI</div>
            </div>
          </div>
          <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 26, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Join your party
          </h1>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-muted)', margin: 0, letterSpacing: '0.04em' }}>
            Hey {userName} — enter the code your admin shared
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {success ? (
            <div className="animate-fade-in" style={{
              padding: '14px 16px',
              background: 'rgba(0,255,159,0.07)',
              border: '2px solid rgba(0,255,159,0.3)',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: 'var(--status-done)', flexShrink: 0 }}>★</span>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--status-done)', margin: 0 }}>
                {success}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'VT323', monospace", fontSize: 14,
                  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em',
                  marginBottom: 8,
                }}>
                  Party Code
                </label>
                <input
                  autoFocus
                  type="text"
                  value={code}
                  onChange={e => {
                    setCode(e.target.value.toUpperCase().slice(0, 6));
                    setError(null);
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder="ABCXYZ"
                  maxLength={6}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '2px solid var(--border-mid)',
                    padding: '12px 16px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 18,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    letterSpacing: '0.3em', textAlign: 'center',
                    boxShadow: '3px 3px 0 rgba(0,0,0,0.4)',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '3px 3px 0 var(--accent-dim)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border-mid)';
                    e.target.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.4)';
                  }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(255,68,102,0.07)',
                  border: '2px solid rgba(255,68,102,0.3)',
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontFamily: "'VT323', monospace", color: 'var(--status-flag)', fontSize: 16 }}>■</span>
                  <p style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--status-flag)', margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !code.trim()}
                className="pixel-btn"
                style={{
                  width: '100%', padding: '12px',
                  border: `2px solid ${(!loading && code.trim()) ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  background: (!loading && code.trim()) ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: (!loading && code.trim()) ? 'white' : 'var(--text-muted)',
                  fontFamily: "'VT323', monospace",
                  fontSize: 18, letterSpacing: '0.06em',
                  cursor: (loading || !code.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: (!loading && code.trim()) ? '4px 4px 0 rgba(0,0,0,0.5)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!loading && code.trim()) {
                    e.currentTarget.style.background = 'var(--accent-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (!loading && code.trim()) {
                    e.currentTarget.style.background = 'var(--accent)';
                  }
                }}
              >
                {loading ? 'Verifying…' : 'Join Party →'}
              </button>

              <p style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', margin: 0, letterSpacing: '0.06em' }}>
                NO CODE? ASK YOUR ADMIN.
              </p>
            </>
          )}
        </div>

        <div style={{ padding: '0 28px 18px' }}>
          <button
            onClick={onLogout}
            style={{
              fontFamily: "'VT323', monospace", fontSize: 15,
              color: 'var(--text-muted)', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
            }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
          >
            ← Sign out
          </button>
        </div>
      </div>

      <p style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7, color: 'var(--text-muted)',
        letterSpacing: '0.1em', margin: 0,
      }} className="animate-pixel-blink">
        WAITING FOR PARTY CODE…
      </p>
    </div>
  );
};

export default TeamJoinPage;
