import { supabase } from '../lib/supabase';
import type { Form, Question, Message } from '../types';

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
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    senderName,
    senderInitial: senderName[0]?.toUpperCase() ?? '?',
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
  const { error } = await supabase
    .from('questions')
    .update(patch)
    .eq('id', questionId);
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
