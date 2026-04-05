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
  onUpdateStatus?: (id: string, status: Question['status']) => void;
  user: User;
}

const STATUS_CONFIG = {
  answered:             { label: 'Sent',     bg: '#e8e8e8', color: '#1a1a1a' },
  unanswered:           { label: 'Not Seen', bg: '#f1f1f1', color: '#555555' },
  'needs-clarification':{ label: 'Draft',    bg: '#f5f5f5', color: '#333333' },
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
      background: '#fff',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: 6,
      color: '#202124',
      outline: 'none',
      fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
      boxShadow: '0 0 0 2px rgba(0,0,0,0.15)',
      ...style,
    };
    return multiline
      ? <textarea autoFocus rows={3} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={(e) => { const rel = e.relatedTarget as HTMLElement | null; if (rel && (rel.tagName === 'BUTTON' || rel.closest('button'))) return; commit(); }}
          placeholder={placeholder}
          style={{ ...baseStyle, padding: '8px 10px', resize: 'none', lineHeight: 1.6 }}
        />
      : <input autoFocus type="text" value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={(e) => { const rel = e.relatedTarget as HTMLElement | null; if (rel && (rel.tagName === 'BUTTON' || rel.closest('button'))) return; commit(); }}
          placeholder={placeholder}
          style={{ ...baseStyle, padding: '4px 10px' }}
        />;
  }

  return (
    <div
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
      style={{
        cursor: 'text', position: 'relative',
        padding: '3px 6px', margin: '-3px -6px',
        borderRadius: 4,
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f1f3f4'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      {value ? (
        <span>{value}</span>
      ) : (
        <span style={{ color: '#9aa0a6', fontStyle: 'italic' }}>{placeholder}</span>
      )}
      <span style={{
        position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
        fontSize: 12, color: '#111111', opacity: 0,
        pointerEvents: 'none', userSelect: 'none',
      }} className="edit-pencil">✎</span>
    </div>
  );
};

