export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface InterviewState {
  jobTitle: string;
  messages: Message[];
  isLoading: boolean;
  isComplete: boolean;
  feedback: {
    overallFeedback: string;
    strengths: Array<{ strength: string; proverb: string }>;
    improvements: Array<{ improvement: string; proverb: string }>;
    rating: number;
    conclusion: string;
  } | null;
  questionCount: number;
}