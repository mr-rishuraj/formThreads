import React, { useState } from 'react';
import { User, Team, TeamQuestion, TeamSession } from '../types';

interface SidebarProps {
  // admin OAuth user OR team session display name
  user?: User | null;
  teamSession?: TeamSession | null;
  onLogout: () => void;
  isAdmin?: boolean;
  // admin
  teams?: Team[];
  selectedTeamId?: string | null;
  onSelectTeam?: (id: string) => void;
  // participant
  questions?: TeamQuestion[];
  selectedQuestionId?: string | null;
  onSelectQuestion?: (id: string) => void;
}

const STATUS_COLOR: Record<TeamQuestion['status'], string> = {
  pending:   'var(--status-wait)',
  completed: 'var(--status-done)',
  draft:     'var(--status-flag)',
};

// const STATUS_BG: Record<TeamQuestion['status'], string> = {
//   pending:   'rgba(255,255,255,0.04)',
//   completed: 'rgba(255,255,255,0.07)',
//   draft:     'rgba(255,255,255,0.02)',
// };

const GROUPS: { label: string; status: TeamQuestion['status'] }[] = [
  { label: 'Not Seen', status: 'pending' },
  { label: 'Draft',    status: 'draft' },
  { label: 'Sent',     status: 'completed' },
];

// ── Participant nav: Inbox accordion ──────────────────────────
interface ParticipantNavProps {
  teamName: string;
  questions: TeamQuestion[];
  selectedQuestionId: string | null;
  onSelectQuestion?: (id: string) => void;
}

