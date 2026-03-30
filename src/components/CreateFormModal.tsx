import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface CreateFormModalProps {
  onConfirm: (name: string, respondentName: string, respondentEmail: string, icon: string) => void;
  onClose: () => void;
}

const ICONS = ['◈', '◉', '◎', '▣', '◆', '⬡', '⬟', '◐'];

const CreateFormModal: React.FC<CreateFormModalProps> = ({ onConfirm, onClose }) => {
  const [name, setName] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [iconIndex, setIconIndex] = useState(0);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedRespondent = respondentName.trim();
    if (!trimmedName) { setError('Form name is required.'); nameRef.current?.focus(); return; }
    if (!trimmedRespondent) { setError('Respondent name is required.'); return; }
    onConfirm(trimmedName, trimmedRespondent, respondentEmail.trim(), ICONS[iconIndex]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Fira Code', monospace", fontSize: 9,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: 6,
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
        width: 420,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-mid)',
        borderRadius: 14,
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, var(--accent), #a78bfa)' }} />

        {/* Header */}
        <div style={{
          padding: '18px 22px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              Create form
            </h2>
            <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', margin: 0 }}>
              New conversational form
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: 7, cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 14, lineHeight: 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Icon picker */}
          <div>
            <label style={labelStyle}>Icon</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {ICONS.map((icon, i) => (
                <button
                  key={icon}
                  onClick={() => setIconIndex(i)}
                  style={{
                    width: 32, height: 32, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 7,
                    border: `1px solid ${i === iconIndex ? 'var(--accent)' : 'var(--border-mid)'}`,
                    background: i === iconIndex ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    color: i === iconIndex ? 'var(--accent)' : 'var(--text-tertiary)',
                    cursor: 'pointer', transition: 'all 0.12s',
                    boxShadow: i === iconIndex ? '0 0 8px var(--accent-glow)' : 'none',
                  }}
                >{icon}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Form name <span style={{ color: '#f87171' }}>*</span></label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Series A Due Diligence"
              style={inputStyle}
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

          <div>
            <label style={labelStyle}>Respondent name <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="text"
              value={respondentName}
              onChange={e => { setRespondentName(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Arjun Mehta"
              style={inputStyle}
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

          <div>
            <label style={labelStyle}>Respondent email</label>
            <input
              type="email"
              value={respondentEmail}
              onChange={e => setRespondentEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. arjun@company.com"
              style={inputStyle}
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
            <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: '#f87171', margin: 0 }}>
              ⚠ {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px 18px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
            Esc to cancel
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
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
              style={{
                padding: '8px 18px',
                fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, var(--accent) 0%, #8b7cf6 100%)',
                border: 'none',
                borderRadius: 8, cursor: 'pointer',
                transition: 'all 0.12s',
                letterSpacing: '-0.01em',
                boxShadow: '0 2px 8px var(--accent-glow)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px var(--accent-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px var(--accent-glow)';
              }}
            >
              Create form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFormModal;
