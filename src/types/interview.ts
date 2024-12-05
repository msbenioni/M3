export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface InterviewState {
  jobTitle: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  isLoading: boolean;
  isComplete: boolean;

  feedback: {
    overallFeedback: string;
    strengths: string[];
    improvements: string[];

    rating: number;
    conclusion: string;
  } | null;
  questionCount: number;
}