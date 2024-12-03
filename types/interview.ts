export interface InterviewState {
  jobTitle: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  isLoading: boolean;
  isComplete: boolean;
  canGenerateFeedback: boolean;
  feedback: {
    overallFeedback: string;
    strengths: Array<{ strength: string; action: string }>;
    improvements: Array<{ improvement: string; action: string }>;
    rating: number;
    conclusion: string;
  } | null;
  questionCount: number;
} 