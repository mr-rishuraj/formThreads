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

  // XP calculation: % of questions answered across all forms
  const totalQ = allQuestions.length;
  const answeredQ = allQuestions.filter(q => q.status === 'answered').length;
  const xpPct = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;

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
    <aside
      style={{
        width: '240px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* ── Logo ── */}
      <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px var(--accent-glow)',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M1 7h8M1 11h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              FormThread
            </div>
          </div>
        </div>

        {/* XP Progress bar — gamification element */}
        {totalQ > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Progress
              </span>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>
                {xpPct}%
              </span>
            </div>
            <div style={{
              height: 3, borderRadius: 4,
              background: 'var(--accent-dim)',
              overflow: 'hidden',
            }}>
              <div
                className="xp-bar-fill"
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent), #a78bfa)',
                  borderRadius: 4,
                  ['--xp-w' as any]: `${xpPct}%`,
                }}
              />
            </div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
              {answeredQ}/{totalQ} answered
            </div>
          </div>
        )}
      </div>

      {/* ── Participant team badge ── */}
      {!isAdmin && user.teamName && (
        <div style={{
          padding: '10px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'rgba(124,106,255,0.12)',
              border: '1px solid var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L7.5 4.5H11L8.25 6.75L9.25 10L6 8L2.75 10L3.75 6.75L1 4.5H4.5L6 1Z" fill="var(--accent)" opacity="0.9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Team</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>{user.teamName}</div>
            </div>
          </div>
          {onLeaveTeam && (
            <button
              onClick={onLeaveTeam}
              style={{
                fontFamily: "'Fira Code', monospace", fontSize: 9,
                color: 'var(--text-muted)',
                background: 'none', border: 'none',
                cursor: 'pointer', padding: '3px 7px',
                borderRadius: 4,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.color = 'var(--status-flag)';
                (e.target as HTMLElement).style.background = 'rgba(248,113,113,0.08)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.color = 'var(--text-muted)';
                (e.target as HTMLElement).style.background = 'none';
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
        padding: '10px 20px',
        gap: 8,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {[
          { label: 'Inbox', value: totalUnread > 0 ? totalUnread : '—', color: totalUnread > 0 ? 'var(--accent)' : 'var(--text-muted)' },
          { label: 'Forms', value: forms.length, color: 'var(--text-secondary)' },
          { label: 'Done', value: answeredForms, color: answeredForms > 0 ? 'var(--status-done)' : 'var(--text-muted)' },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: stat.color, letterSpacing: '-0.03em' }}>{stat.value}</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Admin: Teams ── */}
      {isAdmin && (
        <div style={{ padding: '12px 20px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Teams
            </span>
            <button
              onClick={onCreateTeam}
              title="Create new team"
              style={{
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                borderRadius: 5, cursor: 'pointer',
                color: 'var(--text-tertiary)', fontSize: 14, fontWeight: 400,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.borderColor = 'var(--accent)';
                (e.target as HTMLElement).style.color = 'var(--accent)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.borderColor = 'var(--border-mid)';
                (e.target as HTMLElement).style.color = 'var(--text-tertiary)';
              }}
            >+</button>
          </div>
          {teams.length === 0 ? (
            <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>No teams yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 96, overflowY: 'auto' }}>
              {teams.map(t => (
                <TeamRow key={t.id} team={t} onDelete={onDeleteTeam} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Forms section header ── */}
      <div style={{ padding: '12px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Forms
        </span>
        {isAdmin && (
          <button
            onClick={() => { setCreating(true); setNewFormName(''); }}
            title="Create new form"
            style={{
              width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
              borderRadius: 5, cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: 14,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.borderColor = 'var(--accent)';
              (e.target as HTMLElement).style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.borderColor = 'var(--border-mid)';
              (e.target as HTMLElement).style.color = 'var(--text-tertiary)';
            }}
          >+</button>
        )}
      </div>

      {/* ── Inline create form ── */}
      {creating && (
        <div style={{ padding: '0 8px 8px' }} className="animate-fade-in">
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--accent-dim)',
            borderRadius: 8, padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-tertiary)' }}>New form name</span>
            <input
              autoFocus
              type="text"
              value={newFormName}
              onChange={e => setNewFormName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. User Research"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 12, color: 'var(--text-primary)', width: '100%',
                fontFamily: "'Outfit', sans-serif",
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleCreate}
                disabled={!newFormName.trim()}
                style={{
                  padding: '5px 12px',
                  background: newFormName.trim() ? 'var(--accent)' : 'var(--bg-hover)',
                  color: newFormName.trim() ? 'white' : 'var(--text-muted)',
                  border: 'none', borderRadius: 5, cursor: newFormName.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >Create</button>
              <button
                onClick={() => { setCreating(false); setNewFormName(''); }}
                style={{
                  padding: '5px 10px',
                  background: 'none', border: 'none',
                  color: 'var(--text-tertiary)', cursor: 'pointer',
                  fontFamily: "'Fira Code', monospace", fontSize: 10,
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form list ── */}
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

      {/* ── User footer ── */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-surface)',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--bg-hover) 0%, var(--bg-active) 100%)',
          border: '1px solid var(--border-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 600,
          color: 'var(--text-secondary)', flexShrink: 0,
        }}>
          {user.initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </span>
            <span style={{
              fontFamily: "'Fira Code', monospace", fontSize: 8,
              padding: '1px 5px', borderRadius: 4,
              background: isAdmin ? 'rgba(124,106,255,0.12)' : 'var(--bg-elevated)',
              color: isAdmin ? 'var(--accent)' : 'var(--text-tertiary)',
              border: `1px solid ${isAdmin ? 'var(--accent-dim)' : 'var(--border-subtle)'}`,
              flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {user.role}
            </span>
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
            {user.email}
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          style={{
            width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: '1px solid transparent',
            borderRadius: 6, cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.color = 'var(--status-flag)';
            el.style.borderColor = 'rgba(248,113,113,0.3)';
            el.style.background = 'rgba(248,113,113,0.07)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.color = 'var(--text-muted)';
            el.style.borderColor = 'transparent';
            el.style.background = 'none';
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2.5L10.5 5L8 7.5M10.5 5H4M5 1.5H2C1.72 1.5 1.5 1.72 1.5 2V10C1.5 10.28 1.72 10.5 2 10.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </aside>
  );
};

// ── Form Row ──────────────────────────────────────────────────
interface FormRowProps {
  form: Form;
  isActive: boolean;
  unread: number;
  qCount: number;
  pct: number;
  isAdmin: boolean;
  onSelect: () => void;
  onAssign?: () => void;
  onDelete?: () => void;
}
const FormRow: React.FC<FormRowProps> = ({ form, isActive, unread, qCount, pct, isAdmin, onSelect, onAssign, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onSelect}
        style={{
          width: '100%', textAlign: 'left',
          padding: '9px 12px',
          borderRadius: 8,
          border: 'none',
          borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
          background: isActive ? 'var(--bg-active)' : hovered ? 'var(--bg-hover)' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
            <span style={{
              fontSize: 14, flexShrink: 0, lineHeight: 1,
              opacity: isActive ? 1 : 0.6,
              filter: isActive ? 'none' : 'grayscale(0.4)',
            }}>{form.icon}</span>
            <span style={{
              fontSize: 12, fontWeight: unread > 0 ? 600 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {form.name}
            </span>
          </div>
          {unread > 0 && (
            <span className="animate-pulse-ring" style={{
              flexShrink: 0,
              minWidth: 18, height: 18, borderRadius: 9,
              background: 'var(--accent)',
              color: 'white',
              fontFamily: "'Fira Code', monospace",
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 5px',
            }}>
              {unread}
            </span>
          )}
        </div>

        {/* Mini progress bar */}
        {qCount > 0 && (
          <div style={{ marginTop: 7 }}>
            <div style={{ height: 2, borderRadius: 2, background: 'var(--border-subtle)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: 2,
                background: pct === 100 ? 'var(--status-done)' : isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
                {qCount}q · {form.respondentName.split(' ')[0]}
              </span>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: pct === 100 ? 'var(--status-done)' : 'var(--text-muted)' }}>
                {pct}%
              </span>
            </div>
          </div>
        )}
      </button>

      {/* Admin hover actions */}
      {isAdmin && hovered && (
        <div className="animate-fade-in" style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', gap: 3,
          background: 'var(--bg-active)',
          border: '1px solid var(--border-mid)',
          borderRadius: 6, padding: '3px 4px',
        }}>
          {onAssign && (
            <button
              onClick={e => { e.stopPropagation(); onAssign(); }}
              title="Assign to team"
              style={{
                fontFamily: "'Fira Code', monospace", fontSize: 8,
                color: 'var(--text-tertiary)', background: 'none', border: 'none',
                cursor: 'pointer', padding: '2px 5px', borderRadius: 3,
                transition: 'color 0.1s',
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--accent)'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-tertiary)'}
            >teams</button>
          )}
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(); }}
              title="Delete form"
              style={{
                color: 'var(--text-tertiary)', background: 'none', border: 'none',
                cursor: 'pointer', padding: '2px 4px', borderRadius: 3,
                fontSize: 13, lineHeight: 1, transition: 'color 0.1s',
              }}
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
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</span>
        <span style={{
          fontFamily: "'Fira Code', monospace", fontSize: 9,
          color: 'var(--text-muted)', background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          padding: '1px 5px', borderRadius: 3, flexShrink: 0,
        }}>{team.code}</span>
      </div>
      {onDelete && h && (
        <button
          onClick={() => onDelete(team.id)}
          style={{
            color: 'var(--text-muted)', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 13, lineHeight: 1, flexShrink: 0, marginLeft: 4,
            transition: 'color 0.1s',
          }}
          onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--status-flag)'}
          onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
        >×</button>
      )}
    </div>
  );
};

export default Sidebar;
