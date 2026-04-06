import React, { useEffect, useRef, useState } from 'react';
import type { TeamQuestion, TeamMessage, TeamQuestionStatus } from '../types';

interface AdminThreadProps {
  question: TeamQuestion | null;
  messages: TeamMessage[];
  loading: boolean;
  onSend: (content: string) => Promise<void>;
  onUpdateStatus: (tqId: string, status: TeamQuestionStatus) => Promise<void>;
  onEditQuestion?: (questionId: string, patch: { title?: string; description?: string }) => Promise<void>;
}

const STATUS_CONFIG = {
  pending:   { label: 'Not Seen', color: 'var(--status-wait)',  bg: 'rgba(255,255,255,0.04)' },
  completed: { label: 'Sent',     color: 'var(--status-done)',  bg: 'rgba(255,255,255,0.07)' },
  draft:     { label: 'Draft',    color: 'var(--status-flag)',  bg: 'rgba(255,255,255,0.02)' },
} as const;

const STATUSES: TeamQuestionStatus[] = ['draft', 'pending', 'completed'];

const IconSend = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
  </svg>
);

const AdminThread: React.FC<AdminThreadProps> = ({
  question, messages, loading, onSend, onUpdateStatus,
}) => {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, question?.id]);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      await onSend(trimmed);
    } catch (e: any) {
      setValue(trimmed);
      console.error('Send failed:', e?.message ?? e);
    } finally {
      setSending(false);
    }
  };

  if (!question) {
    return (
      <div style={{
        flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: "'VT323', monospace",
            fontSize: 16, color: 'var(--text-muted)', margin: 0, letterSpacing: '0.08em',
          }}>
            SELECT A QUESTION
          </p>
        </div>
      </div>
    );
  }

  const st = STATUS_CONFIG[question.status];
  const canSend = value.trim().length > 0 && !sending;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      minWidth: 0, minHeight: 0, overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>

      {/* Header */}
      <div style={{
        padding: '14px 20px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <h2 style={{
            fontFamily: "'VT323', monospace",
            fontSize: 20, fontWeight: 400, margin: 0,
            color: 'var(--text-primary)', lineHeight: 1.3, flex: 1,
            letterSpacing: '0.02em', wordBreak: 'break-word', minWidth: 0,
          }}>
            {question.title}
          </h2>
          <span style={{
            flexShrink: 0, padding: '2px 8px',
            fontFamily: "'VT323', monospace", fontSize: 13,
            color: st.color, background: st.bg,
            border: '1px solid var(--border-subtle)',
            letterSpacing: '0.06em',
          }}>
            {st.label}
          </span>
        </div>
        <p style={{
          margin: '4px 0 0',
          fontFamily: "'VT323', monospace", fontSize: 13,
          color: 'var(--text-muted)', letterSpacing: '0.04em',
        }}>
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </p>
      </div>

      {/* Context card */}
      {question.description && (
        <div style={{ padding: '10px 20px 0', flexShrink: 0, minHeight: 0 }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-mid)',
            padding: '10px 14px',
            maxHeight: 160, overflowY: 'auto',
          }}>
            <span style={{
              fontFamily: "'VT323', monospace", fontSize: 11,
              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
              display: 'block', marginBottom: 4,
            }}>
              Context
            </span>
            <p style={{
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {question.description}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: '10px 20px 8px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, gap: 6 }}>
            {[0,1,2].map(i => (
              <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
            <p style={{
              fontFamily: "'VT323', monospace", fontSize: 14,
              color: 'var(--text-muted)', margin: 0, letterSpacing: '0.06em',
            }}>
              NO REPLIES YET
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isAdminMsg = m.sender === 'admin';
            const time = new Date(m.createdAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
            });
            return (
              <div
                key={m.id}
                style={{
                  background: isAdminMsg ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  border: `1px solid ${i === messages.length - 1 ? 'var(--border-mid)' : 'var(--border-subtle)'}`,
                  padding: '10px 14px',
                  borderLeft: `3px solid ${isAdminMsg ? 'var(--text-primary)' : 'var(--border-mid)'}`,
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'baseline',
                  justifyContent: 'space-between', marginBottom: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: "'VT323', monospace", fontSize: 14,
                      color: isAdminMsg ? 'var(--text-primary)' : 'var(--text-secondary)',
                      letterSpacing: '0.04em',
                    }}>
                      {m.senderName}
                    </span>
                    {isAdminMsg && (
                      <span style={{
                        fontFamily: "'VT323', monospace", fontSize: 11,
                        color: 'var(--bg-base)', background: 'var(--text-primary)',
                        padding: '0 5px', letterSpacing: '0.06em',
                      }}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'VT323', monospace", fontSize: 12,
                    color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 8,
                  }}>
                    {time}
                  </span>
                </div>
                <p style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13, color: 'var(--text-secondary)',
                  lineHeight: 1.6, margin: 0,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {m.content}
                </p>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Status controls */}
      <div style={{
        padding: '8px 20px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)', flexShrink: 0,
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'VT323', monospace", fontSize: 12,
          color: 'var(--text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.1em', marginRight: 4,
        }}>
          Mark:
        </span>
        {STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s];
          const active = question.status === s;
          return (
            <button
              key={s}
              onClick={() => !active && onUpdateStatus(question.id, s)}
              disabled={active}
              style={{
                padding: '3px 12px',
                fontFamily: "'VT323', monospace", fontSize: 13,
                cursor: active ? 'default' : 'pointer',
                background: active ? cfg.bg : 'transparent',
                border: `1px solid ${active ? cfg.color : 'var(--border-mid)'}`,
                color: cfg.color,
                letterSpacing: '0.06em',
                opacity: active ? 1 : 0.6,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = cfg.bg; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent'; } }}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Reply box */}
      <div style={{ padding: '10px 20px 16px', flexShrink: 0, background: 'var(--bg-base)' }}>
        <div style={{
          border: `1px solid ${focused ? 'var(--border-strong)' : 'var(--border-mid)'}`,
          background: 'var(--bg-surface)',
          transition: 'border-color 0.15s',
        }}>
          {/* Label row */}
          <div style={{
            padding: '7px 12px 6px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              fontFamily: "'VT323', monospace", fontSize: 12,
              color: 'var(--text-muted)', letterSpacing: '0.06em',
            }}>
              REPLY AS
            </span>
            <span style={{
              fontFamily: "'VT323', monospace", fontSize: 13,
              color: 'var(--text-primary)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-mid)',
              padding: '0 6px',
            }}>
              Admin
            </span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSend(); } }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onInput={() => {
              const el = textareaRef.current;
              if (!el) return;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 200) + 'px';
            }}
            placeholder="Reply…"
            rows={3}
            disabled={sending}
            style={{
              width: '100%', border: 'none', outline: 'none',
              padding: '10px 12px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13, color: 'var(--text-primary)',
              resize: 'none', minHeight: 72, maxHeight: 200, overflowY: 'auto',
              lineHeight: 1.6, background: 'transparent',
              opacity: sending ? 0.5 : 1,
            }}
          />

          {/* Toolbar */}
          <div style={{
            padding: '6px 10px 8px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={canSend ? 'pixel-btn' : ''}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 14px',
                background: canSend ? 'var(--text-primary)' : 'var(--bg-elevated)',
                color: canSend ? 'var(--bg-base)' : 'var(--text-muted)',
                border: `1px solid ${canSend ? 'var(--text-primary)' : 'var(--border-mid)'}`,
                fontFamily: "'VT323', monospace", fontSize: 14,
                letterSpacing: '0.06em',
                cursor: canSend ? 'pointer' : 'not-allowed',
                transition: 'all 0.12s', flexShrink: 0,
              }}
            >
              <IconSend />
              {sending ? 'SENDING…' : 'SEND'}
            </button>

            <span style={{
              fontFamily: "'VT323', monospace", fontSize: 11,
              color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap',
            }}>
              ⌘↵ to send
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminThread;
