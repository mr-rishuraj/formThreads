import React, { useState, useEffect, useRef } from 'react';
import type { Team } from '../types';

interface CreateTeamModalProps {
  onConfirm: (name: string) => Promise<Team | null>;
  onClose: () => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ onConfirm, onClose }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<Team | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Team name is required.'); return; }
    setLoading(true);
    setError('');
    const team = await onConfirm(name.trim());
    setLoading(false);
    if (team) setCreated(team);
    else setError('Failed to create team. Try again.');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-mid)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: "'Outfit', sans-serif",
    transition: 'border-color 0.15s, box-shadow 0.15s',
    letterSpacing: '-0.01em',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-pop-in" style={{
        width: 400,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-mid)',
        borderRadius: 14,
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 2, background: '#333333' }} />

        {/* Header */}
        <div style={{
          padding: '18px 22px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
              Create team
            </h2>
            <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', margin: 0 }}>
              Share the code with participants
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 7, cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 14,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {created ? (
            /* ── Success state ── */
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(52,211,153,0.12)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ color: '#34d399', fontSize: 13 }}>✓</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  Team <strong style={{ color: 'var(--text-primary)' }}>"{created.name}"</strong> created
                </p>
              </div>

              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-mid)',
                borderRadius: 10,
                padding: '14px 16px',
              }}>
                <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
                  Team code — share this
                </p>
                <div style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 32, fontWeight: 700,
                  color: 'var(--accent)',
                  letterSpacing: '0.35em',
                  textShadow: '0 0 20px var(--accent-glow)',
                }}>
                  {created.code}
                </div>
              </div>

              <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Participants enter this code after signing in to join the team.
              </p>

              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '10px',
                  fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
                  color: 'white', letterSpacing: '-0.01em',
                  background: '#1a1a1a',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  boxShadow: '0 2px 10px var(--accent-glow)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-glow)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px var(--accent-glow)'; }}
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Create form ── */
            <>
              <div>
                <label style={{ display: 'block', fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Team name <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder="e.g. Alpha Squad"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent-dim)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-mid)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {error && (
                <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: '#f87171', margin: 0 }}>
                  ⚠ {error}
                </p>
              )}
              <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', margin: 0 }}>
                A unique 6-character code is generated automatically.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {!created && (
          <div style={{
            padding: '12px 22px 18px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
              Esc to cancel
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{
                padding: '8px 14px',
                fontFamily: "'Fira Code', monospace", fontSize: 10,
                color: 'var(--text-secondary)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-mid)',
                borderRadius: 8, cursor: 'pointer',
                transition: 'all 0.12s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !name.trim()}
                style={{
                  padding: '8px 18px',
                  fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                  color: (loading || !name.trim()) ? 'var(--text-muted)' : 'white',
                  background: (loading || !name.trim())
                    ? 'var(--bg-elevated)'
                    : 'linear-gradient(135deg, var(--accent) 0%, #8b7cf6 100%)',
                  border: 'none', borderRadius: 8,
                  cursor: (loading || !name.trim()) ? 'not-allowed' : 'pointer',
                  letterSpacing: '-0.01em',
                  boxShadow: (!loading && name.trim()) ? '0 2px 8px var(--accent-glow)' : 'none',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => {
                  if (!loading && name.trim()) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px var(--accent-glow)'; }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = (!loading && name.trim()) ? '0 2px 8px var(--accent-glow)' : 'none';
                }}
              >
                {loading ? 'Creating…' : 'Create team'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTeamModal;
