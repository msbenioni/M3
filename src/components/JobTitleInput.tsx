import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';

interface JobTitleInputProps {
  onSubmit: (jobTitle: string) => void;
}

export function JobTitleInput({ onSubmit }: JobTitleInputProps) {
  const [jobTitle, setJobTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTitle.trim()) {
      onSubmit(jobTitle.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="jobTitle"
          className="block text-sm font-medium text-gray-700"
        >
          What position would you like to practice interviewing for?
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Software Engineer"
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!jobTitle.trim()}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Start Interview
      </button>
    </form>
  );
}