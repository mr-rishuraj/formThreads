import React, { useEffect, useRef, useState } from 'react';
import { Question, Form, User } from '../types';
import { useMessages } from '../hooks/useMessages';
import MessageBubble from './MessageBubble';
import ReplyBox from './ReplyBox';

interface ThreadViewProps {
  question: Question | null;
  form: Form | null;
  onSendReply: (questionId: string, content: string) => void;
  onUpdateQuestion?: (id: string, patch: Partial<Pick<Question, 'title' | 'description'>>) => void;
  newMessageId?: string | null;
  user: User;
}

const STATUS_CONFIG = {
  answered: { label: 'Answered', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  unanswered: { label: 'Awaiting reply', bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20' },
  'needs-clarification': { label: 'Follow-up needed', bg: 'bg-rose-400/10', text: 'text-rose-400', border: 'border-rose-400/20' },
} as const;

// ── Inline editable field ─────────────────────────────────────
interface EditableFieldProps {
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  textClass?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ value, placeholder, onSave, multiline = false, textClass = '' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); setEditing(false); }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed !== value) onSave(trimmed);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
    if (!multiline && e.key === 'Enter') { e.preventDefault(); commit(); }
    if (multiline && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
  };

  if (editing) {
    const base = `w-full bg-zinc-800/80 border border-amber-400/50 rounded-sm text-zinc-100 placeholder-zinc-600 outline-none ${textClass}`;
    return multiline
      ? <textarea autoFocus rows={3} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} onBlur={commit} placeholder={placeholder} className={`${base} px-3 py-2 resize-none leading-[1.65]`} />
      : <input autoFocus type="text" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} onBlur={commit} placeholder={placeholder} className={`${base} px-2 py-0.5`} />;
  }

  return (
    <button onClick={() => { setDraft(value); setEditing(true); }} title="Click to edit"
      className={`text-left w-full group/ef relative hover:bg-zinc-800/50 rounded-sm px-1 -mx-1 transition-colors duration-100 ${textClass}`}>
      {value ? <span>{value}</span> : <span className="italic text-zinc-600">{placeholder}</span>}
      <span className="absolute right-0.5 top-0 opacity-0 group-hover/ef:opacity-100 font-mono text-[8px] text-amber-400/70 transition-opacity pointer-events-none select-none">✎</span>
    </button>
  );
};

// ── ThreadView ────────────────────────────────────────────────
const ThreadView: React.FC<ThreadViewProps> = ({ question, form, onSendReply, onUpdateQuestion, newMessageId, user }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user.role === 'admin';

  // Realtime messages from Supabase
  const { messages, loading: messagesLoading } = useMessages(question?.id ?? null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, question?.id]);

  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950/40">
        <div className="text-center">
          <div className="text-5xl text-zinc-800 mb-3">◈</div>
          <p className="font-mono text-[11px] text-zinc-700">Select a question to view the thread</p>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[question.status];
  const respondentInitial = (form?.respondentName?.[0] ?? 'R').toUpperCase();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-950/30">

      {/* Header */}
      <div className="px-6 py-3.5 border-b border-zinc-800 flex-shrink-0 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isAdmin
            ? <EditableField value={question.title} placeholder="Untitled Question" onSave={v => onUpdateQuestion?.(question.id, { title: v })} textClass="text-[13px] font-semibold text-zinc-100 leading-snug" />
            : <h2 className="text-[13px] font-semibold text-zinc-100 leading-snug">{question.title}</h2>
          }
          <p className="font-mono text-[9px] text-zinc-600 mt-1">
            {form?.name} · {messages.length} messages · {question.lastActivity}
            {isAdmin && <span className="ml-1.5 text-zinc-700">· click any field to edit</span>}
          </p>
        </div>
        <span className={`flex-shrink-0 px-2.5 py-1 rounded-sm font-mono text-[9px] font-medium border whitespace-nowrap ${status.bg} ${status.text} ${status.border}`}>
          {status.label}
        </span>
      </div>

      {/* Context card */}
      <div className="px-6 py-3 border-b border-zinc-800/50 flex-shrink-0">
        <div className={`bg-zinc-900/60 border rounded-sm px-4 py-3 transition-colors duration-150 ${isAdmin ? 'border-zinc-700' : 'border-zinc-800'}`}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-[.1em]">Question context</p>
            {isAdmin && <span className="font-mono text-[8px] text-zinc-700 italic">admin · editable</span>}
          </div>
          {isAdmin
            ? <EditableField value={question.description} placeholder="Add context or instructions for the respondent…" onSave={v => onUpdateQuestion?.(question.id, { description: v })} multiline textClass="text-[12px] text-zinc-400" />
            : <p className="text-[12px] text-zinc-400 leading-[1.65]">{question.description || <span className="italic text-zinc-600">No context provided</span>}</p>
          }
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-[18px]">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-mono text-[10px] text-zinc-700">Loading messages…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-mono text-[10px] text-zinc-700">No replies yet</p>
          </div>
        ) : (
          messages.map(m => <MessageBubble key={m.id} message={m} isNew={m.id === newMessageId} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply box */}
      <div className="px-6 pb-5 pt-3 flex-shrink-0 border-t border-zinc-800">
        <ReplyBox
          onSend={(content) => onSendReply(question.id, content)}
          respondentName={isAdmin ? user.name : (form?.respondentName ?? 'Respondent')}
          respondentInitial={isAdmin ? user.initial : respondentInitial}
        />
      </div>
    </div>
  );
};

export default ThreadView;
