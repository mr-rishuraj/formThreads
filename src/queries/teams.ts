import { supabase } from '../lib/supabase';
import type { Team, TeamSession } from '../types';

function genAccessKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type DBTeam = {
  id: string;
  name: string;
  code: string;
  access_key: string;
  created_by: string;
  created_at: string;
};

function mapTeam(db: DBTeam): Team {
  return {
    id: db.id,
    name: db.name,
    code: db.code,
    accessKey: db.access_key ?? '',
    createdBy: db.created_by,
    createdAt: db.created_at?.split('T')[0] ?? '',
  };
}

export async function createTeam(name: string): Promise<Team> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const code = Array.from({ length: 6 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
  ).join('');
  const access_key = genAccessKey();

  const { data, error } = await supabase
    .from('teams')
    .insert({ name: name.trim(), code, access_key, created_by: user.id })
    .select('id, name, code, access_key, created_by, created_at')
    .single();

  if (error) throw error;
  return mapTeam(data as DBTeam);
}

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, code, access_key, created_by, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DBTeam[]).map(mapTeam);
}

export async function validateTeam(
  name: string,
  accessKey: string
): Promise<TeamSession | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, access_key')
    .ilike('name', name.trim())
    .single();

  if (error || !data) return null;
  if (data.access_key !== accessKey.trim().toUpperCase()) return null;

  return { teamId: data.id, teamName: data.name };
}

export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase.from('teams').delete().eq('id', teamId);
  if (error) throw error;
}
