export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Feedback {
  overallFeedback: string;
  strengths: Array<{ strength: string; action: string }>;
  improvements: Array<{ improvement: string; action: string }>;
  rating: number;
  conclusion: string;
}

export interface InterviewState {
  jobTitle: string;
  messages: Message[];
  isLoading: boolean;
  isComplete: boolean;
  canGenerateFeedback: boolean;
  feedback: Feedback | null;
  questionCount: number;
}