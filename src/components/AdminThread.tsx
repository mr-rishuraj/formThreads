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
  pending:   { label: 'Not Seen', bg: '#f1f1f1', color: '#555555' },
  completed: { label: 'Sent',     bg: '#e8e8e8', color: '#1a1a1a' },
  draft:     { label: 'Draft',    bg: '#f5f5f5', color: '#333333' },
} as const;

const STATUSES: TeamQuestionStatus[] = ['draft', 'pending', 'completed'];

/* ── Avatar helpers ─────────────────────────────────────────── */
const AVATAR_COLORS = ['#1a1a1a','#2e2e2e','#3a3a3a','#484848','#222222','#333333'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: avatarColor(name),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
    fontSize: size * 0.44, fontWeight: 500, flexShrink: 0, userSelect: 'none',
  }}>
    {name[0]?.toUpperCase() ?? '?'}
  </div>
);

/* ── SVG icons ──────────────────────────────────────────────── */
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
  </svg>
);
const IconReply = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" fill="currentColor"/>
  </svg>
);
const IconAttach = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S6 2.79 6 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" fill="currentColor"/>
  </svg>
);
const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/>
  </svg>
);
const IconEmoji = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor"/>
  </svg>
);
const IconMore = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
  </svg>
);

/* ── AdminThread ─────────────────────────────────────────────── */
const AdminThread: React.FC<AdminThreadProps> = ({
  question, messages, loading, onSend, onUpdateStatus, onEditQuestion,
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
      alert('Failed to send: ' + (e?.message ?? 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  /* ── Empty state ── */
  if (!question) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f6f8fc',
      }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16 }}>
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  fill="#dadce0"/>
          </svg>
          <p style={{
            fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
            fontSize: 16, color: '#5f6368', margin: 0,
          }}>
            Select a question to view the thread
          </p>
        </div>
      </div>
    );
  }

  const st = STATUS_CONFIG[question.status];
  const canSend = value.trim().length > 0 && !sending;
  const iconColor = '#444746';

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
      background: '#f6f8fc', fontFamily: 'Roboto, Arial, sans-serif',
    }}>

      {/* ── Subject header ── */}
      <div style={{ padding: '20px 28px 12px', background: '#f6f8fc', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <h2 style={{
            fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
            fontSize: 22, fontWeight: 400, margin: 0,
            color: '#202124', lineHeight: 1.35, flex: 1,
          }}>
            {question.title}
          </h2>
          <span style={{
            flexShrink: 0, padding: '4px 10px', borderRadius: 4,
            fontSize: 12, fontWeight: 500,
            background: st.bg, color: st.color,
          }}>
            {st.label}
          </span>
        </div>
        <p style={{ margin: '5px 0 0', fontSize: 13, color: '#5f6368' }}>
          {messages.length} {messages.length === 1 ? 'message' : 'messages'} in thread
        </p>
      </div>

      {/* ── Context card ── */}
      {question.description && (
        <div style={{ padding: '0 28px 16px', flexShrink: 0 }}>
          <div style={{
            background: '#ffffff', borderRadius: 8,
            border: '1px solid #e0e0e0', padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#5f6368"/>
              </svg>
              <span style={{
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                fontSize: 12, fontWeight: 500, color: '#5f6368',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Context
              </span>
            </div>
            <p style={{
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: 14, color: '#3c4043', lineHeight: 1.6, margin: 0,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {question.description}
            </p>
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '0 28px 12px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, gap: 8 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
            <p style={{ fontFamily: 'Roboto, Arial, sans-serif', fontSize: 14, color: '#80868b', margin: 0 }}>
              No replies yet
            </p>
          </div>
        ) : (
          <>
            {/* Thread divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
              <span style={{ fontSize: 12, color: '#80868b', whiteSpace: 'nowrap' }}>
                {messages.length} {messages.length === 1 ? 'reply' : 'replies'}
              </span>
              <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
            </div>

            {messages.map((m, i) => {
              const isAdminMsg = m.sender === 'admin';
              const time = new Date(m.createdAt).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
              });
              return (
                <div
                  key={m.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 8,
                    border: `1px solid ${i === messages.length - 1 ? 'rgba(255,255,255,0.25)' : '#e0e0e0'}`,
                    padding: '14px 18px',
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    boxShadow: i === messages.length - 1 ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <Avatar name={m.senderName} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'baseline',
                      justifyContent: 'space-between', marginBottom: 4,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                          fontWeight: 600, fontSize: 14, color: '#202124',
                        }}>
                          {m.senderName}
                        </span>
                        {isAdminMsg && (
                          <span style={{
                            fontSize: 11, fontWeight: 500,
                            color: '#ffffff', background: '#333333',
                            borderRadius: 4, padding: '1px 6px',
                          }}>
                            Admin
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontFamily: 'Roboto, Arial, sans-serif',
                        fontSize: 12, color: '#5f6368',
                        whiteSpace: 'nowrap', marginLeft: 8,
                      }}>
                        {time}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: 'Roboto, Arial, sans-serif',
                      fontSize: 14, color: '#3c4043',
                      lineHeight: 1.6, margin: 0,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                      {m.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Status controls ── */}
      <div style={{
        padding: '10px 28px',
        borderTop: '1px solid #e0e0e0',
        background: '#ffffff', flexShrink: 0,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'Roboto, Arial, sans-serif',
          fontSize: 12, color: '#5f6368', fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4,
        }}>
          Mark as:
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
                padding: '5px 14px', borderRadius: 16,
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                fontSize: 13, fontWeight: 500,
                cursor: active ? 'default' : 'pointer',
                background: active ? cfg.bg : 'transparent',
                border: `1px solid ${active ? cfg.color : '#dadce0'}`,
                color: cfg.color,
                opacity: active ? 0.7 : 1,
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = cfg.bg; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* ── Reply box ── */}
      <div style={{ padding: '12px 28px 20px', flexShrink: 0, background: '#f6f8fc' }}>
        <div style={{
          border: `1px solid ${focused ? 'rgba(255,255,255,0.25)' : '#e0e0e0'}`,
          borderRadius: 12,
          background: '#ffffff',
          boxShadow: focused
            ? '0 2px 10px rgba(0,0,0,0.15)'
            : '0 1px 4px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s, border-color 0.2s',
        }}>
          {/* To: row */}
          <div style={{
            padding: '10px 16px 8px',
            borderBottom: '1px solid #f1f3f4',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <IconReply />
            <span style={{ color: '#5f6368', fontFamily: 'Roboto, Arial, sans-serif', fontSize: 13 }}>
              Replying as
            </span>
            <span style={{
              background: '#f1f3f4', borderRadius: 4,
              padding: '2px 8px', color: '#202124',
              fontFamily: 'Roboto, Arial, sans-serif', fontSize: 13, fontWeight: 500,
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
            rows={4}
            disabled={sending}
            style={{
              width: '100%', border: 'none', outline: 'none',
              padding: '14px 16px',
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: 14, color: '#202124',
              resize: 'none', minHeight: 90, maxHeight: 200,
              lineHeight: 1.6, background: 'transparent',
              opacity: sending ? 0.5 : 1,
            }}
          />

          {/* Toolbar */}
          <div style={{
            padding: '8px 12px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
            borderTop: '1px solid #f1f3f4',
          }}>
            <button
              onClick={handleSend}
              disabled={!canSend}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 18px', borderRadius: 20,
                background: canSend ? '#111111' : '#888888',
                color: 'white', border: 'none',
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                fontWeight: 500, fontSize: 14,
                cursor: canSend ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => { if (canSend) e.currentTarget.style.background = '#000000'; }}
              onMouseLeave={e => { if (canSend) e.currentTarget.style.background = '#111111'; }}
            >
              {sending ? 'Sending…' : <><IconSend /> Send</>}
            </button>

            <div style={{ width: 8 }} />

            {[IconAttach, IconLink, IconEmoji, IconMore].map((Icon, i) => (
              <button key={i} style={{
                background: 'none', border: 'none', padding: '6px',
                borderRadius: '50%', cursor: 'pointer', color: iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Icon />
              </button>
            ))}

            <button style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              padding: '6px', borderRadius: '50%', cursor: 'pointer',
              color: iconColor, display: 'flex', alignItems: 'center',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <IconTrash />
            </button>

            <span style={{
              fontFamily: 'Roboto, Arial, sans-serif', fontSize: 11,
              color: '#80868b', marginLeft: 6, whiteSpace: 'nowrap',
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