// ── ThreadView ────────────────────────────────────────────────
const ThreadView: React.FC<ThreadViewProps> = ({ question, form, onSendReply, onUpdateQuestion, onUpdateStatus, user }) => {
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
        background: '#f6f8fc',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 280 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16 }}>
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  fill="#dadce0"/>
          </svg>
          <p style={{
            fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
            fontSize: 16, color: '#5f6368', margin: '0 0 6px',
          }}>
            No thread selected
          </p>
          <p style={{
            fontFamily: 'Roboto, Arial, sans-serif',
            fontSize: 13, color: '#80868b', margin: 0,
          }}>
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
      background: '#f6f8fc', fontFamily: 'Roboto, Arial, sans-serif',
    }}>

      {/* ── Subject / header ── */}
      <div style={{
        padding: '20px 28px 12px',
        background: '#f6f8fc',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isAdmin ? (
              <EditableField
                value={question.title}
                placeholder="Untitled Question"
                onSave={v => onUpdateQuestion?.(question.id, { title: v })}
                style={{
                  fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                  fontSize: 22, fontWeight: 400, color: '#202124', lineHeight: 1.35,
                  display: 'block',
                }}
              />
            ) : (
              <h2 style={{
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                fontSize: 22, fontWeight: 400, margin: 0,
                color: '#202124', lineHeight: 1.35,
              }}>
                {question.title}
              </h2>
            )}
          </div>

          {/* Status badge */}
          <span style={{
            flexShrink: 0, padding: '4px 10px', borderRadius: 4,
            fontSize: 12, fontWeight: 500,
            background: status.bg, color: status.color,
          }}>
            {status.label}
          </span>
        </div>

        {/* Meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 5,
          fontFamily: 'Roboto, Arial, sans-serif', fontSize: 13, color: '#5f6368',
        }}>
          {form?.name && <span>{form.name}</span>}
          {form?.name && <span>·</span>}
          <span>{messages.length} {messages.length === 1 ? 'message' : 'messages'}</span>
          {question.lastActivity && <><span>·</span><span>{question.lastActivity}</span></>}
        </div>
      </div>

      {/* ── Context / description card ── */}
      <div style={{
        padding: '0 28px 16px',
        flexShrink: 0,
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 8,
          border: '1px solid #e0e0e0',
          padding: '14px 18px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                    fill="#5f6368"/>
            </svg>
            <span style={{
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
              fontSize: 12, fontWeight: 500, color: '#5f6368',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Question context
            </span>
            {isAdmin && (
              <span style={{
                marginLeft: 'auto', fontSize: 11, color: '#111111',
                fontFamily: 'Roboto, Arial, sans-serif',
              }}>
                Click to edit
              </span>
            )}
          </div>
          {isAdmin ? (
            <EditableField
              value={question.description}
              placeholder="Add context or instructions for the respondent…"
              onSave={v => onUpdateQuestion?.(question.id, { description: v })}
              multiline
              style={{
                fontFamily: 'Roboto, Arial, sans-serif',
                fontSize: 14, color: '#3c4043', lineHeight: 1.6,
                display: 'block',
              }}
            />
          ) : (
            <p style={{
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: 14, color: '#3c4043', lineHeight: 1.6, margin: 0,
            }}>
              {question.description || (
                <span style={{ color: '#9aa0a6', fontStyle: 'italic' }}>No context provided</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '0 28px 12px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {messagesLoading ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, gap: 8,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: '#111111',
                display: 'inline-block',
                animation: 'bounceDot 1.2s infinite',
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80,
          }}>
            <p style={{
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: 14, color: '#80868b', margin: 0,
            }}>
              No replies yet — be the first
            </p>
          </div>
        ) : (
          <>
            {/* Thread divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
              <span style={{ fontSize: 12, color: '#80868b', whiteSpace: 'nowrap' }}>
                {messages.length} {messages.length === 1 ? 'reply' : 'replies'}
              </span>
              <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
            </div>
            {messages.map((m, i) => (
              <MessageBubble key={m.id} message={m} isNew={i === messages.length - 1} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Admin status controls ── */}
      {isAdmin && onUpdateStatus && (
        <div style={{
          padding: '10px 28px',
          borderTop: '1px solid #e0e0e0',
          background: '#ffffff',
          display: 'flex', gap: 8, alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'Roboto, Arial, sans-serif',
            fontSize: 12, color: '#5f6368', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4,
          }}>
            Mark as:
          </span>
          <button
            onClick={() => onUpdateStatus(question.id, 'answered')}
            disabled={question.status === 'answered'}
            style={{
              padding: '5px 14px', borderRadius: 16,
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
              fontSize: 13, fontWeight: 500, cursor: question.status === 'answered' ? 'default' : 'pointer',
              background: question.status === 'answered' ? '#e6f4ea' : 'transparent',
              border: `1px solid ${question.status === 'answered' ? '#34a853' : '#dadce0'}`,
              color: '#137333',
              opacity: question.status === 'answered' ? 0.7 : 1,
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { if (question.status !== 'answered') e.currentTarget.style.background = '#e6f4ea'; }}
            onMouseLeave={e => { if (question.status !== 'answered') e.currentTarget.style.background = 'transparent'; }}
          >
            Completed
          </button>
          <button
            onClick={() => onUpdateStatus(question.id, 'unanswered')}
            disabled={question.status === 'unanswered'}
            style={{
              padding: '5px 14px', borderRadius: 16,
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
              fontSize: 13, fontWeight: 500, cursor: question.status === 'unanswered' ? 'default' : 'pointer',
              background: question.status === 'unanswered' ? '#fef7e0' : 'transparent',
              border: `1px solid ${question.status === 'unanswered' ? '#fbbc04' : '#dadce0'}`,
              color: '#b06000',
              opacity: question.status === 'unanswered' ? 0.7 : 1,
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { if (question.status !== 'unanswered') e.currentTarget.style.background = '#fef7e0'; }}
            onMouseLeave={e => { if (question.status !== 'unanswered') e.currentTarget.style.background = 'transparent'; }}
          >
            Pending
          </button>
          <button
            onClick={() => onUpdateStatus(question.id, 'needs-clarification')}
            disabled={question.status === 'needs-clarification'}
            style={{
              padding: '5px 14px', borderRadius: 16,
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
              fontSize: 13, fontWeight: 500, cursor: question.status === 'needs-clarification' ? 'default' : 'pointer',
              background: question.status === 'needs-clarification' ? '#fce8e6' : 'transparent',
              border: `1px solid ${question.status === 'needs-clarification' ? '#ea4335' : '#dadce0'}`,
              color: '#c5221f',
              opacity: question.status === 'needs-clarification' ? 0.7 : 1,
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { if (question.status !== 'needs-clarification') e.currentTarget.style.background = '#fce8e6'; }}
            onMouseLeave={e => { if (question.status !== 'needs-clarification') e.currentTarget.style.background = 'transparent'; }}
          >
            Draft
          </button>
        </div>
      )}

      {/* ── Reply box ── */}
      <div style={{
        padding: '12px 28px 20px',
        flexShrink: 0,
        background: '#f6f8fc',
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
