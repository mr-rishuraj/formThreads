import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface CreateFormModalProps {
  // icon is passed back so App.tsx / useFormThread can use it
  onConfirm: (name: string, respondentName: string, respondentEmail: string, icon: string) => void;
  onClose: () => void;
}

const ICONS = ['◈', '◉', '◎', '▣', '◆', '⬡', '⬟', '◐'];

const CreateFormModal: React.FC<CreateFormModalProps> = ({ onConfirm, onClose }) => {
  const [name, setName] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [iconIndex, setIconIndex] = useState(0);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  // Focus name field on mount
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedRespondent = respondentName.trim();

    if (!trimmedName) {
      setError('Form name is required.');
      nameRef.current?.focus();
      return;
    }
    if (!trimmedRespondent) {
      setError('Respondent name is required.');
      return;
    }

    onConfirm(trimmedName, trimmedRespondent, respondentEmail.trim(), ICONS[iconIndex]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div className="w-[400px] bg-zinc-900 border border-zinc-700 rounded-sm shadow-2xl">

        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-zinc-100">Create form</h2>
            <p className="font-mono text-[9px] text-zinc-600 mt-0.5">New conversational form</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 font-mono text-[14px] leading-none transition-colors duration-100 w-6 h-6 flex items-center justify-center rounded-sm hover:bg-zinc-800"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Icon picker */}
          <div>
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-[.1em] block mb-2">
              Icon
            </label>
            <div className="flex gap-1.5">
              {ICONS.map((icon, i) => (
                <button
                  key={icon}
                  onClick={() => setIconIndex(i)}
                  className={`
                    w-7 h-7 flex items-center justify-center text-[13px] rounded-sm border transition-all duration-100
                    ${iconIndex === i
                      ? 'border-amber-400/60 bg-amber-400/10 text-amber-400'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Form name */}
          <div>
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-[.1em] block mb-1.5">
              Form name <span className="text-rose-400">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Series A Due Diligence"
              className="
                w-full bg-zinc-800 border border-zinc-700 rounded-sm
                px-3 py-2 text-[12.5px] text-zinc-100 placeholder-zinc-600
                outline-none focus:border-zinc-500 transition-colors duration-100
                font-sans
              "
            />
          </div>

          {/* Respondent name */}
          <div>
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-[.1em] block mb-1.5">
              Respondent name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={respondentName}
              onChange={(e) => { setRespondentName(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Arjun Mehta"
              className="
                w-full bg-zinc-800 border border-zinc-700 rounded-sm
                px-3 py-2 text-[12.5px] text-zinc-100 placeholder-zinc-600
                outline-none focus:border-zinc-500 transition-colors duration-100
                font-sans
              "
            />
          </div>

          {/* Respondent email */}
          <div>
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-[.1em] block mb-1.5">
              Respondent email
            </label>
            <input
              type="email"
              value={respondentEmail}
              onChange={(e) => setRespondentEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. arjun@company.com"
              className="
                w-full bg-zinc-800 border border-zinc-700 rounded-sm
                px-3 py-2 text-[12.5px] text-zinc-100 placeholder-zinc-600
                outline-none focus:border-zinc-500 transition-colors duration-100
                font-sans
              "
            />
          </div>

          {/* Error */}
          {error && (
            <p className="font-mono text-[9px] text-rose-400">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-800 flex items-center justify-between">
          <span className="font-mono text-[9px] text-zinc-700">Esc to cancel</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 font-mono text-[10px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 rounded-sm transition-colors duration-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-3.5 py-1.5 font-mono text-[10px] font-semibold bg-amber-400 text-black hover:bg-amber-300 rounded-sm transition-colors duration-100 active:scale-[.97]"
            >
              Create form
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateFormModal;
