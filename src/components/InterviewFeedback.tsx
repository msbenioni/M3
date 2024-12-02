import React from 'react';
import { CheckCircle, RefreshCcw, Star } from 'lucide-react';

interface InterviewFeedback {
  feedback: {
    overallFeedback: string;
    strengths: Array<{ strength: string; proverb: string }>;
    improvements: Array<{ improvement: string; proverb: string }>;
    rating: number;
    conclusion: string;
  };
  onRestart: () => void;
}

export function InterviewFeedback({ feedback, onRestart }: InterviewFeedback) {
  return (
    <div className="w-full rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Interview Feedback</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-xl font-semibold">Overall Feedback</h3>
          <p className="text-gray-700">{feedback.overallFeedback}</p>
        </div>

        <div>
          <h3 className="mb-2 text-xl font-semibold">Strengths</h3>
          <ul className="list-inside list-disc space-y-2">
            {feedback.strengths.map((item, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-medium">{item.strength}</span>
                <br />
                <span className="italic text-gray-600">"{item.proverb}"</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-xl font-semibold">Areas for Improvement</h3>
          <ul className="list-inside list-disc space-y-2">
            {feedback.improvements.map((item, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-medium">{item.improvement}</span>
                <br />
                <span className="italic text-gray-600">"{item.proverb}"</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-xl font-semibold">Rating</h3>
          <p className="text-gray-700">{feedback.rating}/10</p>
        </div>

        <div>
          <h3 className="mb-2 text-xl font-semibold">Conclusion</h3>
          <p className="text-gray-700">{feedback.conclusion}</p>
        </div>

        <button
          onClick={onRestart}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Start New Interview
        </button>
      </div>
    </div>
  );
}