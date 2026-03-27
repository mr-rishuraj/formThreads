import React, { useState } from 'react';
import { Form, Question, User } from '../types';

interface SidebarProps {
  forms: Form[];
  allQuestions: Question[];
  selectedFormId: string;
  onSelectForm: (id: string) => void;
  unreadCount: (formId: string) => number;
  user: User;
  onLogout: () => void;
  onCreateForm?: (name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  forms, allQuestions, selectedFormId, onSelectForm, unreadCount, user, onLogout, onCreateForm,
}) => {
  const isAdmin = user.role === 'admin';
  const [creating, setCreating] = useState(false);
  const [newFormName, setNewFormName] = useState('');

  const handleCreate = () => {
    const name = newFormName.trim();
    if (!name) return;
    onCreateForm?.(name);
    setNewFormName('');
    setCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') { setCreating(false); setNewFormName(''); }
  };

  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950">

      {/* Logo */}
      <div className="px-[18px] py-[18px] border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-400 flex items-center justify-center text-black font-bold text-[11px] font-mono rounded-sm flex-shrink-0">FT</div>
          <span className="text-[13px] font-semibold text-zinc-100">FormThread</span>
        </div>
        <p className="font-mono text-[10px] text-zinc-600 mt-1.5">conversational forms</p>
      </div>

      {/* Section label + create button */}
      <div className="px-[18px] pt-4 pb-1.5 flex items-center justify-between">
        <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-[.12em]">Forms</span>
        {isAdmin && (
          <button
            onClick={() => { setCreating(true); setNewFormName(''); }}
            title="Create new form"
            className="w-5 h-5 flex items-center justify-center text-zinc-600 hover:text-amber-400 hover:bg-zinc-800 rounded-sm transition-colors duration-100 font-mono text-[14px] leading-none"
          >+</button>
        )}
      </div>

      {/* Inline create-form input */}
      {creating && (
        <div className="px-2 pb-2">
          <div className="bg-zinc-900 border border-amber-400/40 rounded-sm px-2.5 py-2 flex flex-col gap-2">
            <p className="font-mono text-[9px] text-zinc-500">New form name</p>
            <input
              autoFocus
              type="text"
              value={newFormName}
              onChange={e => setNewFormName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. User Research"
              className="w-full bg-transparent text-[11px] text-zinc-200 placeholder-zinc-700 outline-none"
            />
            <div className="flex items-center gap-1.5">
              <button onClick={handleCreate} disabled={!newFormName.trim()}
                className="px-2.5 py-1 font-mono text-[9px] rounded-sm bg-amber-400 text-black font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-300 transition-colors">
                Create
              </button>
              <button onClick={() => { setCreating(false); setNewFormName(''); }}
                className="px-2 py-1 font-mono text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-px">
        {forms.map((form) => {
          const uc = unreadCount(form.id);
          const isActive = form.id === selectedFormId;
          const qCount = allQuestions.filter((q) => q.formId === form.id).length;
          return (
            <button key={form.id} onClick={() => onSelectForm(form.id)}
              className={`w-full text-left px-2.5 py-2.5 rounded-sm border-l-2 transition-all duration-100 ${isActive ? 'bg-zinc-800 border-l-amber-400' : 'bg-transparent border-l-transparent hover:bg-zinc-900'}`}>
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`text-[13px] flex-shrink-0 leading-none ${isActive ? 'text-amber-400' : 'text-zinc-600'}`}>{form.icon}</span>
                  <span className={`text-[11.5px] font-medium truncate ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>{form.name}</span>
                </div>
                {uc > 0 && <span className="flex-shrink-0 w-4 h-4 bg-amber-400 text-black font-mono text-[9px] font-bold flex items-center justify-center rounded-sm">{uc}</span>}
              </div>
              <p className={`font-mono text-[9px] mt-1.5 truncate ${isActive ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {qCount} questions · {form.respondentName.split(' ')[0]}
              </p>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-[18px] py-3 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-zinc-700 flex items-center justify-center font-mono text-[10px] text-zinc-300 font-bold flex-shrink-0">{user.initial}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-medium text-zinc-300 truncate">{user.name}</p>
              <span className={`flex-shrink-0 font-mono text-[7px] px-1 py-px rounded-sm border ${isAdmin ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'text-zinc-500 border-zinc-700 bg-zinc-800/60'}`}>{user.role}</span>
            </div>
            <p className="font-mono text-[9px] text-zinc-600 truncate">{user.email}</p>
          </div>
          <button onClick={onLogout} title="Sign out" className="flex-shrink-0 text-zinc-700 hover:text-rose-400 transition-colors duration-100 font-mono text-[10px]">⏻</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
