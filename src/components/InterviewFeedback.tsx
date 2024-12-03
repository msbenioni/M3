import { CheckCircle, RefreshCcw } from 'lucide-react';

interface InterviewFeedbackProps {
  feedback: {
    overallFeedback: string;
    strengths: Array<{ strength: string; action: string }>;
    improvements: Array<{ improvement: string; action: string }>;
    rating: number;
    conclusion: string;
  };
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
        <div>
          <h3 className="text-lg font-medium">Overall Feedback</h3>
          <p className="mt-2 text-gray-700">{feedback.overallFeedback}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Key Strengths</h3>
          <ul className="mt-2 space-y-2">
            {feedback.strengths.map((item, index) => (
              <li key={index} className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium text-gray-800">{item.strength}</p>
                <p className="mt-1 text-gray-600">Action step: {item.action}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-medium">Areas for Growth</h3>
          <ul className="mt-2 space-y-2">
            {feedback.improvements.map((item, index) => (
              <li key={index} className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium text-gray-800">{item.improvement}</p>
                <p className="mt-1 text-gray-600">Action step: {item.action}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-medium">Overall Rating</h3>
          <p className="mt-2 text-gray-700">{feedback.rating}/10</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Final Thoughts</h3>
          <p className="mt-2 text-gray-700">{feedback.conclusion}</p>
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