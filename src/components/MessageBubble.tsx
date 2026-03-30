import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isNew?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isNew = false }) => {
  // creator = form admin → left side (like received messages in Gmail/iMessage)
  // respondent = participant → right side (like sent messages)
  const isCreator = message.role === 'creator';

  return (
    <div
      className={isNew ? 'animate-fade-up' : ''}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: isCreator ? 'flex-start' : 'flex-end',
        alignItems: 'flex-end',
        gap: 0,
        width: '100%',
      }}
    >
      {/* ── Creator (LEFT) ── */}
      {isCreator && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '72%' }}>
          {/* Avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 600,
            background: 'linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)',
            color: 'white',
            boxShadow: '0 2px 8px var(--accent-glow)',
          }}>
            {message.senderInitial}
          </div>

          {/* Bubble + meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {message.senderName}
              </span>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
                {message.timestamp}
              </span>
            </div>
            <div style={{
              padding: '10px 14px',
              borderRadius: '3px 12px 12px 12px',
              fontSize: 13, lineHeight: 1.65,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-mid)',
              color: 'var(--text-secondary)',
              boxShadow: isNew ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.2)',
              wordBreak: 'break-word',
              letterSpacing: '-0.005em',
            }}>
              {message.content}
            </div>
          </div>
        </div>
      )}

      {/* ── Respondent (RIGHT) ── */}
      {!isCreator && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '72%' }}>
          {/* Bubble + meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: 'row-reverse' }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {message.senderName}
              </span>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
                {message.timestamp}
              </span>
            </div>
            <div style={{
              padding: '10px 14px',
              borderRadius: '12px 3px 12px 12px',
              fontSize: 13, lineHeight: 1.65,
              background: 'var(--bg-active)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              boxShadow: isNew ? '0 2px 12px var(--accent-glow)' : '0 1px 4px rgba(0,0,0,0.2)',
              wordBreak: 'break-word',
              letterSpacing: '-0.005em',
            }}>
              {message.content}
            </div>
          </div>

          {/* Avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 600,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-mid)',
            color: 'var(--text-secondary)',
          }}>
            {message.senderInitial}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
