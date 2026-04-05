export type MessageRole = 'creator' | 'respondent';
export type QuestionStatus = 'unanswered' | 'answered' | 'needs-clarification';
export type TeamQuestionStatus = 'draft' | 'pending' | 'completed';
export type UserRole = 'admin' | 'participant';

// ── Legacy types (admin Google-OAuth flow) ─────────────────────
export interface Team {
  id: string;
  name: string;
  code: string;
  accessKey: string;
  createdBy: string;
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  initial: string;
  assignedFormIds: string[];
  teamId: string | null;
  teamName: string | null;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  senderName: string;
  senderInitial: string;
}

export interface Question {
  id: string;
  formId: string;
  title: string;
  description: string;
  messages: Message[];
  status: QuestionStatus;
  unread: boolean;
  lastActivity: string;
}

export interface Form {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  questionCount: number;
  respondentName: string;
  respondentEmail: string;
  icon: string;
  teamIds?: string[];
}

// ── New types (team-key auth flow) ────────────────────────────

export interface TeamSession {
  teamId: string;
  teamName: string;
}

export interface StandaloneQuestion {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface TeamQuestion {
  id: string;           // team_questions row id
  teamId: string;
  questionId: string;
  title: string;
  description: string;
  status: TeamQuestionStatus;
  assignedAt: string;
  unread?: boolean;
}

export interface TeamMessage {
  id: string;
  teamId: string;
  questionId: string;
  sender: 'admin' | 'participant';
  content: string;
  createdAt: string;
  senderName: string;
  senderInitial: string;
}
