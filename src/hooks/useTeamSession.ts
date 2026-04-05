import { useState, useCallback } from 'react';
import { validateTeam } from '../queries/teams';
import type { TeamSession } from '../types';

const SESSION_KEY = 'sfp_team_session';

function loadSession(): TeamSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TeamSession;
  } catch {
    return null;
  }
}

function saveSession(s: TeamSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function useTeamSession() {
  const [session, setSession] = useState<TeamSession | null>(loadSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (name: string, accessKey: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await validateTeam(name, accessKey);
      if (!result) {
        setError('Invalid team name or access key.');
        return false;
      }
      saveSession(result);
      setSession(result);
      return true;
    } catch (e: any) {
      setError(e?.message ?? 'Login failed.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setError(null);
  }, []);

  return { session, loading, error, login, logout };
}
