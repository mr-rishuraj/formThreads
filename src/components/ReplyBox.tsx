import React, { useState, useRef, KeyboardEvent } from 'react';

interface ReplyBoxProps {
  onSend: (content: string) => void;
  respondentName: string;
  respondentInitial: string;
}

const ReplyBox: React.FC<ReplyBoxProps> = ({ onSend, respondentName, respondentInitial }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
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

  return (
    <div
      className={`
        border rounded-sm bg-zinc-900/80 transition-all duration-150
        ${isFocused ? 'border-zinc-600' : 'border-zinc-700/60'}
      `}
    >
      {/* Replying-as row */}
      <div className="px-3.5 pt-2.5 pb-1 flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-zinc-700 flex items-center justify-center font-mono text-[8px] text-zinc-300 font-bold flex-shrink-0">
          {respondentInitial}
        </div>
        <p className="font-mono text-[9px] text-zinc-600">
          Replying as <span className="text-zinc-400">{respondentName}</span>
        </p>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Write your reply..."
        rows={3}
        className="
          w-full bg-transparent border-none outline-none
          px-3.5 py-1.5
          font-sans text-[12.5px] text-zinc-200 placeholder-zinc-700
          resize-none min-h-[68px] max-h-40 leading-[1.65]
        "
      />

      {/* Footer */}
      <div className="px-3.5 pb-2.5 flex items-center justify-between">
        <span className="font-mono text-[9px] text-zinc-700">⌘ + Enter to send</span>
        <button
          onClick={handleSend}
          disabled={!value.trim()}
          className={`
            px-3.5 py-1.5 font-mono text-[10px] font-semibold rounded-sm
            transition-all duration-100
            ${value.trim()
              ? 'bg-amber-400 text-black hover:bg-amber-300 active:scale-[.97]'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }
          `}
        >
          Send Reply
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;
