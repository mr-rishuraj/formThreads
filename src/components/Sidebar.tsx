import React, { useState } from 'react';
import { Form, Question, User, Team } from '../types';

interface SidebarProps {
  forms: Form[];
  allQuestions: Question[];
  selectedFormId: string;
  onSelectForm: (id: string) => void;
  unreadCount: (formId: string) => number;
  user: User;
  onLogout: () => void;
  onCreateForm?: (name: string) => void;
  teams?: Team[];
  onCreateTeam?: () => void;
  onAssignTeam?: (formId: string) => void;
  onDeleteForm?: (formId: string) => void;
  onDeleteTeam?: (teamId: string) => void;
  onLeaveTeam?: () => void;
}

// ── Rank system ────────────────────────────────────────────────
function getRank(score: number): { level: number; label: string; next: number } {
  const tiers = [
    { min: 0,    level: 1, label: 'CADET',    next: 200  },
    { min: 200,  level: 2, label: 'ROOKIE',   next: 500  },
    { min: 500,  level: 3, label: 'FIGHTER',  next: 1000 },
    { min: 1000, level: 4, label: 'VETERAN',  next: 2000 },
    { min: 2000, level: 5, label: 'EXPERT',   next: 4000 },
    { min: 4000, level: 6, label: 'MASTER',   next: 8000 },
    { min: 8000, level: 7, label: 'LEGEND',   next: 8000 },
  ];
  const tier = [...tiers].reverse().find(t => score >= t.min) ?? tiers[0];
  return tier;
}

function calcScore(questions: Question[]): number {
  const answered = questions.filter(q => q.status === 'answered').length;
  const flagged  = questions.filter(q => q.status === 'needs-clarification').length;
  return answered * 100 + flagged * 40;
}

