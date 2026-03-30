import { supabase } from '../lib/supabase';
import type { Form, Question, Message, Team } from '../types';

// ── Raw DB row types ──────────────────────────────────────────

type DBForm = {
  id: string;
  title: string;
  created_at: string;
  created_by: string;
};

type DBQuestion = {
  id: string;
  form_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
};

type DBMessage = {
  id: string;
  question_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  users?: { email: string; role: string }[] | null;
};

type DBTeam = {
  id: string;
  name: string;
  code: string;
  created_by: string;
  created_at: string;
};

// ── Mappers ───────────────────────────────────────────────────

function mapForm(db: DBForm): Form {
  return {
    id: db.id,
    name: db.title,
    description: '',
    createdAt: db.created_at.split('T')[0],
    questionCount: 0,
    respondentName: '',
    respondentEmail: '',
    icon: '◈',
  };
}

function mapQuestion(db: DBQuestion): Omit<Question, 'messages' | 'status' | 'unread' | 'lastActivity'> {
  return {
    id: db.id,
    formId: db.form_id,
    title: db.title,
    description: db.description ?? '',
  };
}

function mapMessage(db: DBMessage): Message {
  const userObj = db.users?.[0];
  const senderEmail = userObj?.email ?? '';
  const namePart = senderEmail.split('@')[0];
  const senderName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, ' ');
  return {
    id: db.id,
    role: userObj?.role === 'admin' ? 'creator' : 'respondent',
    content: db.content,
    timestamp: new Date(db.created_at).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    }),
    senderName,
    senderInitial: senderName[0]?.toUpperCase() ?? '?',
  };
}

function mapTeam(db: DBTeam): Team {
  return {
    id: db.id,
    name: db.name,
    code: db.code,
    createdBy: db.created_by,
    createdAt: db.created_at.split('T')[0],
  };
}

// ── Forms ─────────────────────────────────────────────────────

export async function getMyForms(): Promise<Form[]> {
  const { data, error } = await supabase
    .from('forms')
    .select('id, title, created_at, created_by')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DBForm[]).map(mapForm);
}

export async function createForm(title: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('forms')
    .insert({ title, created_by: user.id })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

// ── Questions ─────────────────────────────────────────────────

export async function getQuestions(formId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, form_id, title, description, order_index, created_at')
    .eq('form_id', formId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return (data as DBQuestion[]).map((db) => ({
    ...mapQuestion(db),
    messages: [],
    status: 'unanswered' as const,
    unread: false,
    lastActivity: new Date(db.created_at).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
    }),
  }));
}

export async function createQuestion(formId: string, title: string, orderIndex: number): Promise<string> {
  const { data, error } = await supabase
    .from('questions')
    .insert({ form_id: formId, title, order_index: orderIndex })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateQuestionInDB(
  questionId: string,
  patch: { title?: string; description?: string }
): Promise<void> {
  const { error } = await supabase.from('questions').update(patch).eq('id', questionId);
  if (error) throw error;
}

// ── Messages ──────────────────────────────────────────────────

export async function getMessages(questionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, question_id, sender_id, content, created_at, users(email, role)')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as DBMessage[]).map(mapMessage);
}

export async function sendMessage(questionId: string, content: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('messages')
    .insert({ question_id: questionId, sender_id: user.id, content: content.trim() });
  if (error) throw error;
}

// ── Participants ──────────────────────────────────────────────

type DBParticipant = {
  user_id: string;
  role: string;
  users: { email: string }[] | null;
};

export async function getParticipantInfo(
  formId: string
): Promise<{ respondentName: string; respondentEmail: string }> {
  const { data, error } = await supabase
    .from('participants')
    .select('user_id, role, users(email)')
    .eq('form_id', formId)
    .eq('role', 'participant')
    .limit(1);
  if (error || !data?.length) return { respondentName: 'Respondent', respondentEmail: '' };
  const p = data[0] as DBParticipant;
  const email = p.users?.[0]?.email ?? '';
  const namePart = email.split('@')[0];
  const name = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, ' ');
  return { respondentName: name, respondentEmail: email };
}

// ── Teams ─────────────────────────────────────────────────────

/** Admin: get all teams */
export async function getAllTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, code, created_by, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DBTeam[]).map(mapTeam);
}

/** Participant: get their team (via team_members) */
export async function getMyTeam(): Promise<Team | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('team_members')
    .select('team_id, teams(id, name, code, created_by, created_at)')
    .eq('user_id', user.id)
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0] as any;
  const team = row.teams;
  if (!team) return null;

  return {
    id: team.id,
    name: team.name,
    code: team.code,
    createdBy: team.created_by,
    createdAt: team.created_at?.split('T')[0] ?? '',
  };
}
/** Validate a team code and return the team if valid */
export async function getTeamByCode(code: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, code, created_by, created_at')
    .eq('code', code.trim().toUpperCase())
    .single();
  if (error || !data) return null;
  return mapTeam(data as DBTeam);
}

/** Admin: create a new team. Auto-generates code via DB function */
export async function createTeam(name: string): Promise<Team> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Generate code client-side (6 chars, uppercase alphanumeric, no ambiguous chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  const { data, error } = await supabase
    .from('teams')
    .insert({ name: name.trim(), code, created_by: user.id })
    .select('id, name, code, created_by, created_at')
    .single();
  if (error) throw error;
  return mapTeam(data as DBTeam);
}

/** Participant: join a team by inserting into team_members */
export async function joinTeam(teamId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('team_members')
    .insert({ user_id: user.id, team_id: teamId });
  if (error) throw error;
}

// ── Form ↔ Team assignment ────────────────────────────────────

/** Admin: get team IDs assigned to a form */
export async function getFormTeams(formId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('form_teams')
    .select('team_id')
    .eq('form_id', formId);
  if (error) throw error;
  return (data ?? []).map((r: { team_id: string }) => r.team_id);
}

/** Admin: assign a form to a team */
export async function assignFormToTeam(formId: string, teamId: string): Promise<void> {
  const { error } = await supabase
    .from('form_teams')
    .insert({ form_id: formId, team_id: teamId });
  // Ignore duplicate error
  if (error && !error.message.includes('duplicate')) throw error;
}

/** Admin: remove a form from a team */
export async function unassignFormFromTeam(formId: string, teamId: string): Promise<void> {
  const { error } = await supabase
    .from('form_teams')
    .delete()
    .eq('form_id', formId)
    .eq('team_id', teamId);
  if (error) throw error;
}

/** Participant: get form IDs accessible via their team */
export async function getFormsForMyTeam(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Step 1: get the user's team ID
  const { data: memberData, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .limit(1);

  if (memberError || !memberData || memberData.length === 0) return [];

  const teamId = memberData[0].team_id;

  // Step 2: get all form IDs assigned to that team
  const { data: formData, error: formError } = await supabase
    .from('form_teams')
    .select('form_id')
    .eq('team_id', teamId);

  if (formError || !formData) return [];

  return formData.map((r: { form_id: string }) => r.form_id);
}
export async function deleteForm(formId: string): Promise<void> {
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId);
  if (error) throw error;
}

export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);
  if (error) throw error;
}

export async function leaveTeam(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('user_id', user.id);
  if (error) throw error;
}
