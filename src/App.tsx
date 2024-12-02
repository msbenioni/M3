import React, { useState } from 'react';
import { JobTitleInput } from './components/JobTitleInput';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { InterviewFeedback } from './components/InterviewFeedback';
import type { InterviewState } from './types/interview';

function App() {
  const [state, setState] = useState<InterviewState>({
    jobTitle: '',
    messages: [],
    isLoading: false,
    isComplete: false,
    feedback: null,
  });

  const handleStartInterview = (jobTitle: string) => {
    setState({
      jobTitle,
      messages: [
        {
          role: 'assistant',
          content: 'Tell me about yourself and why you\'re interested in the ' + jobTitle + ' position.',
        },
      ],
      isLoading: false,
      isComplete: false,
      feedback: null,
    });
  };

  const handleSubmitResponse = async (message: string) => {
    // TODO: Implement Gemini API integration
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: message }],
      isLoading: true,
    }));

    // Temporary mock response
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content: 'Thank you for your response. What would you say are your greatest strengths?',
          },
        ],
      }));
    }, 1000);
  };

  const handleRestart = () => {
    setState({
      jobTitle: '',
      messages: [],
      isLoading: false,
      isComplete: false,
      feedback: null,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-blue-600 px-6 py-4 text-white">
        <h1 className="text-2xl font-bold">Interview Practice Assistant</h1>
      </header>

      <main className="flex flex-1 flex-col items-center gap-6 p-6">
        {!state.jobTitle && (
          <JobTitleInput onSubmit={handleStartInterview} />
        )}

        {state.jobTitle && !state.isComplete && (
          <div className="flex h-full w-full max-w-3xl flex-1 flex-col gap-6 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex-1 space-y-4 overflow-y-auto">
              {state.messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                />
              ))}
            </div>

            <ChatInput
              onSubmit={handleSubmitResponse}
              disabled={state.isLoading}
            />
          </div>
        )}

        {state.isComplete && state.feedback && (
          <InterviewFeedback
            feedback={state.feedback}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}

export default App;