import React, { useEffect, useRef, useState } from 'react';
import { Question, Form, User } from '../types';
import { useMessages } from '../hooks/useMessages';
import MessageBubble from './MessageBubble';
import ReplyBox from './ReplyBox';

interface ThreadViewProps {
  question: Question | null;
  form: Form | null;
  onSendReply: (questionId: string, content: string) => Promise<void> | void;
  onUpdateQuestion?: (id: string, patch: Partial<Pick<Question, 'title' | 'description'>>) => void;
  user: User;
}

const STATUS_CONFIG = {
  answered:             { label: 'Answered',       bg: 'rgba(0,255,159,0.07)',   text: 'var(--status-done)', border: 'rgba(0,255,159,0.3)',   dot: 'var(--status-done)' },
  unanswered:           { label: 'Awaiting reply',  bg: 'rgba(255,215,0,0.07)',   text: 'var(--status-wait)', border: 'rgba(255,215,0,0.3)',   dot: 'var(--status-wait)' },
  'needs-clarification':{ label: 'Follow-up needed',bg: 'rgba(255,68,102,0.07)', text: 'var(--status-flag)', border: 'rgba(255,68,102,0.3)',  dot: 'var(--status-flag)' },
} as const;

// ── Editable Field ────────────────────────────────────────────
interface EditableFieldProps {
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  style?: React.CSSProperties;
}

const EditableField: React.FC<EditableFieldProps> = ({ value, placeholder, onSave, multiline = false, style = {} }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); setEditing(false); }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed !== value) onSave(trimmed);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
    if (!multiline && e.key === 'Enter') { e.preventDefault(); commit(); }
    if (multiline && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
  };

  if (editing) {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      background: 'var(--bg-elevated)',
      border: '2px solid var(--accent-dim)',
      color: 'var(--text-primary)',
      outline: 'none',
      fontFamily: "'VT323', monospace",
      ...style,
    };
    return multiline
      ? <textarea autoFocus rows={3} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={(e) => { const rel = e.relatedTarget as HTMLElement | null; if (rel && (rel.tagName === 'BUTTON' || rel.closest('button'))) return; commit(); }} placeholder={placeholder}
          style={{ ...baseStyle, padding: '8px 10px', resize: 'none', lineHeight: 1.5 }}
        />
      : <input autoFocus type="text" value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={(e) => { const rel = e.relatedTarget as HTMLElement | null; if (rel && (rel.tagName === 'BUTTON' || rel.closest('button'))) return; commit(); }} placeholder={placeholder}
          style={{ ...baseStyle, padding: '3px 8px' }}
        />;
  }

  return (
    <div
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
      style={{
        cursor: 'text', position: 'relative',
        padding: '2px 4px', margin: '-2px -4px',
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      {value ? (
        <span>{value}</span>
      ) : (
        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{placeholder}</span>
      )}
      <span style={{
        position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
        fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--accent)',
        opacity: 0,
        pointerEvents: 'none', userSelect: 'none',
      }} className="edit-pencil">✎</span>
    </div>
  );
};

// ── ThreadView ────────────────────────────────────────────────
const ThreadView: React.FC<ThreadViewProps> = ({ question, form, onSendReply, onUpdateQuestion, user }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user.role === 'admin';
  const { messages, loading: messagesLoading } = useMessages(question?.id ?? null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, question?.id]);

  if (!question) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 280 }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--bg-elevated)',
            border: '2px solid var(--border-mid)',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 10h10M4 14h13M4 18h8" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </div>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
            No thread selected
          </p>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Pick a question from the list to view the conversation
          </p>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[question.status];
  const respondentInitial = (form?.respondentName?.[0] ?? 'R').toUpperCase();

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
      background: 'var(--bg-base)',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 24px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        background: 'var(--bg-surface)',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {isAdmin ? (
            <EditableField
              value={question.title}
              placeholder="Untitled Question"
              onSave={v => onUpdateQuestion?.(question.id, { title: v })}
              style={{ fontFamily: "'VT323', monospace", fontSize: 22, color: 'var(--text-primary)', lineHeight: 1.3 }}
            />
          ) : (
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: 22, fontWeight: 400, margin: 0, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {question.title}
            </h2>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)' }}>
              {form?.name}
            </span>
            <span style={{ width: 4, height: 4, background: 'var(--text-muted)', display: 'inline-block' }} />
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)' }}>
              {messages.length} messages
            </span>
            <span style={{ width: 4, height: 4, background: 'var(--text-muted)', display: 'inline-block' }} />
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)' }}>
              {question.lastActivity}
            </span>
          </div>
        </div>

        {/* Status badge — pixel chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px',
          background: status.bg,
          border: `1px solid ${status.border}`,
          boxShadow: `2px 2px 0 rgba(0,0,0,0.3)`,
          flexShrink: 0,
        }}>
          <span style={{
            width: 6, height: 6,
            background: status.dot,
            display: 'inline-block',
            boxShadow: `0 0 5px ${status.dot}`,
          }} />
          <span style={{
            fontFamily: "'VT323', monospace", fontSize: 14, letterSpacing: '0.06em',
            color: status.text, whiteSpace: 'nowrap', textTransform: 'uppercase',
          }}>
            {status.label}
          </span>
        </div>
      </div>

      {/* ── Context card ── */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
        background: 'var(--bg-surface)',
      }}>
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-mid)',
          boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{
              width: 18, height: 18,
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v5M5 8.5v.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="square"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Question context
            </span>
            {isAdmin && (
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                [editable]
              </span>
            )}
          </div>
          {isAdmin ? (
            <EditableField
              value={question.description}
              placeholder="Add context or instructions for the respondent…"
              onSave={v => onUpdateQuestion?.(question.id, { description: v })}
              multiline
              style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.5 }}
            />
          ) : (
            <p style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {question.description || <span style={{ color: 'var(--text-muted)' }}>No context provided</span>}
            </p>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {messagesLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'VT323', monospace", fontSize: 48, marginBottom: 10,
                color: 'var(--text-muted)',
              }}>[ ]</div>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                No replies yet — be the first
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="divider-label">thread start</div>
            {messages.map((m, i) => (
              <MessageBubble key={m.id} message={m} isNew={i === messages.length - 1} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Reply box ── */}
      <div style={{
        padding: '12px 24px 18px',
        flexShrink: 0,
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}>
        <ReplyBox
          onSend={content => onSendReply(question.id, content) ?? Promise.resolve()}
          respondentName={isAdmin ? user.name : (form?.respondentName ?? 'Respondent')}
          respondentInitial={isAdmin ? user.initial : respondentInitial}
        />
      </div>
    </div>
  );
};

export default ThreadView;
