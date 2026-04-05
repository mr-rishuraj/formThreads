import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isNew?: boolean;
}

const AVATAR_COLORS = ['#1a1a1a','#2e2e2e','#3a3a3a','#484848','#222222','#333333'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isNew = false }) => {
  const isCreator = message.role === 'creator';

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 8,
        border: `1px solid ${isNew ? "rgba(255,255,255,0.25)" : '#e0e0e0'}`,
        padding: '14px 18px',
        display: 'flex', gap: 14, alignItems: 'flex-start',
        boxShadow: isNew ? '0 1px 6px rgba(0,0,0,0.12)' : 'none',
        animation: isNew ? 'gmailFadeUp 0.2s ease forwards' : 'none',
      }}
    >
      {/* Circular avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: avatarColor(message.senderName),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
        fontSize: 15, fontWeight: 500, flexShrink: 0,
        userSelect: 'none',
      }}>
        {message.senderInitial}
      </div>

      {/* Content */}
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
              {message.senderName}
            </span>
            {isCreator && (
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
            {message.timestamp}
          </span>
        </div>
        <p style={{
          fontFamily: 'Roboto, Arial, sans-serif',
          fontSize: 14, color: '#3c4043',
          lineHeight: 1.6, margin: 0,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {message.content}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
