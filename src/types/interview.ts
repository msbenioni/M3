export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface InterviewState {
  jobTitle: string;
  messages: Message[];
  isLoading: boolean;
  isComplete: boolean;
  feedback: string | null;
}