const Sidebar: React.FC<SidebarProps> = ({
  forms, allQuestions, selectedFormId, onSelectForm, unreadCount,
  user, onLogout, onCreateForm,
  teams = [], onCreateTeam, onAssignTeam,
  onDeleteForm, onDeleteTeam, onLeaveTeam,
}) => {
  const isAdmin = user.role === 'admin';
  const [creating, setCreating] = useState(false);
  const [newFormName, setNewFormName] = useState('');

  const totalUnread = forms.reduce((sum, f) => sum + unreadCount(f.id), 0);
  const answeredForms = forms.filter(f =>
    allQuestions.filter(q => q.formId === f.id).every(q => q.status === 'answered') &&
    allQuestions.filter(q => q.formId === f.id).length > 0
  ).length;

  // Score & rank
  const score = calcScore(allQuestions);
  const rank  = getRank(score);
  const totalQ   = allQuestions.length;
  const answeredQ = allQuestions.filter(q => q.status === 'answered').length;
  const xpPct = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;
  // Progress within current level bracket
  // const prevMin = rank.level === 1 ? 0 : [0,200,500,1000,2000,4000,8000][rank.level - 1];
  // const levelPct = rank.level === 7 ? 100 : Math.min(100, Math.round(((score - prevMin) / (rank.next - prevMin)) * 100));

  const handleCreate = () => {
    const name = newFormName.trim();
    if (!name) return;
    onCreateForm?.(name);
    setNewFormName('');
    setCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') { setCreating(false); setNewFormName(''); }
  };

  return (
    <aside style={{
      width: '240px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* ── Logo ── */}
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--accent)',
            border: '2px solid var(--accent)',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.5), 0 0 10px var(--accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M1 7h8M1 11h10" stroke="white" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--text-primary)', lineHeight: 2 }}>
              SFP
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--accent)', letterSpacing: '0.15em' }}>
              SOLVE FOR PILANI
            </div>
          </div>
        </div>
      </div>

      {/* ── Player stats / Rank card ── */}
      <div style={{
        margin: '10px 12px',
        padding: '10px 12px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-mid)',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.4)',
      }}>
        {/* Level + Rank row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              color: 'var(--xp-color)',
              background: 'rgba(255,215,0,0.08)',
              border: '1px solid rgba(255,215,0,0.3)',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.4)',
              padding: '3px 7px',
              whiteSpace: 'nowrap',
            }}>
              LV.{rank.level}
            </div>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              {rank.label}
            </span>
          </div>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)' }}>
            {score} pts
          </span>
        </div>

        {/* XP bar within current level */}
        {totalQ > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                EXP
              </span>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--xp-color)' }}>
                {xpPct}%
              </span>
            </div>
            <div className="xp-progress-track">
              <div
                className="xp-bar-fill"
                style={{
                  height: '100%',
                  background: xpPct === 100
                    ? 'var(--status-done)'
                    : 'linear-gradient(90deg, var(--xp-color), rgba(255,215,0,0.7))',
                  boxShadow: '0 0 6px rgba(255,215,0,0.4)',
                  ['--xp-w' as any]: `${xpPct}%`,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                {answeredQ}/{totalQ} cleared
              </span>
              {rank.level < 7 && (
                <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                  next: LV.{rank.level + 1}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Participant team badge ── */}
      {!isAdmin && user.teamName && (
        <div style={{
          padding: '8px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22,
              background: 'rgba(136,119,255,0.12)',
              border: '1px solid var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11,
            }}>★</div>
            <div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Party</div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--accent)' }}>{user.teamName}</div>
            </div>
          </div>
          {onLeaveTeam && (
            <button
              onClick={onLeaveTeam}
              style={{
                fontFamily: "'VT323', monospace", fontSize: 13,
                color: 'var(--text-muted)',
                background: 'none', border: '1px solid transparent',
                cursor: 'pointer', padding: '3px 7px',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.color = 'var(--status-flag)';
                (e.target as HTMLElement).style.borderColor = 'rgba(255,68,102,0.3)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.color = 'var(--text-muted)';
                (e.target as HTMLElement).style.borderColor = 'transparent';
              }}
            >
              leave
            </button>
          )}
        </div>
      )}

      {/* ── Quick stats row ── */}
      <div style={{
        display: 'flex',
        padding: '8px 12px',
        gap: 4,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {[
          { label: 'INBOX',  value: totalUnread > 0 ? totalUnread : '—', color: totalUnread > 0 ? 'var(--accent)' : 'var(--text-muted)' },
          { label: 'QUESTS', value: forms.length, color: 'var(--text-secondary)' },
          { label: 'CLEAR',  value: answeredForms, color: answeredForms > 0 ? 'var(--status-done)' : 'var(--text-muted)' },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1, textAlign: 'center',
            padding: '5px 4px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 20, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Admin: Party (Teams) ── */}
      {isAdmin && (
        <div style={{ padding: '10px 20px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Party
            </span>
            <button
              onClick={onCreateTeam}
              title="Create new team"
              className="pixel-btn"
              style={{
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                cursor: 'pointer',
                color: 'var(--text-tertiary)', fontSize: 14,
                boxShadow: '1px 1px 0 rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border-mid)'; (e.target as HTMLElement).style.color = 'var(--text-tertiary)'; }}
            >+</button>
          </div>
          {teams.length === 0 ? (
            <p style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)' }}>No party yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 96, overflowY: 'auto' }}>
              {teams.map(t => <TeamRow key={t.id} team={t} onDelete={onDeleteTeam} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Quests (Forms) section header ── */}
      <div style={{ padding: '10px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Active Quests
        </span>
        {isAdmin && (
          <button
            onClick={() => { setCreating(true); setNewFormName(''); }}
            title="Create new quest"
            className="pixel-btn"
            style={{
              width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
              cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: 14,
              boxShadow: '1px 1px 0 rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border-mid)'; (e.target as HTMLElement).style.color = 'var(--text-tertiary)'; }}
          >+</button>
        )}
      </div>

      {/* ── Inline create form ── */}
      {creating && (
        <div style={{ padding: '0 8px 8px' }} className="animate-fade-in">
          <div style={{
            background: 'var(--bg-elevated)',
            border: '2px solid var(--accent-dim)',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.4)',
            padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quest name</span>
            <input
              autoFocus
              type="text"
              value={newFormName}
              onChange={e => setNewFormName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. User Research"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                borderBottom: '1px solid var(--border-mid)',
                fontSize: 16, color: 'var(--text-primary)', width: '100%',
                fontFamily: "'VT323', monospace",
                paddingBottom: 4,
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleCreate}
                disabled={!newFormName.trim()}
                className="pixel-btn"
                style={{
                  padding: '4px 12px',
                  background: newFormName.trim() ? 'var(--accent)' : 'var(--bg-hover)',
                  color: newFormName.trim() ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${newFormName.trim() ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  cursor: newFormName.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: "'VT323', monospace", fontSize: 15,
                  boxShadow: newFormName.trim() ? '2px 2px 0 rgba(0,0,0,0.4)' : 'none',
                }}
              >Create</button>
              <button
                onClick={() => { setCreating(false); setNewFormName(''); }}
                style={{
                  padding: '4px 10px',
                  background: 'none', border: 'none',
                  color: 'var(--text-tertiary)', cursor: 'pointer',
                  fontFamily: "'VT323', monospace", fontSize: 15,
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quest list ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {forms.map(form => {
          const uc = unreadCount(form.id);
          const isActive = form.id === selectedFormId;
          const qCount = allQuestions.filter(q => q.formId === form.id).length;
          const doneCount = allQuestions.filter(q => q.formId === form.id && q.status === 'answered').length;
          const pct = qCount > 0 ? Math.round((doneCount / qCount) * 100) : 0;

          return (
            <FormRow
              key={form.id}
              form={form}
              isActive={isActive}
              unread={uc}
              qCount={qCount}
              pct={pct}
              isAdmin={isAdmin}
              onSelect={() => onSelectForm(form.id)}
              onAssign={onAssignTeam ? () => onAssignTeam(form.id) : undefined}
              onDelete={onDeleteForm ? () => onDeleteForm(form.id) : undefined}
            />
          );
        })}
      </nav>

      {/* ── User footer (Save Slot) ── */}
      <div style={{
        padding: '10px 14px',
        borderTop: '2px solid var(--border-mid)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-elevated)',
      }}>
        {/* Square pixel avatar */}
        <div style={{
          width: 32, height: 32,
          background: 'var(--bg-hover)',
          border: '2px solid var(--border-mid)',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace", fontSize: 10,
          color: 'var(--accent)', flexShrink: 0,
        }}>
          {user.initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </span>
            <span style={{
              fontFamily: "'VT323', monospace", fontSize: 11,
              padding: '1px 5px',
              background: isAdmin ? 'rgba(136,119,255,0.12)' : 'rgba(255,215,0,0.08)',
              color: isAdmin ? 'var(--accent)' : 'var(--xp-color)',
              border: `1px solid ${isAdmin ? 'var(--accent-dim)' : 'rgba(255,215,0,0.2)'}`,
              flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {isAdmin ? 'GM' : rank.label}
            </span>
          </div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
            {user.email}
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Save & Exit"
          className="pixel-btn"
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: '1px solid transparent',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.color = 'var(--status-flag)';
            el.style.borderColor = 'rgba(255,68,102,0.3)';
            el.style.background = 'rgba(255,68,102,0.07)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.color = 'var(--text-muted)';
            el.style.borderColor = 'transparent';
            el.style.background = 'none';
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2.5L10.5 5L8 7.5M10.5 5H4M5 1.5H2C1.72 1.5 1.5 1.72 1.5 2V10C1.5 10.28 1.72 10.5 2 10.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter"/>
          </svg>
        </button>
      </div>
    </aside>
  );
};

// ── Form Row ──────────────────────────────────────────────────
interface FormRowProps {
  form: Form; isActive: boolean; unread: number;
  qCount: number; pct: number; isAdmin: boolean;
  onSelect: () => void; onAssign?: () => void; onDelete?: () => void;
}
const FormRow: React.FC<FormRowProps> = ({ form, isActive, unread, qCount, pct, isAdmin, onSelect, onAssign, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const isComplete = pct === 100 && qCount > 0;

  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        onClick={onSelect}
        style={{
          width: '100%', textAlign: 'left',
          padding: '8px 12px',
          border: 'none',
          borderLeft: `3px solid ${isActive ? 'var(--accent)' : isComplete ? 'var(--status-done)' : 'transparent'}`,
          background: isActive ? 'var(--bg-active)' : hovered ? 'var(--bg-hover)' : 'transparent',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 13, flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{form.icon}</span>
            <span style={{
              fontFamily: "'VT323', monospace", fontSize: 16,
              color: isComplete ? 'var(--status-done)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {form.name}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
            {isComplete && (
              <span style={{
                fontFamily: "'VT323', monospace", fontSize: 12,
                color: 'var(--status-done)',
                background: 'rgba(0,255,159,0.08)',
                border: '1px solid rgba(0,255,159,0.3)',
                padding: '0 4px',
              }}>CLEAR</span>
            )}
            {unread > 0 && !isComplete && (
              <span className="animate-pulse-ring" style={{
                minWidth: 20, height: 18,
                background: 'var(--accent)',
                color: 'white',
                fontFamily: "'VT323', monospace", fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 5px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {unread}
              </span>
            )}
          </div>
        </div>

        {/* Mini progress bar */}
        {qCount > 0 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ height: 4, background: 'var(--bg-base)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: isComplete ? 'var(--status-done)' : isActive ? 'var(--accent)' : 'var(--text-tertiary)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                {qCount} obj · {form.respondentName.split(' ')[0] || 'Respondent'}
              </span>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: isComplete ? 'var(--status-done)' : 'var(--text-muted)' }}>
                {pct}%
              </span>
            </div>
          </div>
        )}
      </button>

      {isAdmin && hovered && (
        <div className="animate-fade-in" style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', gap: 3,
          background: 'var(--bg-active)',
          border: '1px solid var(--border-mid)',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.4)',
          padding: '3px 4px',
        }}>
          {onAssign && (
            <button onClick={e => { e.stopPropagation(); onAssign(); }}
              style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 5px' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--accent)'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-tertiary)'}
            >party</button>
          )}
          {onDelete && (
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: 15, lineHeight: 1 }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--status-flag)'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-tertiary)'}
            >×</button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Team Row ──────────────────────────────────────────────────
const TeamRow: React.FC<{ team: Team; onDelete?: (id: string) => void }> = ({ team, onDelete }) => {
  const [h, setH] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</span>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '1px 5px', flexShrink: 0 }}>{team.code}</span>
      </div>
      {onDelete && h && (
        <button onClick={() => onDelete(team.id)}
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, lineHeight: 1, flexShrink: 0, marginLeft: 4 }}
          onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--status-flag)'}
          onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
        >×</button>
      )}
    </div>
  );
};

export default Sidebar;
