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
  const isComplete = completionPct === 100 && totalCount > 0;

  return (
    <div style={{
      width: 300, flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)',
      position: 'relative', zIndex: 5,
    }}>
      {/* ── STAGE CLEAR banner ── */}
      {isComplete && (
        <div className="animate-stage-clear" style={{
          background: 'rgba(0,255,159,0.08)',
          border: 'none',
          borderBottom: '2px solid var(--status-done)',
          borderTop: '2px solid var(--status-done)',
          padding: '8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 9,
            color: 'var(--status-done)',
            textShadow: '0 0 10px rgba(0,255,159,0.6)',
            letterSpacing: '0.1em',
          }}>
            ★ STAGE CLEAR! ★
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        {form ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{form.icon}</span>
              <h2 style={{
                fontFamily: "'VT323', monospace",
                fontSize: 18, margin: 0,
                color: isComplete ? 'var(--status-done)' : 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {form.name}
              </h2>
            </div>
            <p style={{
              fontFamily: "'VT323', monospace", fontSize: 13,
              color: 'var(--text-tertiary)', margin: '0 0 8px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {form.respondentName} · {form.respondentEmail}
            </p>

            {/* Quest progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Quest Progress
                </span>
                <span style={{
                  fontFamily: "'VT323', monospace", fontSize: 13,
                  color: isComplete ? 'var(--status-done)' : 'var(--text-secondary)',
                }}>
                  {completionPct}%
                </span>
              </div>
              <div className="pixel-progress-track">
                <div style={{
                  height: '100%',
                  width: `${completionPct}%`,
                  background: isComplete ? 'var(--status-done)' : 'var(--accent)',
                  boxShadow: isComplete ? '0 0 6px rgba(0,255,159,0.4)' : 'none',
                }} />
              </div>
            </div>

            {/* Stat chips */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {awaitingCount > 0 && (
                <Chip color="var(--status-wait)" bg="rgba(255,215,0,0.08)" label={`${awaitingCount} pending`} />
              )}
              {followUpCount > 0 && (
                <Chip color="var(--status-flag)" bg="rgba(255,68,102,0.08)" label={`${followUpCount} flagged`} />
              )}
              {answeredCount > 0 && (
                <Chip color="var(--status-done)" bg="rgba(0,255,159,0.08)" label={`${answeredCount} cleared`} />
              )}
            </div>
          </>
        ) : (
          <h2 style={{ fontFamily: "'VT323', monospace", fontSize: 17, color: 'var(--text-tertiary)', margin: 0, letterSpacing: '0.06em' }}>
            SELECT A QUEST
          </h2>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 8px',
        flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: '7px 10px',
              fontFamily: "'VT323', monospace",
              fontSize: 16,
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
              letterSpacing: '0.04em',
            }}
          >
            {tab === 'Awaiting' ? 'Pending' : tab === 'Answered' ? 'Cleared' : tab}
          </button>
        ))}
      </div>

      {/* ── Items ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {questions.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 32, color: 'var(--text-muted)', marginBottom: 8 }}>[ ]</div>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.06em', margin: 0, textTransform: 'uppercase' }}>
                {isAdmin ? 'No objectives yet' : 'No objectives'}
              </p>
            </div>
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
      <div style={{ borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        {isAdmin && form && (
          <button
            onClick={() => onAddQuestion?.(form.id)}
            className="pixel-btn"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px',
              background: 'none', border: 'none',
              borderBottom: '1px solid var(--border-subtle)',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'var(--accent)'; el.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--text-muted)'; el.style.background = 'none'; }}
          >
            <div style={{
              width: 18, height: 18,
              border: '1px solid var(--border-mid)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, lineHeight: 1, flexShrink: 0,
            }}>+</div>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 15 }}>
              New Objective
            </span>
          </button>
        )}
        <div style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            {allFormQuestions.length} OBJECTIVE{allFormQuestions.length !== 1 ? 'S' : ''}
          </span>
          {allFormQuestions.length > 0 && (
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: isComplete ? 'var(--status-done)' : 'var(--text-muted)' }}>
              {answeredCount}/{totalCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ color: string; bg: string; label: string }> = ({ color, bg, label }) => (
  <span style={{
    fontFamily: "'VT323', monospace", fontSize: 13,
    color, background: bg,
    padding: '2px 7px',
    border: `1px solid ${color}`,
    letterSpacing: '0.04em',
  }}>
    {label}
  </span>
);

export default QuestionList;
