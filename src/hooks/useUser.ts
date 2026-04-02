import { useState, useEffect, useCallback } from 'react';
import { supabase, signInWithGoogle, signOut } from '../lib/supabase';
import { getMyTeam, leaveTeam as dbLeaveTeam } from '../queries/forms';
import type { User } from '../types';

const STORAGE_KEY = 'formthread_user';

async function fetchUser(supabaseUser: { id: string; email?: string }): Promise<User> {
  const email = supabaseUser.email ?? '';
  const namePart = email.split('@')[0];
  const name = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, ' ');
  const initial = name[0]?.toUpperCase() ?? '?';

  let role: 'admin' | 'participant' = 'participant';
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', supabaseUser.id)
      .single();
    if (!error && data?.role) {
      role = data.role === 'admin' ? 'admin' : 'participant';
    }
  } catch (_) {}

  let assignedFormIds: string[] = [];
  let teamId: string | null = null;
  let teamName: string | null = null;

  if (role === 'participant') {
    try {
      const { data } = await supabase
        .from('participants')
        .select('form_id')
        .eq('user_id', supabaseUser.id);
      assignedFormIds = (data ?? []).map((p: { form_id: string }) => p.form_id);
    } catch (_) {}

    try {
      const team = await getMyTeam();
      if (team) {
        teamId = team.id;
        teamName = team.name;
      }
    } catch (_) {}
  }

  return { email, name, role, initial, assignedFormIds, teamId, teamName };
}

export function useUser() {
  // Always start as null — never read stale data from localStorage.
  // The auth state change fires immediately on subscription (INITIAL_SESSION),
  // fetches fresh data from DB, and sets the user. This eliminates all
  // "need to clear localStorage" issues caused by stale cached role/team data.
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const u = await fetchUser(session.user);
            setUser(u);
          } catch (e) {
            console.error('fetchUser failed:', e);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const refreshTeam = useCallback(async () => {
    try {
      const team = await getMyTeam();
      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, teamId: team?.id ?? null, teamName: team?.name ?? null };
      });
    } catch (_) {}
  }, []);

  const leaveTeam = useCallback(async () => {
    if (!window.confirm('Leave this team? You will need a new code to join another team.')) return;
    try {
      await dbLeaveTeam();
      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, teamId: null, teamName: null };
      });
    } catch (e) {
      console.error('leaveTeam failed:', e);
    }
  }, []);

  const login = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    // Clear any leftover keys from old versions
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return {
    user, login, logout, loading,
    isAdmin: user?.role === 'admin',
    refreshTeam,
    leaveTeam,
  };
}
