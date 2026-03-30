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
  newMessageId?: string | null;
  user: User;
}

const STATUS_CONFIG = {
  answered: { label: 'Answered', bg: 'rgba(52,211,153,0.08)', text: '#34d399', border: 'rgba(52,211,153,0.2)', dot: '#34d399' },
  unanswered: { label: 'Awaiting reply', bg: 'rgba(245,158,11,0.08)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)', dot: '#f59e0b' },
  'needs-clarification': { label: 'Follow-up needed', bg: 'rgba(248,113,113,0.08)', text: '#f87171', border: 'rgba(248,113,113,0.2)', dot: '#f87171' },
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
      border: '1px solid var(--accent-dim)',
      borderRadius: 6,
      color: 'var(--text-primary)',
      outline: 'none',
      fontFamily: "'Outfit', system-ui, sans-serif",
      ...style,
    };
    return multiline
      ? <textarea autoFocus rows={3} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={(e) => { const rel = e.relatedTarget as HTMLElement | null; if (rel && (rel.tagName === "BUTTON" || rel.closest("button"))) return; commit(); }} placeholder={placeholder}
          style={{ ...baseStyle, padding: '8px 10px', resize: 'none', lineHeight: 1.6 }}
        />
      : <input autoFocus type="text" value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={(e) => { const rel = e.relatedTarget as HTMLElement | null; if (rel && (rel.tagName === "BUTTON" || rel.closest("button"))) return; commit(); }} placeholder={placeholder}
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
        borderRadius: 4,
        transition: 'background 0.1s',
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
        fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--accent)',
        opacity: 0, transition: 'opacity 0.1s',
        pointerEvents: 'none', userSelect: 'none',
      }} className="edit-pencil">✎</span>
    </div>
  );
};

// ── ThreadView ────────────────────────────────────────────────
const ThreadView: React.FC<ThreadViewProps> = ({ question, form, onSendReply, onUpdateQuestion, newMessageId, user }) => {
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
            borderRadius: 16,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 10h10M4 14h13M4 18h8" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 6px' }}>
            No thread selected
          </p>
          <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
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
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.4 }}
            />
          ) : (
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.4 }}>
              {question.title}
            </h2>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
              {form?.name}
            </span>
            <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} />
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
              {messages.length} messages
            </span>
            <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} />
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
              {question.lastActivity}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px',
          borderRadius: 20,
          background: status.bg,
          border: `1px solid ${status.border}`,
          flexShrink: 0,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: status.dot,
            display: 'inline-block',
            boxShadow: `0 0 5px ${status.dot}`,
          }} />
          <span style={{
            fontFamily: "'Fira Code', monospace", fontSize: 9, fontWeight: 600,
            color: status.text, whiteSpace: 'nowrap',
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
          borderRadius: 10,
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{
              width: 18, height: 18,
              borderRadius: 5,
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v5M5 8.5v.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Question context
            </span>
            {isAdmin && (
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 8, color: 'var(--text-muted)', marginLeft: 'auto', fontStyle: 'italic' }}>
                editable
              </span>
            )}
          </div>
          {isAdmin ? (
            <EditableField
              value={question.description}
              placeholder="Add context or instructions for the respondent…"
              onSave={v => onUpdateQuestion?.(question.id, { description: v })}
              multiline
              style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}
            />
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
              {question.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No context provided</span>}
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
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.14}s` }} />
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 32, marginBottom: 10,
                filter: 'grayscale(1)', opacity: 0.3,
              }}>💬</div>
              <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
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
