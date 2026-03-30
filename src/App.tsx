import React, { useState, useCallback, useEffect } from 'react';
import { useUser } from './hooks/useUser';
import { useFormThread } from './hooks/useFormThread';
import { useTeam } from './hooks/useTeam';
import AuthPage from './components/AuthPage';
import TeamJoinPage from './components/TeamJoinPage';
import Sidebar from './components/Sidebar';
import QuestionList from './components/QuestionList';
import ThreadView from './components/ThreadView';
import CreateTeamModal from './components/CreateTeamModal';
import AssignTeamModal from './components/AssignTeamModal';
import type { Team } from './types';

// ── Loading screen ─────────────────────────────────────────────
const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading…' }) => (
  <div style={{
    position: 'relative', zIndex: 10,
    height: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 36, height: 36,
        background: 'linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 20px var(--accent-glow)',
        animation: 'pulseGlow 2s infinite',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h9M2 12h11" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0,1,2].map(i => (
          <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.14}s` }} />
        ))}
      </div>
      <p style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
        {message}
      </p>
    </div>
  </div>
);

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard() {
  const { user, logout, isAdmin, refreshTeam, leaveTeam } = useUser();
  const [lastNewMessageId, setLastNewMessageId] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [assigningFormId, setAssigningFormId] = useState<string | null>(null);
  const [assignedTeamIds, setAssignedTeamIds] = useState<string[]>([]);

  const {
    forms, visibleQuestions, allQuestions,
    selectedForm, selectedQuestion, selectedFormId, selectedQuestionId,
    activeTab, setActiveTab, selectForm, selectQuestion,
    sendReply, unreadCount, createForm, addQuestion, updateQuestion,
    loadingForms, removeForm,
  } = useFormThread({ isAdmin, teamId: user?.teamId ?? null });

  const {
    teams, loadTeams, createTeam, joinTeamByCode, getAssignedTeams, setFormTeam, removeTeam,
  } = useTeam();

  useEffect(() => {
    if (isAdmin) loadTeams();
  }, [isAdmin, loadTeams]);

  const handleSendReply = useCallback(
    async (questionId: string, content: string) => {
      await sendReply(questionId, content);
      // newMessageId is not used for animation since realtime re-fetches the full message
    },
    [sendReply]
  );

  const handleOpenAssign = useCallback(async (formId: string) => {
    setAssigningFormId(formId);
    const ids = await getAssignedTeams(formId);
    setAssignedTeamIds(ids);
  }, [getAssignedTeams]);

  const handleJoinTeam = useCallback(async (code: string): Promise<Team | null> => {
    const team = await joinTeamByCode(code);
    if (team) await refreshTeam();
    return team;
  }, [joinTeamByCode, refreshTeam]);

  const allFormQuestions = allQuestions.filter(q => q.formId === selectedFormId);

  if (!isAdmin && !user?.teamId) {
    return (
      <TeamJoinPage
        userName={user?.name ?? 'there'}
        onJoin={handleJoinTeam}
        onLogout={logout}
      />
    );
  }

  if (loadingForms) {
    return <LoadingScreen message="Loading your workspace…" />;
  }

  return (
    <div style={{
      position: 'relative', zIndex: 10,
      height: '100vh', display: 'flex', overflow: 'hidden',
    }}>
      <Sidebar
        forms={isAdmin ? forms : forms.filter(() => !!user!.teamId)}
        allQuestions={allQuestions}
        selectedFormId={selectedFormId ?? ''}
        onSelectForm={selectForm}
        unreadCount={unreadCount}
        user={user!}
        onLogout={logout}
        onCreateForm={isAdmin ? createForm : undefined}
        teams={isAdmin ? teams : undefined}
        onCreateTeam={isAdmin ? () => setShowCreateTeam(true) : undefined}
        onAssignTeam={isAdmin ? handleOpenAssign : undefined}
        onDeleteForm={isAdmin ? removeForm : undefined}
        onDeleteTeam={isAdmin ? removeTeam : undefined}
        onLeaveTeam={!isAdmin ? leaveTeam : undefined}
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

      {showCreateTeam && (
        <CreateTeamModal
          onConfirm={createTeam}
          onClose={() => setShowCreateTeam(false)}
        />
      )}

      {assigningFormId && (
        <AssignTeamModal
          formId={assigningFormId}
          formName={forms.find(f => f.id === assigningFormId)?.name ?? ''}
          allTeams={teams}
          assignedTeamIds={assignedTeamIds}
          onToggle={setFormTeam}
          onClose={() => setAssigningFormId(null)}
        />
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────
function App() {
  const { user, login, loading } = useUser();

  if (loading) return <LoadingScreen message="Checking session…" />;
  if (!user) return <AuthPage onLogin={login} />;
  return <Dashboard />;
}

export default App;
