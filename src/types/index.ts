export type MessageRole = 'creator' | 'respondent';
export type QuestionStatus = 'unanswered' | 'answered' | 'needs-clarification';
export type UserRole = 'admin' | 'participant';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  initial: string;
  /** form IDs this participant is assigned to (ignored for admin) */
  assignedFormIds: string[];
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
}
