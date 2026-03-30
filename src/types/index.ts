export type MessageRole = 'creator' | 'respondent';
export type QuestionStatus = 'unanswered' | 'answered' | 'needs-clarification';
export type UserRole = 'admin' | 'participant';

// ── NEW: Team ──────────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  code: string;
  createdBy: string;
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  initial: string;
  assignedFormIds: string[];
  // NEW: null means participant hasn't joined a team yet
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
  teamIds?: string[];  // NEW: teams this form is assigned to
}
