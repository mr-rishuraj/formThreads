import React, { useEffect, useRef, useState } from 'react';
import type { TeamQuestion, TeamMessage } from '../types';

interface ParticipantThreadProps {
  question: TeamQuestion | null;
  messages: TeamMessage[];
  loading: boolean;
  onSend: (content: string) => Promise<void>;
  teamName: string;
}

const STATUS_CONFIG = {
  pending:   { label: 'Not Yet Open', bg: 'rgba(255,215,0,0.07)',  text: 'var(--status-wait)', border: 'rgba(255,215,0,0.3)',  dot: 'var(--status-wait)' },
  completed: { label: 'Completed',    bg: 'rgba(0,255,159,0.07)',  text: 'var(--status-done)', border: 'rgba(0,255,159,0.3)',  dot: 'var(--status-done)' },
  draft:     { label: 'In Progress',  bg: 'rgba(255,68,102,0.07)', text: 'var(--status-flag)', border: 'rgba(255,68,102,0.3)', dot: 'var(--status-flag)' },
} as const;

const ParticipantThread: React.FC<ParticipantThreadProps> = ({
  question, messages, loading, onSend, teamName,
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
      setValue(trimmed); // restore on failure
      console.error('Send failed:', e?.message ?? e);
      alert('Failed to send: ' + (e?.message ?? 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!question) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, margin: '0 auto 14px',
            background: 'var(--bg-elevated)', border: '2px solid var(--border-mid)',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 10h10M4 14h13M4 18h8" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </div>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--text-secondary)', margin: 0 }}>Select a question</p>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[question.status];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{ fontFamily: "'VT323', monospace", fontSize: 22, fontWeight: 400, margin: 0, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {question.title}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)' }}>
              {messages.length} messages
            </span>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px',
          background: status.bg, border: `1px solid ${status.border}`,
          boxShadow: '2px 2px 0 rgba(0,0,0,0.3)', flexShrink: 0,
        }}>
          <span style={{ width: 6, height: 6, background: status.dot, display: 'inline-block', boxShadow: `0 0 5px ${status.dot}` }} />
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: status.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Context card */}
      {question.description && (
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)', flexShrink: 0,
        }}>
          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)', padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{
                width: 18, height: 18, background: 'var(--accent-soft)', border: '1px solid var(--accent-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v5M5 8.5v.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="square"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Context
              </span>
            </div>
            <p style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {question.description}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6 }}>
            {[0,1,2].map(i => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 42, color: 'var(--text-muted)', marginBottom: 8 }}>[ ]</div>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                No messages yet
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="divider-label">thread start</div>
            {messages.map((m, i) => {
              const isAdmin = m.sender === 'admin';
              return (
                <div
                  key={m.id}
                  className={i === messages.length - 1 ? 'animate-fade-up' : ''}
                  style={{
                    display: 'flex',
                    justifyContent: isAdmin ? 'flex-start' : 'flex-end',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '72%', flexDirection: isAdmin ? 'row' : 'row-reverse' }}>
                    <div style={{
                      width: 28, height: 28, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'VT323', monospace", fontSize: 13,
                      background: isAdmin ? 'var(--accent)' : 'var(--bg-elevated)',
                      border: `2px solid ${isAdmin ? 'var(--accent)' : 'var(--border-mid)'}`,
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.4)',
                      color: isAdmin ? 'white' : 'var(--text-secondary)',
                    }}>
                      {m.senderInitial}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: isAdmin ? 'flex-start' : 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isAdmin ? 'row' : 'row-reverse' }}>
                        <span style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-secondary)' }}>{m.senderName}</span>
                        <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(m.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                      <div style={{
                        padding: '10px 14px', fontSize: 17, lineHeight: 1.5,
                        fontFamily: "'VT323', monospace",
                        background: isAdmin ? 'var(--bg-elevated)' : 'var(--bg-active)',
                        border: `1px solid ${isAdmin ? 'var(--border-mid)' : 'var(--border-mid)'}`,
                        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                        color: isAdmin ? 'var(--text-secondary)' : 'var(--text-primary)',
                        wordBreak: 'break-word',
                      }}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* Reply box */}
      <div style={{ padding: '12px 24px 18px', flexShrink: 0, borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{
          border: `2px solid ${focused ? 'var(--accent)' : 'var(--border-mid)'}`,
          background: 'var(--bg-elevated)',
          boxShadow: focused ? '4px 4px 0 var(--accent-dim)' : '3px 3px 0 rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 14px 6px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 20, height: 20, background: 'var(--bg-hover)', border: '1px solid var(--border-mid)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'VT323', monospace", fontSize: 12, color: 'var(--text-tertiary)',
            }}>
              {teamName[0]?.toUpperCase() ?? 'T'}
            </div>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)' }}>
              Replying as <span style={{ color: 'var(--text-secondary)' }}>{teamName}</span>
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onInput={() => {
              const el = textareaRef.current;
              if (!el) return;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 160) + 'px';
            }}
            placeholder="Write your reply…"
            rows={3}
            disabled={sending}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              padding: '10px 14px', fontFamily: "'VT323', monospace", fontSize: 18,
              color: 'var(--text-primary)', resize: 'none', minHeight: 68, maxHeight: 160,
              lineHeight: 1.5, opacity: sending ? 0.5 : 1,
            }}
          />
          <div style={{
            padding: '8px 12px 10px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)' }}>
              {sending ? 'Sending…' : '⌘↵ send'}
            </span>
            <button
              onClick={handleSend}
              disabled={!value.trim() || sending}
              className="pixel-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px',
                border: `2px solid ${value.trim() && !sending ? 'var(--accent)' : 'var(--border-subtle)'}`,
                background: value.trim() && !sending ? 'var(--accent)' : 'var(--bg-hover)',
                color: value.trim() && !sending ? 'white' : 'var(--text-muted)',
                fontFamily: "'VT323', monospace", fontSize: 16,
                cursor: value.trim() && !sending ? 'pointer' : 'not-allowed',
                boxShadow: value.trim() ? '3px 3px 0 rgba(0,0,0,0.4)' : 'none',
              }}
            >
              Send Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantThread;
