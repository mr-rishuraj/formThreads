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
      className={`
        flex gap-2.5
        ${isCreator ? 'flex-row' : 'flex-row-reverse'}
        ${isNew ? 'animate-fade-up' : ''}
      `}
    >
      {/* Avatar */}
      <div
        className={`
          w-[26px] h-[26px] flex-shrink-0 rounded-sm
          flex items-center justify-center
          font-mono text-[10px] font-bold mt-0.5
          ${isCreator ? 'bg-amber-400 text-black' : 'bg-zinc-700 text-zinc-200'}
        `}
      >
        {message.senderInitial}
      </div>

      {/* Content */}
      <div className={`max-w-[76%] flex flex-col gap-1 ${isCreator ? '' : 'items-end'}`}>
        {/* Sender + timestamp */}
        <div className={`flex items-center gap-2 ${isCreator ? '' : 'flex-row-reverse'}`}>
          <span className="text-[11px] font-medium text-zinc-400">{message.senderName}</span>
          <span className="font-mono text-[9px] text-zinc-600">{message.timestamp}</span>
        </div>

        {/* Bubble */}
        <div
          className={`
            px-4 py-3 text-[12.5px] leading-[1.7] rounded-sm
            ${isCreator
              ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
              : 'bg-zinc-800/70 border border-zinc-700/50 text-zinc-200 rounded-tr-none'
            }
          `}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
