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
        background: '#000000',
      }}>
        <div style={{
          width: 340,
          background: '#111111',
          border: '1px solid #333333',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          padding: '40px 32px',
          display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7, color: '#ffffff', lineHeight: 1.8, marginBottom: 8,
            }}>
              SOLVE FOR PILANI
            </div>
            <div style={{
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: 14, color: '#888888', letterSpacing: '0.04em',
            }}>
              Admin Login
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            style={{
              width: '100%', padding: '11px 16px',
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              color: '#1a1a1a',
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
              fontSize: 15, fontWeight: 500,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              transition: 'box-shadow 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f5f5f5';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
            }}
          >
            {/* Google G icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <button
            onClick={() => setShowAdminLogin(false)}
            style={{
              background: 'none', border: 'none',
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: 13, color: '#666666',
              cursor: 'pointer', letterSpacing: '0.02em',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#aaaaaa'}
            onMouseLeave={e => e.currentTarget.style.color = '#666666'}
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
