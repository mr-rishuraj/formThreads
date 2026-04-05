import React, { useState, useRef, KeyboardEvent } from 'react';

interface AddQuestionInputProps {
  onAdd: (title: string) => void;
}

const AddQuestionInput: React.FC<AddQuestionInputProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancel = () => { setIsOpen(false); setValue(''); };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') cancel();
  };

  if (!isOpen) {
    return (
      <button
        onClick={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px',
          background: 'none', border: 'none',
          borderTop: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'var(--bg-hover)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'none';
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: 5,
          border: '1px dashed var(--border-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, lineHeight: 1, flexShrink: 0,
          transition: 'border-color 0.15s',
        }}>+</div>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10 }}>
          Add question
        </span>
      </button>
    );
  }

  return (
    <div className="animate-fade-in" style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: '12px 14px',
      background: 'var(--bg-hover)',
    }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Question title…"
        style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--accent-dim)',
          borderRadius: 7,
          padding: '8px 10px',
          fontSize: 12,
          color: 'var(--text-primary)',
          outline: 'none',
          fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 0 0 3px var(--accent-soft)',
          letterSpacing: '-0.01em',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
          ↵ add · Esc cancel
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={cancel}
            style={{
              padding: '5px 10px',
              fontFamily: "'Fira Code', monospace", fontSize: 9,
              color: 'var(--text-tertiary)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
              borderRadius: 6, cursor: 'pointer', transition: 'all 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!value.trim()}
            style={{
              padding: '5px 12px',
              fontFamily: "'Fira Code', monospace", fontSize: 9, fontWeight: 600,
              color: value.trim() ? 'white' : 'var(--text-muted)',
              background: value.trim() ? '#1a1a1a' : 'var(--bg-elevated)',
              border: 'none', borderRadius: 6,
              cursor: value.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.12s',
              boxShadow: value.trim() ? '0 1px 6px var(--accent-glow)' : 'none',
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionInput;
