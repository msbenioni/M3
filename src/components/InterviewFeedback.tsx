import React from 'react';
import { CheckCircle, RefreshCcw } from 'lucide-react';

interface InterviewFeedbackProps {
  feedback: string;
  onRestart: () => void;
}

export function InterviewFeedback({ feedback, onRestart }: InterviewFeedbackProps) {
  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow-lg">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Interview Complete</h2>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Feedback & Suggestions</h3>
        <div className="rounded-lg bg-gray-50 p-4 text-gray-700">
          {feedback}
        </div>
      </div>
      <button
        onClick={onRestart}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <RefreshCcw className="h-5 w-5" />
        Start New Interview
      </button>
    </div>
  );
}