import React, { useState } from 'react';
import { useUser } from './hooks/useUser';
import { useTeamSession } from './hooks/useTeamSession';
import { useAdminData } from './hooks/useAdminData';
import { useParticipantData } from './hooks/useParticipantData';
import { signInWithGoogle } from './lib/supabase';
import TeamLogin from './components/TeamLogin';
import Sidebar from './components/Sidebar';
import AdminQuestionPanel from './components/AdminQuestionPanel';
import AdminThread from './components/AdminThread';
import ParticipantThread from './components/ParticipantThread';
import AdminTeamManager from './components/AdminTeamManager';

// ── Loading ───────────────────────────────────────────────────
const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading…' }) => (
  <div style={{
    position: 'relative', zIndex: 10, height: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 40, height: 40, background: 'var(--accent)',
        border: '2px solid var(--accent)',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.6), 0 0 20px var(--accent-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h9M2 12h11" stroke="white" strokeWidth="2" strokeLinecap="square"/>
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
      </div>
      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: 'var(--text-muted)', margin: 0, letterSpacing: '0.1em' }}>
        {message}
      </p>
    </div>
  </div>
);

// ── Admin Dashboard ───────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { user } = useUser();
  const [showManager, setShowManager] = useState(false);
  const {
    teams, questions, teamQuestions, messages,
    selectedTeamId, selectedTQ, loadingTeams, loadingTQ, loadingM,
    selectTeam, selectTQ,
    createTeam, removeTeam,
    createQuestion, editQuestion, removeQuestion,
    assignToTeams, updateStatus, sendReply,
  } = useAdminData();

  if (loadingTeams) return <LoadingScreen message="Loading…" />;

  return (
    <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Col 1: Teams */}
      <Sidebar
        user={user}
        onLogout={onLogout}
        isAdmin
        teams={teams}
        selectedTeamId={selectedTeamId}
        onSelectTeam={selectTeam}
      />

      {/* Col 2: Questions for selected team */}
      <AdminQuestionPanel
        questions={teamQuestions}
        selectedQuestionId={selectedTQ?.id ?? null}
        onSelectQuestion={selectTQ}
        loading={loadingTQ}
      />

      {/* Col 3: Thread + status controls */}
      <AdminThread
        question={selectedTQ}
        messages={messages}
        loading={loadingM}
        onSend={sendReply}
        onUpdateStatus={updateStatus}
        onEditQuestion={editQuestion}
      />

      {/* Manage button */}
      <button
        onClick={() => setShowManager(true)}
        className="pixel-btn"
        style={{
          position: 'fixed', bottom: 20, right: 24, zIndex: 100,
          padding: '8px 18px',
          background: 'var(--bg-elevated)', border: '2px solid var(--border-mid)',
          boxShadow: '3px 3px 0 rgba(0,0,0,0.4)',
          fontFamily: "'VT323', monospace", fontSize: 15,
          color: 'var(--text-secondary)', cursor: 'pointer',
          letterSpacing: '0.08em',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-mid)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        + Manage
      </button>

      {showManager && (
        <AdminTeamManager
          teams={teams}
          questions={questions}
          onCreateTeam={createTeam}
          onDeleteTeam={removeTeam}
          onCreateQuestion={createQuestion}
          onDeleteQuestion={removeQuestion}
          onAssignToTeams={assignToTeams}
          onClose={() => setShowManager(false)}
        />
      )}
    </div>
  );
}

// ── Participant Dashboard ─────────────────────────────────────
function ParticipantDashboard({ teamId, teamName, onLogout }: {
  teamId: string;
  teamName: string;
  onLogout: () => void;
}) {
  const {
    questions, selectedQuestion, messages, loadingQ, loadingM,
    selectQuestion, sendReply,
  } = useParticipantData(teamId, teamName);

  if (loadingQ) return <LoadingScreen message="Loading questions…" />;

  return (
    <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Col 1: Questions grouped by status */}
      <Sidebar
        teamSession={{ teamId, teamName }}
        onLogout={onLogout}
        isAdmin={false}
        questions={questions}
        selectedQuestionId={selectedQuestion?.id ?? null}
        onSelectQuestion={selectQuestion}
      />

      {/* Col 2: Chat */}
      <ParticipantThread
        question={selectedQuestion}
        messages={messages}
        loading={loadingM}
        onSend={sendReply}
        teamName={teamName}
      />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────
function App() {
  const { user, logout: adminLogout, loading: adminLoading, isAdmin } = useUser();
  const { session, loading: teamLoading, error: teamError, login: teamLogin, logout: teamLogout } = useTeamSession();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Still resolving auth state
  if (adminLoading) return <LoadingScreen message="SFP loading…" />;

  // Admin authenticated via Google OAuth
  if (user && isAdmin) {
    return <AdminDashboard onLogout={adminLogout} />;
  }

  // Participant authenticated via team key
  if (session) {
    return (
      <ParticipantDashboard
        teamId={session.teamId}
        teamName={session.teamName}
        onLogout={teamLogout}
      />
    );
  }

  // Show admin Google login if requested
  if (showAdminLogin) {
    return (
      <div style={{
        position: 'relative', zIndex: 10, height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div style={{
          width: 340,
          background: 'var(--bg-surface)', border: '2px solid var(--border-mid)',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.6)', padding: '36px 32px',
          display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: 8 }}>
              SOLVE FOR PILANI
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: 'var(--text-muted)' }}>Admin Login</div>
          </div>
          <button
            onClick={signInWithGoogle}
            className="pixel-btn"
            style={{
              width: '100%', padding: '12px',
              background: 'var(--accent)', border: '2px solid var(--accent)',
              color: 'white', fontFamily: "'VT323', monospace", fontSize: 18,
              cursor: 'pointer', boxShadow: '3px 3px 0 rgba(0,0,0,0.4)',
              letterSpacing: '0.08em',
            }}
          >
            Sign in with Google
          </button>
          <button
            onClick={() => setShowAdminLogin(false)}
            style={{
              background: 'none', border: 'none',
              fontFamily: "'VT323', monospace", fontSize: 14,
              color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            ← Back to team login
          </button>
        </div>
      </div>
    );
  }

  // Default: team key login
  return (
    <TeamLogin
      onLogin={teamLogin}
      onSwitchToAdmin={() => setShowAdminLogin(true)}
      error={teamError}
      loading={teamLoading}
    />
  );
}

export default App;
