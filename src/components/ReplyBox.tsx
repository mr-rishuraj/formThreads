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
      border: `2px solid ${isFocused ? 'var(--accent)' : 'var(--border-mid)'}`,
      background: 'var(--bg-elevated)',
      boxShadow: isFocused
        ? '4px 4px 0 var(--accent-dim)'
        : '3px 3px 0 rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>
      {/* Replying-as row */}
      <div style={{
        padding: '10px 14px 6px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {/* Square pixel mini-avatar */}
        <div style={{
          width: 20, height: 20,
          background: 'var(--bg-hover)',
          border: '1px solid var(--border-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'VT323', monospace", fontSize: 12,
          color: 'var(--text-tertiary)', flexShrink: 0,
        }}>
          {respondentInitial}
        </div>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)' }}>
          Replying as <span style={{ color: 'var(--text-secondary)' }}>{respondentName}</span>
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
          fontFamily: "'VT323', monospace",
          fontSize: 18, color: 'var(--text-primary)',
          resize: 'none', minHeight: 68, maxHeight: 160,
          lineHeight: 1.5,
          opacity: sending ? 0.5 : 1,
        }}
      />

      {/* Footer toolbar */}
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
          disabled={!canSend}
          className="pixel-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 16px',
            border: `2px solid ${canSend ? 'var(--accent)' : 'var(--border-subtle)'}`,
            background: canSend ? 'var(--accent)' : 'var(--bg-hover)',
            color: canSend ? 'white' : 'var(--text-muted)',
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            cursor: canSend ? 'pointer' : 'not-allowed',
            boxShadow: canSend ? '3px 3px 0 rgba(0,0,0,0.4)' : 'none',
            opacity: sending ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (canSend) {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.5)';
            }
          }}
          onMouseLeave={e => {
            if (canSend) {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.4)';
            }
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
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 6h9M6.5 2L10.5 6L6.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;
