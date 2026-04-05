import { supabase } from '../lib/supabase';
import type { StandaloneQuestion, TeamQuestion, TeamQuestionStatus } from '../types';

// ── Standalone questions (admin creates) ─────────────────────

export async function createQuestion(
  title: string,
  description: string
): Promise<StandaloneQuestion> {
  const { data, error } = await supabase
    .from('questions')
    .insert({ title: title.trim(), description: description.trim() })
    .select('id, title, description, created_at')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? '',
    createdAt: data.created_at?.split('T')[0] ?? '',
  };
}

export async function getQuestions(): Promise<StandaloneQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, title, description, created_at')
    .is('form_id', null)           // standalone questions only
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((q: any) => ({
    id: q.id,
    title: q.title,
    description: q.description ?? '',
    createdAt: q.created_at?.split('T')[0] ?? '',
  }));
}

export async function updateQuestion(
  questionId: string,
  patch: { title?: string; description?: string }
): Promise<void> {
  const { error } = await supabase.from('questions').update(patch).eq('id', questionId);
  if (error) throw error;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase.from('questions').delete().eq('id', questionId);
  if (error) throw error;
}

// ── Team assignment ───────────────────────────────────────────

export async function assignQuestionToTeams(
  questionId: string,
  teamIds: string[]
): Promise<void> {
  if (teamIds.length === 0) return;
  const rows = teamIds.map(team_id => ({
    team_id,
    question_id: questionId,
    status: 'pending',
  }));
  const { error } = await supabase
    .from('team_questions')
    .upsert(rows, { onConflict: 'team_id,question_id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function unassignQuestionFromTeam(
  questionId: string,
  teamId: string
): Promise<void> {
  const { error } = await supabase
    .from('team_questions')
    .delete()
    .eq('question_id', questionId)
    .eq('team_id', teamId);
  if (error) throw error;
}

// ── Fetch team questions ──────────────────────────────────────

export async function getTeamQuestions(teamId: string): Promise<TeamQuestion[]> {
  const { data, error } = await supabase
    .from('team_questions')
    .select(`
      id,
      team_id,
      question_id,
      status,
      assigned_at,
      questions ( title, description )
    `)
    .eq('team_id', teamId)
    .order('assigned_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    teamId: row.team_id,
    questionId: row.question_id,
    title: row.questions?.title ?? 'Untitled',
    description: row.questions?.description ?? '',
    status: row.status as TeamQuestionStatus,
    assignedAt: row.assigned_at?.split('T')[0] ?? '',
    unread: false,
  }));
}

export async function updateTeamQuestionStatus(
  teamQuestionId: string,
  status: TeamQuestionStatus
): Promise<void> {
  const { error } = await supabase
    .from('team_questions')
    .update({ status })
    .eq('id', teamQuestionId);
  if (error) throw error;
}

// ── Get all team_questions for admin (across all teams) ───────

export async function getAllTeamQuestions(): Promise<TeamQuestion[]> {
  const { data, error } = await supabase
    .from('team_questions')
    .select(`
      id,
      team_id,
      question_id,
      status,
      assigned_at,
      questions ( title, description )
    `)
    .order('assigned_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    teamId: row.team_id,
    questionId: row.question_id,
    title: row.questions?.title ?? 'Untitled',
    description: row.questions?.description ?? '',
    status: row.status as TeamQuestionStatus,
    assignedAt: row.assigned_at?.split('T')[0] ?? '',
    unread: false,
  }));
}

export async function getAssignedTeamIds(questionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('team_questions')
    .select('team_id')
    .eq('question_id', questionId);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.team_id);
}
