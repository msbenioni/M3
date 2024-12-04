import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  questionCount: number;
  maxQuestions: number;
}

export function ChatInput({ onSubmit, disabled, questionCount, maxQuestions }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const WORD_LIMIT = 256;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/).filter((word) => word.length > 0); // Split into words and filter out empty strings
    setInput(value);
    setWordCount(words.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && wordCount <= WORD_LIMIT) {
      onSubmit(input);
      setInput('');
      setWordCount(0);
    }
  };

  // Calculate progress fraction
  const progress = Math.min((questionCount / maxQuestions) * 100, 100); // Cap at 100%

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative w-full h-4 rounded-lg bg-gray-300">
        <div
          className="absolute top-0 left-0 h-4 rounded-lg bg-blue-600 transition-width"
          style={{ width: `${progress}%` }}
        ></div>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
          {questionCount}/{maxQuestions} Questions
        </span>
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="mt-4 flex w-full gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="Type your response..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={disabled || !input.trim() || wordCount > WORD_LIMIT}
          className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      {/* Word Count */}
      <div className="mt-1 text-right text-sm">
        <span className={wordCount > WORD_LIMIT ? 'text-red-500' : 'text-gray-500'}>
          {wordCount}/{WORD_LIMIT} words
        </span>
      </div>
    </div>
  );
}
