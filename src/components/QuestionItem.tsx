import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionItemProps {
  question: Question;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_CONFIG = {
  answered:             { label: 'CLEARED',  bar: 'var(--status-done)', text: 'var(--status-done)', bars: 3 },
  unanswered:           { label: 'PENDING',  bar: 'var(--status-wait)', text: 'var(--status-wait)', bars: 0 },
  'needs-clarification':{ label: 'FLAGGED',  bar: 'var(--status-flag)', text: 'var(--status-flag)', bars: 1 },
} as const;

// ── Mini HP bar ────────────────────────────────────────────────
const HpBar: React.FC<{ filled: number; total?: number; color: string }> = ({ filled, total = 3, color }) => (
  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        width: 7, height: 7,
        background: i < filled ? color : 'var(--bg-elevated)',
        border: `1px solid ${i < filled ? color : 'var(--border-mid)'}`,
        boxShadow: i < filled ? `0 0 3px ${color}60` : 'none',
      }} />
    ))}
  </div>
);

const QuestionItem: React.FC<QuestionItemProps> = ({ question, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const status = STATUS_CONFIG[question.status];
  const lastMessage = question.messages[question.messages.length - 1];
  const preview = lastMessage?.content ?? '';
  const previewTrimmed = preview.length > 65 ? preview.slice(0, 65) + '…' : preview;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left',
        padding: '11px 16px',
        cursor: 'pointer',
        position: 'relative',
        display: 'block',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: '1px solid var(--border-subtle)',
        borderLeft: `3px solid ${isSelected ? 'var(--accent)' : question.status === 'answered' ? 'var(--status-done)' : 'transparent'}`,
        background: isSelected ? 'var(--bg-active)' : hovered ? 'var(--bg-hover)' : 'transparent',
      }}
    >
      {/* Unread indicator */}
      {question.unread && !isSelected && (
        <div style={{
          position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
          width: 5, height: 5,
          background: 'var(--accent)',
          boxShadow: '0 0 5px var(--accent-glow)',
        }} />
      )}

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <p style={{
          fontSize: 16,
          fontFamily: "'VT323', monospace",
          color: isSelected
            ? 'var(--text-primary)'
            : question.unread
            ? 'var(--text-primary)'
            : 'var(--text-secondary)',
          lineHeight: 1.3, margin: 0,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {question.title}
        </p>
        <span style={{
          fontFamily: "'VT323', monospace", fontSize: 13,
          color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1,
        }}>
          {question.lastActivity}
        </span>
      </div>

      {/* Message preview */}
      {previewTrimmed && (
        <p style={{
          fontFamily: "'VT323', monospace", fontSize: 14,
          color: 'var(--text-tertiary)', margin: '0 0 6px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {previewTrimmed}
        </p>
      )}

      {/* Status row — HP bars + label + msg count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <HpBar filled={status.bars} color={status.bar} />
          <span style={{
            fontFamily: "'VT323', monospace", fontSize: 13,
            color: status.text, letterSpacing: '0.04em',
          }}>{status.label}</span>
        </div>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)' }}>
          {question.messages.length} msg
        </span>
      </div>
    </button>
  );
};

export default QuestionItem;
