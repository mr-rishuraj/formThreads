import { useState, useEffect, useCallback } from 'react';
import { supabase, signInWithGoogle, signOut } from '../lib/supabase';
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
  if (role === 'participant') {
    try {
      const { data } = await supabase
        .from('participants')
        .select('form_id')
        .eq('user_id', supabaseUser.id);
      assignedFormIds = (data ?? []).map((p: { form_id: string }) => p.form_id);
    } catch (_) {}
  }

  return { email, name, role, initial, assignedFormIds };
}

export function useUser() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── REMOVED getSession() — was causing lock contention ──
    // onAuthStateChange fires with INITIAL_SESSION on mount,
    // so getSession() is redundant and causes the lock error.

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const u = await fetchUser(session.user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
            setUser(u);
          } catch (e) {
            console.error('fetchUser failed:', e);
            setUser(null);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, login, logout, loading, isAdmin: user?.role === 'admin' };
}