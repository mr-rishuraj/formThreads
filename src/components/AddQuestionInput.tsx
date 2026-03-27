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
    // Let DOM update before focusing
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancel = () => {
    setIsOpen(false);
    setValue('');
  };

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

  // Collapsed state — a subtle "+ Add question" button
  if (!isOpen) {
    return (
      <button
        onClick={open}
        className="
          w-full px-4 py-2.5 flex items-center gap-2
          text-zinc-700 hover:text-zinc-400
          hover:bg-zinc-900/40
          border-t border-zinc-800/60
          transition-colors duration-100 group
        "
      >
        <span className="font-mono text-[10px] leading-none group-hover:text-amber-400 transition-colors duration-100">+</span>
        <span className="font-mono text-[9px]">Add question</span>
      </button>
    );
  }

  // Expanded state — inline input
  return (
    <div className="border-t border-zinc-800/60 bg-zinc-900/40 px-3.5 py-2.5">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Question title…"
        className="
          w-full bg-zinc-800 border border-zinc-700 rounded-sm
          px-2.5 py-1.5 text-[11.5px] text-zinc-100 placeholder-zinc-600
          outline-none focus:border-zinc-500 transition-colors duration-100
          font-sans
        "
      />
      <div className="flex items-center justify-between mt-2">
        <span className="font-mono text-[9px] text-zinc-700">Enter to add · Esc to cancel</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={cancel}
            className="px-2 py-1 font-mono text-[9px] text-zinc-500 hover:text-zinc-300 border border-zinc-700 hover:border-zinc-600 rounded-sm transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!value.trim()}
            className={`
              px-2 py-1 font-mono text-[9px] font-semibold rounded-sm transition-all duration-100
              ${value.trim()
                ? 'bg-amber-400 text-black hover:bg-amber-300 active:scale-[.97]'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }
            `}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionInput;
