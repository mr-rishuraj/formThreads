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
import type { User, Team } from './types';

// ── Loading screen ─────────────────────────────────────────────
const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading…' }) => (
  <div style={{
    position: 'relative', zIndex: 10,
    height: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 40, height: 40,
        background: 'var(--accent)',
        border: '2px solid var(--accent)',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.6), 0 0 20px var(--accent-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h9M2 12h11" stroke="white" strokeWidth="2" strokeLinecap="square"/>
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <p style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 8, color: 'var(--text-muted)', margin: 0, letterSpacing: '0.1em',
      }}>
        {message}
      </p>
    </div>
  </div>
);

// ── XP Gain Popup ─────────────────────────────────────────────
const XpGainPopup: React.FC = () => (
  <div style={{
    position: 'fixed', bottom: 100, right: 40,
    zIndex: 9999, pointerEvents: 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  }} className="animate-xp-gain">
    <div style={{
      fontFamily: "'Press Start 2P', monospace",
      fontSize: 11,
      color: 'var(--xp-color)',
      textShadow: '0 0 10px rgba(255,215,0,0.7), 2px 2px 0 rgba(0,0,0,0.8)',
      letterSpacing: '0.05em', whiteSpace: 'nowrap',
    }}>+100 XP</div>
    <div style={{
      fontFamily: "'VT323', monospace", fontSize: 14,
      color: 'rgba(255,215,0,0.6)', letterSpacing: '0.1em',
    }}>REPLY SENT!</div>
  </div>
);

// ── Dashboard — receives user from App (single auth subscription) ──
interface DashboardProps {
  user: User;
  isAdmin: boolean;
  logout: () => void;
  refreshTeam: () => Promise<void>;
  leaveTeam: () => Promise<void>;
}

function Dashboard({ user, isAdmin, logout, refreshTeam, leaveTeam }: DashboardProps) {
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [assigningFormId, setAssigningFormId] = useState<string | null>(null);
  const [assignedTeamIds, setAssignedTeamIds] = useState<string[]>([]);
  const [xpPopupKey, setXpPopupKey] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const {
    forms, visibleQuestions, allQuestions,
    selectedForm, selectedQuestion, selectedFormId, selectedQuestionId,
    activeTab, setActiveTab, selectForm, selectQuestion,
    sendReply, unreadCount, createForm, addQuestion, updateQuestion,
    loadingForms, removeForm,
  } = useFormThread({ isAdmin, teamId: user.teamId ?? null });

  const {
    teams, loadTeams, createTeam, joinTeamByCode, getAssignedTeams, setFormTeam, removeTeam,
  } = useTeam();

  useEffect(() => {
    if (isAdmin) loadTeams();
  }, [isAdmin, loadTeams]);

  const handleSendReply = useCallback(
    async (questionId: string, content: string) => {
      await sendReply(questionId, content);
      setXpPopupKey(k => k + 1);
      setShowXpPopup(true);
      setShowFlash(true);
      setTimeout(() => setShowXpPopup(false), 1800);
      setTimeout(() => setShowFlash(false), 500);
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

  // Participant without a team → show join page
  // This is safe because user is fresh from DB (no localStorage involved)
  if (!isAdmin && !user.teamId) {
    return (
      <TeamJoinPage
        userName={user.name}
        onJoin={handleJoinTeam}
        onLogout={logout}
      />
    );
  }

  if (loadingForms) {
    return <LoadingScreen message="Loading quests…" />;
  }

  return (
    <div style={{
      position: 'relative', zIndex: 10,
      height: '100vh', display: 'flex', overflow: 'hidden',
    }}>
      {/* Screen flash on XP gain */}
      {showFlash && (
        <div className="screen-flash" style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'var(--xp-color)', pointerEvents: 'none',
        }} />
      )}

      {/* +XP floating notification */}
      {showXpPopup && <XpGainPopup key={xpPopupKey} />}

      <Sidebar
        forms={forms}
        allQuestions={allQuestions}
        selectedFormId={selectedFormId ?? ''}
        onSelectForm={selectForm}
        unreadCount={unreadCount}
        user={user}
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
        user={user}
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

// ── Root — single useUser() call, passes user down ────────────
function App() {
  const { user, login, logout, loading, isAdmin, refreshTeam, leaveTeam } = useUser();

  if (loading) return <LoadingScreen message="SFP loading…" />;
  if (!user)   return <AuthPage onLogin={login} />;

  return (
    <Dashboard
      user={user}
      isAdmin={isAdmin}
      logout={logout}
      refreshTeam={refreshTeam}
      leaveTeam={leaveTeam}
    />
  );
}

export default App;
