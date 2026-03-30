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
    if (!trimmed) { setError('Please enter a team code.'); return; }
    if (trimmed.length !== 6) { setError('Team code must be 6 characters.'); return; }
    setLoading(true);
    setError(null);
    const team = await onJoin(trimmed);
    if (team) {
      setSuccess(`Joined "${team.name}"! Loading workspace…`);
    } else {
      setError('Invalid team code. Please check and try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'relative', zIndex: 10,
      height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(124,106,255,0.10) 0%, transparent 70%)',
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
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--accent) 0%, #a78bfa 100%)' }} />

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
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              FormThread
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
            Join your team
          </h1>
          <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
            Hey {userName} — enter the code your admin shared
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {success ? (
            <div className="animate-fade-in" style={{
              padding: '14px 16px', borderRadius: 10,
              background: 'rgba(52,211,153,0.07)',
              border: '1px solid rgba(52,211,153,0.2)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: 'rgba(52,211,153,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#34d399', fontSize: 12 }}>✓</span>
              </div>
              <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: '#34d399', margin: 0 }}>
                {success}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'Fira Code', monospace", fontSize: 9,
                  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
                  marginBottom: 8,
                }}>
                  Team code
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
                    border: '1px solid var(--border-mid)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    fontSize: 22, fontFamily: "'Fira Code', monospace",
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    letterSpacing: '0.3em', textAlign: 'center',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--accent-dim)';
                    e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border-mid)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(248,113,113,0.07)',
                  border: '1px solid rgba(248,113,113,0.2)',
                }}>
                  <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: '#f87171', margin: 0 }}>
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !code.trim()}
                style={{
                  width: '100%', padding: '12px',
                  borderRadius: 10, border: 'none',
                  background: (loading || !code.trim())
                    ? 'var(--bg-elevated)'
                    : 'linear-gradient(135deg, var(--accent) 0%, #8b7cf6 100%)',
                  color: (loading || !code.trim()) ? 'var(--text-muted)' : 'white',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
                  cursor: (loading || !code.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: (!loading && code.trim()) ? '0 2px 12px var(--accent-glow)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!loading && code.trim()) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px var(--accent-glow)';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = (!loading && code.trim()) ? '0 2px 12px var(--accent-glow)' : 'none';
                }}
              >
                {loading ? 'Verifying…' : 'Join Team →'}
              </button>

              <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                Don't have a code? Ask your admin.
              </p>
            </>
          )}
        </div>

        <div style={{ padding: '0 32px 20px' }}>
          <button
            onClick={onLogout}
            style={{
              fontFamily: "'Fira Code', monospace", fontSize: 9,
              color: 'var(--text-muted)', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
          >
            ← Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamJoinPage;
