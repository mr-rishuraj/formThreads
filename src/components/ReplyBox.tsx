import React, { useState, useRef, KeyboardEvent } from 'react';

interface ReplyBoxProps {
  onSend: (content: string) => void;
  respondentName: string;
  respondentInitial: string;
}

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
  </svg>
);
const IconAttach = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V6H9v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S6 2.79 6 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"
          fill="currentColor"/>
  </svg>
);
const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
          fill="currentColor"/>
  </svg>
);
const IconEmoji = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
          fill="currentColor"/>
  </svg>
);
const IconMore = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
          fill="currentColor"/>
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
          fill="currentColor"/>
  </svg>
);
const IconReply = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" fill="currentColor"/>
  </svg>
);

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
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  const canSend = value.trim().length > 0 && !sending;
  const iconColor = '#444746';

  return (
    <div style={{
      border: `1px solid ${isFocused ? "rgba(255,255,255,0.25)" : '#e0e0e0'}`,
      borderRadius: 12,
      background: '#ffffff',
      boxShadow: isFocused
        ? '0 2px 10px rgba(0,0,0,0.15)'
        : '0 1px 4px rgba(0,0,0,0.10)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {/* To: row */}
      <div style={{
        padding: '10px 16px 8px',
        borderBottom: '1px solid #f1f3f4',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#444746',
          fontFamily: 'Roboto, Arial, sans-serif', fontSize: 13,
        }}>
          <IconReply />
          <span style={{ color: '#5f6368' }}>Reply to</span>
          <span style={{
            background: '#f1f3f4', borderRadius: 4,
            padding: '2px 8px', color: '#202124', fontWeight: 500,
          }}>
            {respondentName}
          </span>
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
        placeholder="Reply…"
        rows={4}
        disabled={sending}
        style={{
          width: '100%',
          border: 'none', outline: 'none',
          padding: '14px 16px',
          fontFamily: 'Roboto, Arial, sans-serif',
          fontSize: 14, color: '#202124',
          resize: 'none', minHeight: 90, maxHeight: 200,
          lineHeight: 1.6,
          background: 'transparent',
          opacity: sending ? 0.5 : 1,
        }}
      />

      {/* Toolbar */}
      <div style={{
        padding: '8px 12px 10px',
        display: 'flex', alignItems: 'center', gap: 4,
        borderTop: '1px solid #f1f3f4',
      }}>
        {/* Send button */}
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
            transition: 'background 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { if (canSend) e.currentTarget.style.background = '#000000'; }}
          onMouseLeave={e => { if (canSend) e.currentTarget.style.background = '#111111'; }}
        >
          {sending ? 'Sending…' : (
            <>
              <IconSend />
              Send
            </>
          )}
        </button>

        <div style={{ width: 8 }} />

        {/* Icon toolbar */}
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

        {/* Trash — push to right */}
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
  );
};

export default ReplyBox;
