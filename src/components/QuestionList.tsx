import React from 'react';
import { Form, Question } from '../types';
import QuestionItem from './QuestionItem';

type TabOption = 'All' | 'Awaiting' | 'Answered';

interface QuestionListProps {
  form: Form | null;
  questions: Question[];
  allFormQuestions: Question[];
  selectedQuestionId: string | null;
  activeTab: TabOption;
  onSelectQuestion: (id: string) => void;
  onTabChange: (tab: TabOption) => void;
  isAdmin?: boolean;
  onAddQuestion?: (formId: string) => void;
}

const TABS: TabOption[] = ['All', 'Awaiting', 'Answered'];

const QuestionList: React.FC<QuestionListProps> = ({
  form,
  questions,
  allFormQuestions,
  selectedQuestionId,
  activeTab,
  onSelectQuestion,
  onTabChange,
  isAdmin = false,
  onAddQuestion,
}) => {
  const awaitingCount = allFormQuestions.filter((q) => q.status === 'unanswered').length;
  const followUpCount = allFormQuestions.filter((q) => q.status === 'needs-clarification').length;

  return (
    <div className="w-[300px] flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950/60">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-zinc-800">
        <h2 className="text-[13px] font-semibold text-zinc-100 truncate">
          {form?.name ?? 'Select a form'}
        </h2>
        <p className="font-mono text-[10px] text-zinc-600 mt-0.5 truncate">
          {form ? `${form.respondentName} · ${form.respondentEmail}` : ''}
        </p>
        {form && (
          <div className="flex items-center gap-2.5 mt-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span className="font-mono text-[9px] text-zinc-500">{awaitingCount} awaiting</span>
            </div>
            {followUpCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                <span className="font-mono text-[9px] text-zinc-500">{followUpCount} follow-up</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              px-2.5 py-2 font-mono text-[10px] border-b-2 transition-colors duration-100
              ${activeTab === tab
                ? 'text-amber-400 border-b-amber-400'
                : 'text-zinc-600 border-b-transparent hover:text-zinc-300'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {questions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-mono text-[10px] text-zinc-700">
              {isAdmin ? 'No questions yet — add one below' : 'No questions'}
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              isSelected={q.id === selectedQuestionId}
              onClick={() => onSelectQuestion(q.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800">
        {/* Admin: add question button */}
        {isAdmin && form && (
          <button
            onClick={() => onAddQuestion?.(form.id)}
            className="
              w-full flex items-center gap-2 px-4 py-2.5
              text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/60
              transition-colors duration-100 border-b border-zinc-800
            "
          >
            <span className="font-mono text-[13px] leading-none text-zinc-500">+</span>
            <span className="font-mono text-[10px]">Add question</span>
          </button>
        )}
        <div className="px-4 py-2.5">
          <p className="font-mono text-[9px] text-zinc-700">
            {allFormQuestions.length} question{allFormQuestions.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
