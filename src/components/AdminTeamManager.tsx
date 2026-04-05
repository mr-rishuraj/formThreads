import React, { useState } from 'react';
import type { Team, StandaloneQuestion } from '../types';
import { getAssignedTeamIds } from '../queries/questions';

interface AdminTeamManagerProps {
  teams: Team[];
  questions: StandaloneQuestion[];
  onCreateTeam: (name: string) => Promise<Team | null>;
  onDeleteTeam: (id: string) => void;
  onCreateQuestion: (title: string, description: string) => Promise<any>;
  onDeleteQuestion: (id: string) => void;
  onAssignToTeams: (questionId: string, teamIds: string[]) => Promise<void>;
  onClose: () => void;
}

const AdminTeamManager: React.FC<AdminTeamManagerProps> = ({
  teams, questions,
  onCreateTeam, onDeleteTeam,
  onCreateQuestion, onDeleteQuestion, onAssignToTeams,
  onClose,
}) => {
  const [tab, setTab] = useState<'teams' | 'questions'>('teams');
  const [newTeamName, setNewTeamName] = useState('');
  const [newQTitle, setNewQTitle] = useState('');
  const [newQDesc, setNewQDesc] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [creatingQ, setCreatingQ] = useState(false);
  const [qError, setQError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [assigningQ, setAssigningQ] = useState<StandaloneQuestion | null>(null);
  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    await onCreateTeam(newTeamName.trim());
    setNewTeamName('');
    setCreatingTeam(false);
  };

  const handleCreateQuestion = async () => {
    if (!newQTitle.trim()) return;
    setCreatingQ(true);
    setQError(null);
    try {
      await onCreateQuestion(newQTitle.trim(), newQDesc.trim());
      setNewQTitle('');
      setNewQDesc('');
    } catch (e: any) {
      setQError(e?.message ?? 'Failed to create question. Make sure migration SQL has been run.');
    } finally {
      setCreatingQ(false);
    }
  };

  const openAssign = async (q: StandaloneQuestion) => {
    setAssigningQ(q);
    const ids = await getAssignedTeamIds(q.id);
    setAssignedIds(ids);
  };

  const toggleTeam = (teamId: string) => {
    setAssignedIds(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const saveAssignment = async () => {
    if (!assigningQ) return;
    setAssigning(true);
    await onAssignToTeams(assigningQ.id, assignedIds);
    setAssigning(false);
    setAssigningQ(null);
  };

  const boxStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-mid)',
    padding: '10px 14px',
    marginBottom: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  };

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    padding: '4px 12px',
    fontFamily: "'VT323', monospace", fontSize: 14,
    background: active ? 'var(--accent)' : 'var(--bg-base)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border-mid)'}`,
    color: active ? 'white' : 'var(--text-muted)',
    cursor: 'pointer',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)',
    }}>
      <div style={{
        width: 560, maxHeight: '85vh',
        background: 'var(--bg-surface)',
        border: '2px solid var(--border-mid)',
        boxShadow: '6px 6px 0 rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            ADMIN PANEL
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: '2px 6px' }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--status-flag)'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
          >×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          {(['teams', 'questions'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px',
                background: tab === t ? 'var(--bg-elevated)' : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                fontFamily: "'VT323', monospace", fontSize: 16,
                color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* ── Teams tab ── */}
          {tab === 'teams' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateTeam()}
                  placeholder="New team name…"
                  style={{
                    flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                    color: 'var(--text-primary)', fontFamily: "'VT323', monospace", fontSize: 17,
                    padding: '8px 12px', outline: 'none',
                  }}
                />
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim() || creatingTeam}
                  className="pixel-btn"
                  style={btnStyle(!!newTeamName.trim())}
                >
                  {creatingTeam ? '…' : 'Create'}
                </button>
              </div>

              {teams.length === 0 ? (
                <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>No teams yet.</p>
              ) : (
                teams.map(t => (
                  <div key={t.id} style={boxStyle}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'VT323', monospace", fontSize: 17, color: 'var(--text-primary)' }}>{t.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>code:</span>
                        <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-secondary)', letterSpacing: '0.15em' }}>{t.code}</span>
                        <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>key:</span>
                        <span style={{
                          fontFamily: "'VT323', monospace", fontSize: 14, letterSpacing: '0.2em',
                          color: 'var(--accent)',
                          background: 'rgba(136,119,255,0.1)',
                          border: '1px solid var(--accent-dim)',
                          padding: '0 6px',
                        }}>{t.accessKey}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => copyKey(t.accessKey, t.id)}
                        style={btnStyle()}
                      >
                        {copiedId === t.id ? '✓ copied' : 'copy key'}
                      </button>
                      <button
                        onClick={() => onDeleteTeam(t.id)}
                        style={{ ...btnStyle(), color: 'var(--status-flag)', borderColor: 'rgba(255,68,102,0.3)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,68,102,0.1)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-base)'}
                      >del</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* ── Questions tab ── */}
          {tab === 'questions' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  value={newQTitle}
                  onChange={e => setNewQTitle(e.target.value)}
                  placeholder="Question title…"
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                    color: 'var(--text-primary)', fontFamily: "'VT323', monospace", fontSize: 17,
                    padding: '8px 12px', outline: 'none',
                  }}
                />
                <textarea
                  value={newQDesc}
                  onChange={e => setNewQDesc(e.target.value)}
                  placeholder="Description / context (optional)…"
                  rows={2}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                    color: 'var(--text-primary)', fontFamily: "'VT323', monospace", fontSize: 16,
                    padding: '8px 12px', outline: 'none', resize: 'vertical',
                  }}
                />
                <button
                  onClick={handleCreateQuestion}
                  disabled={!newQTitle.trim() || creatingQ}
                  className="pixel-btn"
                  style={{ ...btnStyle(!!newQTitle.trim()), alignSelf: 'flex-start', padding: '6px 18px' }}
                >
                  {creatingQ ? '…' : 'Add Question'}
                </button>
                {qError && (
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(255,68,102,0.08)',
                    border: '1px solid rgba(255,68,102,0.35)',
                    fontFamily: "'VT323', monospace", fontSize: 15,
                    color: 'var(--status-flag)',
                  }}>
                    {qError}
                  </div>
                )}
              </div>

              {questions.length === 0 ? (
                <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>No questions yet.</p>
              ) : (
                questions.map(q => (
                  <div key={q.id} style={boxStyle}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: "'VT323', monospace", fontSize: 17, color: 'var(--text-primary)' }}>{q.title}</div>
                      {q.description && (
                        <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.description}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => openAssign(q)} style={btnStyle()}>assign</button>
                      <button
                        onClick={() => onDeleteQuestion(q.id)}
                        style={{ ...btnStyle(), color: 'var(--status-flag)', borderColor: 'rgba(255,68,102,0.3)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,68,102,0.1)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-base)'}
                      >del</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Assign modal ── */}
      {assigningQ && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
        }}>
          <div style={{
            width: 360,
            background: 'var(--bg-surface)',
            border: '2px solid var(--border-mid)',
            boxShadow: '6px 6px 0 rgba(0,0,0,0.6)',
            padding: '24px',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                Assign to teams
              </div>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: 'var(--text-primary)' }}>
                {assigningQ.title}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
              {teams.length === 0 && (
                <p style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>No teams to assign.</p>
              )}
              {teams.map(t => {
                const checked = assignedIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTeam(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px',
                      background: checked ? 'rgba(136,119,255,0.1)' : 'var(--bg-elevated)',
                      border: `1px solid ${checked ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: 14, height: 14, flexShrink: 0,
                      background: checked ? 'var(--accent)' : 'var(--bg-hover)',
                      border: `1px solid ${checked ? 'var(--accent)' : 'var(--border-mid)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: 'white',
                    }}>
                      {checked ? '✓' : ''}
                    </span>
                    <span style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={saveAssignment}
                disabled={assigning}
                className="pixel-btn"
                style={{ ...btnStyle(true), flex: 1, padding: '8px' }}
              >
                {assigning ? '…' : 'Save'}
              </button>
              <button
                onClick={() => setAssigningQ(null)}
                style={{ ...btnStyle(), padding: '8px 16px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeamManager;
