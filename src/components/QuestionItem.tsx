import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionItemProps {
  question: Question;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_CONFIG = {
  answered: { label: 'Done', dot: '#34d399', text: '#34d399', icon: '✓' },
  unanswered: { label: 'Awaiting', dot: '#f59e0b', text: '#f59e0b', icon: '○' },
  'needs-clarification': { label: 'Follow-up', dot: '#f87171', text: '#f87171', icon: '!' },
} as const;

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
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        borderLeft: `3px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
        background: isSelected ? 'var(--bg-active)' : hovered ? 'var(--bg-hover)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        position: 'relative',
        display: 'block',
        border: 'none',
        // borderBottom: '1px solid var(--border-subtle)',
        // borderLeft: `3px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
      }}
    >
      {/* Unread indicator */}
      {question.unread && !isSelected && (
        <div style={{
          position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
          width: 5, height: 5, borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 5px var(--accent-glow)',
        }} />
      )}

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <p style={{
          fontSize: 12,
          fontWeight: (question.unread && !isSelected) ? 600 : 500,
          color: isSelected || (question.unread && !isSelected) ? 'var(--text-primary)' : 'var(--text-secondary)',
          lineHeight: 1.4, margin: 0,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          transition: 'color 0.12s',
        }}>
          {question.title}
        </p>
        <span style={{
          fontFamily: "'Fira Code', monospace", fontSize: 9,
          color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0,
          marginTop: 1,
        }}>
          {question.lastActivity}
        </span>
      </div>

      {/* Message preview */}
      {previewTrimmed && (
        <p style={{
          fontFamily: "'Fira Code', monospace", fontSize: 10,
          color: 'var(--text-tertiary)', margin: '0 0 7px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {previewTrimmed}
        </p>
      )}

      {/* Status + count row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: status.dot, flexShrink: 0, display: 'inline-block',
            boxShadow: isSelected ? `0 0 6px ${status.dot}80` : 'none',
          }} />
          <span style={{
            fontFamily: "'Fira Code', monospace", fontSize: 9,
            color: status.text,
          }}>{status.label}</span>
        </div>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
          {question.messages.length} msg
        </span>
      </div>
    </button>
  );
};

export default QuestionItem;