const ParticipantNav: React.FC<ParticipantNavProps> = ({
  teamName, questions, selectedQuestionId, onSelectQuestion,
}) => {
  const [inboxOpen, setInboxOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    pending: true, draft: true, completed: true,
  });

  const toggleGroup = (status: string) =>
    setOpenGroups(prev => ({ ...prev, [status]: !prev[status] }));

  const totalUnread = questions.filter(q => q.unread).length;

  return (
    <>
      {teamName && (
        <div style={{
          padding: '10px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0,
        }}>
          <div style={{
            width: 22, height: 22,
            background: 'var(--accent-soft)',
            border: '1px solid var(--border-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, flexShrink: 0,
          }}>★</div>
          <div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Team</div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--accent)' }}>{teamName}</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* ── Inbox row ── */}
        <button
          onClick={() => setInboxOpen(o => !o)}
          style={{
            width: '100%', textAlign: 'left',
            padding: '10px 20px',
            border: 'none', borderBottom: '1px solid var(--border-subtle)',
            background: inboxOpen ? 'var(--bg-active)' : 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
          onMouseEnter={e => { if (!inboxOpen) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
          onMouseLeave={e => { if (!inboxOpen) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
            <path d="M1 1h11v8H8.5l-2 2-2-2H1V1z" stroke="var(--accent)" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--text-primary)', flex: 1 }}>Inbox</span>
          {totalUnread > 0 && (
            <span style={{
              fontFamily: "'VT323', monospace", fontSize: 12,
              background: 'var(--accent)', color: 'white',
              padding: '1px 6px', minWidth: 18, textAlign: 'center',
            }}>{totalUnread}</span>
          )}
          <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 2 }}>
            {inboxOpen ? '▼' : '▶'}
          </span>
        </button>

        {/* ── Groups inside Inbox ── */}
        {inboxOpen && (
          <>
            {GROUPS.map(({ label, status }) => {
              const group = questions.filter(q => q.status === status);
              if (group.length === 0) return null;
              const isGroupOpen = openGroups[status] ?? true;
              return (
                <div key={status}>
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroup(status)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '6px 20px 6px 32px',
                      border: 'none', borderBottom: '1px solid var(--border-subtle)',
                      background: 'var(--bg-base)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 7,
                    }}
                  >
                    <span style={{
                      width: 5, height: 5, flexShrink: 0,
                      background: STATUS_COLOR[status as TeamQuestion['status']],
                      display: 'inline-block',
                      boxShadow: 'none',
                    }} />
                    <span style={{
                      fontFamily: "'VT323', monospace", fontSize: 12,
                      color: STATUS_COLOR[status as TeamQuestion['status']],
                      textTransform: 'uppercase', letterSpacing: '0.12em', flex: 1,
                    }}>{label}</span>
                    <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                      {group.length}
                    </span>
                    <span style={{ fontSize: 8, color: 'var(--text-muted)', marginLeft: 4 }}>
                      {isGroupOpen ? '▼' : '▶'}
                    </span>
                  </button>

                  {/* Questions in group */}
                  {isGroupOpen && group.map(q => {
                    const isActive = selectedQuestionId === q.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => onSelectQuestion?.(q.id)}
                        style={{
                          width: '100%', textAlign: 'left',
                          padding: '9px 20px 9px 40px',
                          border: 'none',
                          borderLeft: `3px solid ${isActive ? STATUS_COLOR[q.status] : 'transparent'}`,
                          background: isActive ? 'var(--bg-active)' : 'transparent',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-subtle)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <span style={{
                          fontFamily: "'VT323', monospace", fontSize: 15,
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          lineHeight: 1.3,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{q.title}</span>
                        {q.status === 'completed' ? (
                          <span style={{
                            fontFamily: "'VT323', monospace", fontSize: 11,
                            color: 'var(--status-done)',
                            background: 'var(--accent-soft)',
                            border: '1px solid var(--border-mid)',
                            padding: '1px 5px', flexShrink: 0,
                          }}>✓</span>
                        ) : q.unread ? (
                          <span style={{
                            width: 7, height: 7,
                            background: 'var(--accent)',
                            display: 'inline-block', flexShrink: 0,
                          }} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {questions.length === 0 && (
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)', padding: '14px 20px 14px 32px', margin: 0 }}>
                No questions yet
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  user, teamSession, onLogout,
  isAdmin = false,
  teams = [], selectedTeamId = null, onSelectTeam,
  questions = [], selectedQuestionId = null, onSelectQuestion,
}) => {
  const displayName = user?.name ?? teamSession?.teamName ?? '';
  const displayEmail = user?.email ?? '';
  const displayInitial = displayName[0]?.toUpperCase() ?? '?';
  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* ── Logo ── */}
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--accent)',
            border: '2px solid var(--accent)',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M1 7h8M1 11h10" stroke="white" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--text-primary)', lineHeight: 1.8 }}>
              SOLVE FOR PILANI
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--accent)', letterSpacing: '0.15em', marginTop: 2 }}>
              SFP
            </div>
          </div>
        </div>
      </div>

      {isAdmin ? (
        /* ── Admin: Teams list ── */
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px 8px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Teams
            </span>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-tertiary)' }}>
              {teams.length}
            </span>
          </div>

          {teams.length === 0 ? (
            <p style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)', padding: '12px 20px', margin: 0 }}>
              No teams yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {teams.map(t => {
                const isActive = selectedTeamId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTeam?.(t.id)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '11px 20px',
                      border: 'none',
                      borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                      background: isActive ? 'var(--bg-active)' : 'transparent',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 11, color: isActive ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }}>★</span>
                      <span style={{
                        fontFamily: "'VT323', monospace", fontSize: 16,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{t.name}</span>
                    </div>
                    <span style={{
                      fontFamily: "'VT323', monospace", fontSize: 12,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-subtle)',
                      padding: '1px 6px',
                      letterSpacing: '0.08em', flexShrink: 0,
                    }}>{t.code}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Participant: Team badge + Inbox accordion ── */
        <ParticipantNav
          teamName={user?.teamName ?? teamSession?.teamName ?? ''}
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={onSelectQuestion}
        />
      )}

      {/* ── User footer ── */}
      <div style={{
        padding: '10px 14px',
        borderTop: '2px solid var(--border-mid)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32,
          background: 'var(--bg-hover)',
          border: '2px solid var(--border-mid)',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace", fontSize: 10,
          color: 'var(--accent)', flexShrink: 0,
        }}>
          {displayInitial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </div>
          {displayEmail && (
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayEmail}
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: '1px solid transparent',
            cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.color = 'var(--text-primary)';
            el.style.borderColor = 'var(--border-mid)';
            el.style.background = 'var(--bg-hover)';
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

export default Sidebar;
