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
  form, questions, allFormQuestions, selectedQuestionId,
  activeTab, onSelectQuestion, onTabChange, isAdmin = false, onAddQuestion,
}) => {
  const awaitingCount = allFormQuestions.filter(q => q.status === 'unanswered').length;
  const followUpCount = allFormQuestions.filter(q => q.status === 'needs-clarification').length;
  const answeredCount = allFormQuestions.filter(q => q.status === 'answered').length;
  const totalCount = allFormQuestions.length;
  const completionPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <div style={{
      width: 300, flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)',
      position: 'relative', zIndex: 5,
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {form ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{form.icon}</span>
              <h2 style={{
                fontSize: 13, fontWeight: 600, margin: 0,
                color: 'var(--text-primary)', letterSpacing: '-0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {form.name}
              </h2>
            </div>
            <p style={{
              fontFamily: "'Fira Code', monospace", fontSize: 10,
              color: 'var(--text-tertiary)', margin: '0 0 10px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {form.respondentName} · {form.respondentEmail}
            </p>

            {/* Completion bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
                  Thread completion
                </span>
                <span style={{
                  fontFamily: "'Fira Code', monospace", fontSize: 9, fontWeight: 600,
                  color: completionPct === 100 ? 'var(--status-done)' : 'var(--text-secondary)',
                }}>
                  {completionPct}%
                </span>
              </div>
              <div style={{ height: 3, borderRadius: 3, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${completionPct}%`,
                  borderRadius: 3,
                  background: completionPct === 100
                    ? 'var(--status-done)'
                    : 'linear-gradient(90deg, var(--accent), #a78bfa)',
                  transition: 'width 0.5s cubic-bezier(.16,1,.3,1)',
                }} />
              </div>
            </div>

            {/* Stat chips */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {awaitingCount > 0 && (
                <Chip color="#f59e0b" bg="rgba(245,158,11,0.08)" label={`${awaitingCount} awaiting`} />
              )}
              {followUpCount > 0 && (
                <Chip color="#f87171" bg="rgba(248,113,113,0.08)" label={`${followUpCount} follow-up`} />
              )}
              {answeredCount > 0 && (
                <Chip color="#34d399" bg="rgba(52,211,153,0.08)" label={`${answeredCount} done`} />
              )}
            </div>
          </>
        ) : (
          <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', margin: 0 }}>
            Select a form
          </h2>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 8px',
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: '9px 10px',
              fontFamily: "'Fira Code', monospace",
              fontSize: 10,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
              transition: 'all 0.15s',
              letterSpacing: '0.02em',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Items ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {questions.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
              {isAdmin ? 'No questions yet' : 'No questions'}
            </p>
          </div>
        ) : (
          questions.map(q => (
            <QuestionItem
              key={q.id}
              question={q}
              isSelected={q.id === selectedQuestionId}
              onClick={() => onSelectQuestion(q.id)}
            />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {isAdmin && form && (
          <button
            onClick={() => onAddQuestion?.(form.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.color = 'var(--text-secondary)';
              el.style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.color = 'var(--text-muted)';
              el.style.background = 'none';
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              border: '1px dashed var(--border-mid)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, lineHeight: 1, flexShrink: 0,
              transition: 'border-color 0.15s',
            }}>+</div>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10 }}>
              Add question
            </span>
          </button>
        )}
        <div style={{ padding: '8px 16px' }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
            {allFormQuestions.length} question{allFormQuestions.length !== 1 ? 's' : ''} total
          </span>
        </div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ color: string; bg: string; label: string }> = ({ color, bg, label }) => (
  <span style={{
    fontFamily: "'Fira Code', monospace", fontSize: 9,
    color, background: bg,
    padding: '2px 7px', borderRadius: 4,
    border: `1px solid ${color}30`,
  }}>
    {label}
  </span>
);

export default QuestionList;
