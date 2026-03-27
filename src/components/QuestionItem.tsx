import React from 'react';
import { Question } from '../types';

interface QuestionItemProps {
  question: Question;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_CONFIG = {
  answered: {
    label: 'Answered',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-500',
  },
  unanswered: {
    label: 'Awaiting',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-400',
  },
  'needs-clarification': {
    label: 'Follow-up',
    dotColor: 'bg-rose-400',
    textColor: 'text-rose-400',
  },
} as const;

const QuestionItem: React.FC<QuestionItemProps> = ({ question, isSelected, onClick }) => {
  const status = STATUS_CONFIG[question.status];
  const lastMessage = question.messages[question.messages.length - 1];
  const preview = lastMessage?.content ?? '';
  const previewTrimmed = preview.length > 70 ? preview.slice(0, 70) + '…' : preview;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 border-b border-zinc-800/60 border-l-2
        transition-all duration-100 relative
        ${isSelected
          ? 'bg-zinc-800/80 border-l-amber-400'
          : 'bg-transparent border-l-transparent hover:bg-zinc-900/60'
        }
      `}
    >
      {/* Unread dot */}
      {question.unread && !isSelected && (
        <span className="absolute left-[5px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-400" />
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <p
          className={`
            text-[11.5px] font-medium leading-snug line-clamp-2 text-left
            ${question.unread && !isSelected ? 'text-zinc-100' : isSelected ? 'text-zinc-100' : 'text-zinc-300'}
          `}
        >
          {question.title}
        </p>
        <span className="font-mono text-[9px] text-zinc-600 whitespace-nowrap flex-shrink-0 mt-0.5">
          {question.lastActivity}
        </span>
      </div>

      {/* Preview */}
      <p className="font-mono text-[9px] text-zinc-700 mt-1 truncate text-left">
        {previewTrimmed}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className={`flex items-center gap-1 font-mono text-[9px] ${status.textColor}`}>
          <span className={`inline-block w-[5px] h-[5px] rounded-full ${status.dotColor}`} />
          {status.label}
        </span>
        <span className="font-mono text-[9px] text-zinc-700">
          · {question.messages.length} msg
        </span>
      </div>
    </button>
  );
};

export default QuestionItem;
