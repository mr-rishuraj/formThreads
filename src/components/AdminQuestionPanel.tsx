import React from 'react';
import { TeamQuestion } from '../types';

interface AdminQuestionPanelProps {
  questions: TeamQuestion[];
  forms?: any[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  loading?: boolean;
}

const STATUS_LABEL: Record<TeamQuestion['status'], string> = {
  pending:   'Not Seen',
  completed: 'Sent',
  draft:     'Draft',
};

const STATUS_COLOR: Record<TeamQuestion['status'], string> = {
  pending:   'var(--status-wait)',
  completed: 'var(--status-done)',
  draft:     'var(--status-flag)',
};

const STATUS_BG: Record<TeamQuestion['status'], string> = {
  pending:   'rgba(255,255,255,0.04)',
  completed: 'rgba(255,255,255,0.07)',
  draft:     'rgba(255,255,255,0.02)',
};

const GROUPS: { label: string; status: TeamQuestion['status'] }[] = [
  { label: 'Not Seen', status: 'pending' },
  { label: 'Draft',    status: 'draft' },
  { label: 'Sent',     status: 'completed' },
];

const AdminQuestionPanel: React.FC<AdminQuestionPanelProps> = ({
  questions, forms, selectedQuestionId, onSelectQuestion, loading = false,
}) => {
  return (
    <div style={{
      width: '300px',
      flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Questions
        </span>
        <span style={{
          fontFamily: "'VT323', monospace", fontSize: 13,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
          padding: '1px 8px', color: 'var(--text-secondary)',
        }}>
          {questions.length}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 6 }}>
            {[0,1,2].map(i => (
              <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div style={{ padding: '24px 18px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
              Select a team to view questions
            </p>
          </div>
        ) : (
          GROUPS.map(({ label, status }) => {
            const group = questions.filter(q => q.status === status);
            if (group.length === 0) return null;
            return (
              <div key={status}>
                {/* Group header */}
                <div style={{
                  padding: '8px 18px 4px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'var(--bg-base)',
                }}>
                  <span style={{
                    width: 6, height: 6, flexShrink: 0,
                    background: STATUS_COLOR[status],
                    display: 'inline-block',
                  }} />
                  <span style={{
                    fontFamily: "'VT323', monospace", fontSize: 12,
                    color: STATUS_COLOR[status], textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontFamily: "'VT323', monospace", fontSize: 12,
                    color: 'var(--text-muted)', marginLeft: 'auto',
                  }}>
                    {group.length}
                  </span>
                </div>

                {/* Question rows */}
                {group.map(q => {
                  const isActive = selectedQuestionId === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => onSelectQuestion(q.id)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '10px 18px',
                        border: 'none',
                        borderLeft: `3px solid ${isActive ? STATUS_COLOR[q.status] : 'transparent'}`,
                        background: isActive ? STATUS_BG[q.status] : 'transparent',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', gap: 4,
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <span style={{
                        fontFamily: "'VT323', monospace", fontSize: 16,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        lineHeight: 1.2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        display: 'block',
                      }}>
                        {q.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontFamily: "'VT323', monospace", fontSize: 12,
                          color: 'var(--text-muted)',
                        }}>
                          {q.teamId.slice(0, 6)}
                        </span>
                        <span style={{
                          fontFamily: "'VT323', monospace", fontSize: 11,
                          color: STATUS_COLOR[q.status],
                          background: STATUS_BG[q.status],
                          border: `1px solid var(--border-subtle)`,
                          padding: '0 5px',
                          marginLeft: 'auto',
                        }}>
                          {STATUS_LABEL[q.status]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminQuestionPanel;
