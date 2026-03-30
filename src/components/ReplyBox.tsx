import React, { useState, useRef, KeyboardEvent } from 'react';

interface ReplyBoxProps {
  onSend: (content: string) => void;
  respondentName: string;
  respondentInitial: string;
}

const ReplyBox: React.FC<ReplyBoxProps> = ({ onSend, respondentName, respondentInitial }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await onSend(trimmed);
    } catch (e) {
      // If send fails, restore the text so user doesn't lose it
      setValue(trimmed);
      console.error('Send failed:', e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const hasContent = value.trim().length > 0;
  const canSend = hasContent && !sending;

  return (
    <div style={{
      border: `1px solid ${isFocused ? 'var(--accent-dim)' : 'var(--border-mid)'}`,
      borderRadius: 12,
      background: 'var(--bg-elevated)',
      transition: 'all 0.2s ease',
      boxShadow: isFocused
        ? '0 0 0 3px var(--accent-soft), 0 4px 16px rgba(0,0,0,0.3)'
        : '0 2px 8px rgba(0,0,0,0.2)',
      overflow: 'hidden',
    }}>
      {/* Replying-as row */}
      <div style={{
        padding: '10px 14px 6px',
        display: 'flex', alignItems: 'center', gap: 7,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: 5,
          background: 'var(--bg-hover)',
          border: '1px solid var(--border-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Fira Code', monospace", fontSize: 8, fontWeight: 600,
          color: 'var(--text-tertiary)', flexShrink: 0,
        }}>
          {respondentInitial}
        </div>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
          Replying as <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{respondentName}</span>
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Write your reply…"
        rows={3}
        disabled={sending}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none', outline: 'none',
          padding: '10px 14px',
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontSize: 13, color: 'var(--text-primary)',
          resize: 'none', minHeight: 68, maxHeight: 160,
          lineHeight: 1.6, letterSpacing: '-0.01em',
          opacity: sending ? 0.5 : 1,
        }}
      />

      {/* Footer toolbar */}
      <div style={{
        padding: '8px 12px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
          {sending ? 'Sending…' : '⌘↵ send'}
        </span>

        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px',
            borderRadius: 8,
            border: 'none',
            background: canSend
              ? 'linear-gradient(135deg, var(--accent) 0%, #8b7cf6 100%)'
              : 'var(--bg-hover)',
            color: canSend ? 'white' : 'var(--text-muted)',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12, fontWeight: 600,
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
            boxShadow: canSend ? '0 2px 8px var(--accent-glow)' : 'none',
            letterSpacing: '-0.01em',
            opacity: sending ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (canSend) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 14px var(--accent-glow)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = canSend ? '0 2px 8px var(--accent-glow)' : 'none';
          }}
        >
          {sending ? (
            <svg width="12" height="12" viewBox="0 0 12 12" className="animate-spin">
              <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
              <path d="M6 1.5A4.5 4.5 0 0110.5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
          ) : (
            <>
              <span>Send Reply</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 6h9M6.5 2L10.5 6L6.5 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;
