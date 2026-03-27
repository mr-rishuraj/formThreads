import React, { useState, useCallback } from 'react';
import { useUser } from './hooks/useUser';
import { useFormThread } from './hooks/useFormThread';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import QuestionList from './components/QuestionList';
import ThreadView from './components/ThreadView';

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard() {
  const { user, logout, isAdmin } = useUser();
  const [lastNewMessageId, setLastNewMessageId] = useState<string | null>(null);

  const {
    forms,
    visibleQuestions,
    allQuestions,
    selectedForm,
    selectedQuestion,
    selectedFormId,
    selectedQuestionId,
    activeTab,
    setActiveTab,
    selectForm,
    selectQuestion,
    sendReply,
    unreadCount,
    createForm,
    addQuestion,
    updateQuestion,
    loadingForms,
  } = useFormThread();

  const handleSendReply = useCallback(
    async (questionId: string, content: string) => {
      const newId = `m-${Date.now()}`;
      await sendReply(questionId, content);
      setLastNewMessageId(newId);
      setTimeout(() => setLastNewMessageId(null), 500);
    },
    [sendReply]
  );

  // Role-based form filtering
  const visibleForms = isAdmin
    ? forms
    : forms.filter((f) => user!.assignedFormIds.includes(f.id));

  const allFormQuestions = allQuestions.filter((q) => q.formId === selectedFormId);

  if (loadingForms) {
    return (
      <div className="relative z-10 h-screen flex items-center justify-center">
        <p className="font-mono text-[11px] text-zinc-600">Loading your workspace…</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 h-screen flex overflow-hidden">
      <Sidebar
        forms={visibleForms}
        allQuestions={allQuestions}
        selectedFormId={selectedFormId ?? ''}
        onSelectForm={selectForm}
        unreadCount={unreadCount}
        user={user!}
        onLogout={logout}
        onCreateForm={isAdmin ? createForm : undefined}
      />

      <QuestionList
        form={selectedForm}
        questions={visibleQuestions}
        allFormQuestions={allFormQuestions}
        selectedQuestionId={selectedQuestionId}
        activeTab={activeTab}
        onSelectQuestion={selectQuestion}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        onAddQuestion={isAdmin ? (formId: string) => addQuestion(formId, 'Untitled Question') : undefined}
      />

      <ThreadView
        question={selectedQuestion}
        form={selectedForm}
        onSendReply={handleSendReply}
        onUpdateQuestion={isAdmin ? updateQuestion : undefined}
        newMessageId={lastNewMessageId}
        user={user!}
      />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────
function App() {
  const { user, login, loading } = useUser();

  if (loading) {
    return (
      <div className="relative z-10 h-screen flex items-center justify-center">
        <p className="font-mono text-[11px] text-zinc-600">Checking session…</p>
      </div>
    );
  }

  if (!user) return <AuthPage onLogin={login} />;
  return <Dashboard />;
}

export default App;
