import React, { useState, useEffect } from 'react';
import type { Team } from '../types';

interface AssignTeamModalProps {
  formName: string;
  formId: string;
  allTeams: Team[];
  assignedTeamIds: string[];
  onToggle: (formId: string, teamId: string, assign: boolean) => Promise<void>;
  onClose: () => void;
}

const AssignTeamModal: React.FC<AssignTeamModalProps> = ({
  formName, formId, allTeams, assignedTeamIds, onToggle, onClose,
}) => {
  const [localAssigned, setLocalAssigned] = useState<Set<string>>(new Set(assignedTeamIds));
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleToggle = async (teamId: string) => {
    const isAssigned = localAssigned.has(teamId);
    setSaving(teamId);
    setLocalAssigned(prev => {
      const next = new Set(prev);
      if (isAssigned) next.delete(teamId); else next.add(teamId);
      return next;
    });
    await onToggle(formId, teamId, !isAssigned);
    setSaving(null);
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
              Assign to teams
            </h2>
            <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', margin: 0, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formName}
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
        <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
          {allTeams.length === 0 ? (
            <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              No teams yet. Create a team first.
            </p>
          ) : (
            allTeams.map(team => {
              const isAssigned = localAssigned.has(team.id);
              const isSaving = saving === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => handleToggle(team.id)}
                  disabled={isSaving}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 9,
                    border: `1px solid ${isAssigned ? 'var(--accent-dim)' : 'var(--border-subtle)'}`,
                    background: isAssigned ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isSaving && !isAssigned) e.currentTarget.style.borderColor = 'var(--border-mid)';
                  }}
                  onMouseLeave={e => {
                    if (!isAssigned) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: `1.5px solid ${isAssigned ? 'var(--accent)' : 'var(--border-mid)'}`,
                      background: isAssigned ? '#1a1a1a' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      boxShadow: isAssigned ? '0 0 6px var(--accent-glow)' : 'none',
                    }}>
                      {isAssigned && <span style={{ color: 'white', fontSize: 9, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: isAssigned ? 'var(--text-primary)' : 'var(--text-secondary)', margin: '0 0 1px', letterSpacing: '-0.01em' }}>
                        {team.name}
                      </p>
                      <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', margin: 0 }}>
                        {team.code}
                      </p>
                    </div>
                  </div>
                  {isSaving && (
                    <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
                      saving…
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 22px 18px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
            Changes save instantly
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
              color: 'white',
              background: '#1a1a1a',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              letterSpacing: '-0.01em',
              boxShadow: '0 2px 8px var(--accent-glow)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px var(--accent-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px var(--accent-glow)'; }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTeamModal;
