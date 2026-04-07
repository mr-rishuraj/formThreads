import { supabase } from '../lib/supabase';
import type { TeamMessage } from '../types';

type DBMsg = {
  id: string;
  team_id: string;
  question_id: string;
  sender: 'admin' | 'participant';
  content: string;
  created_at: string;
};

function mapMessage(db: DBMsg, teamName: string): TeamMessage {
  const isAdmin = db.sender === 'admin';
  const name = isAdmin ? 'Admin' : teamName;
  return {
    id: db.id,
    teamId: db.team_id,
    questionId: db.question_id,
    sender: db.sender,
    content: db.content,
    createdAt: db.created_at,
    senderName: name,
    senderInitial: name[0]?.toUpperCase() ?? '?',
  };
}

export async function sendMessage(
  teamId: string,
  questionId: string,
  sender: 'admin' | 'participant',
  content: string
): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    team_id: teamId,
    question_id: questionId,
    sender,
    content: content.trim(),
  });
  if (error) throw error;
}

export type ExportRow = {
  teamName: string;
  teamCode: string;
  questionTitle: string;
  sender: string;
  message: string;
  submittedAt: string;
};

export async function getAllMessagesForExport(): Promise<ExportRow[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      sender,
      content,
      created_at,
      teams ( name, code ),
      questions ( title )
    `)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    teamName:      row.teams?.name     ?? 'Unknown Team',
    teamCode:      row.teams?.code     ?? '',
    questionTitle: row.questions?.title ?? 'Unknown Question',
    sender:        row.sender === 'admin' ? 'Admin' : row.teams?.name ?? 'Team',
    message:       row.content ?? '',
    submittedAt:   row.created_at
      ? new Date(row.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : '',
  }));
}

export async function getMessages(
  teamId: string,
  questionId: string,
  teamName: string = 'Team'
): Promise<TeamMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, team_id, question_id, sender, content, created_at')
    .eq('team_id', teamId)
    .eq('question_id', questionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as DBMsg[]).map(db => mapMessage(db, teamName));
}
