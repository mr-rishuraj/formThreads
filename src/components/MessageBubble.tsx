import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isNew?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isNew = false }) => {
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
          {/* Square pixel avatar */}
          <div style={{
            width: 28, height: 28, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'VT323', monospace", fontSize: 14, fontWeight: 600,
            background: 'var(--accent)',
            border: '2px solid var(--accent)',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
            color: 'white',
          }}>
            {message.senderInitial}
          </div>

          {/* Bubble + meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-secondary)' }}>
                {message.senderName}
              </span>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)' }}>
                {message.timestamp}
              </span>
            </div>
            <div style={{
              padding: '10px 14px',
              fontSize: 17, lineHeight: 1.5,
              fontFamily: "'VT323', monospace",
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-mid)',
              boxShadow: isNew
                ? '3px 3px 0 var(--accent-dim)'
                : '2px 2px 0 rgba(0,0,0,0.3)',
              color: 'var(--text-secondary)',
              wordBreak: 'break-word',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row-reverse' }}>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: 'var(--text-secondary)' }}>
                {message.senderName}
              </span>
              <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)' }}>
                {message.timestamp}
              </span>
            </div>
            <div style={{
              padding: '10px 14px',
              fontSize: 17, lineHeight: 1.5,
              fontFamily: "'VT323', monospace",
              background: 'var(--bg-active)',
              border: `1px solid ${isNew ? 'var(--accent)' : 'var(--border-mid)'}`,
              boxShadow: isNew
                ? '3px 3px 0 var(--accent-dim)'
                : '2px 2px 0 rgba(0,0,0,0.3)',
              color: 'var(--text-primary)',
              wordBreak: 'break-word',
            }}>
              {message.content}
            </div>
          </div>

          {/* Square pixel avatar */}
          <div style={{
            width: 28, height: 28, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'VT323', monospace", fontSize: 14, fontWeight: 600,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-mid)',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
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
