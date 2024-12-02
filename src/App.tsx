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
    questionCount: 0
  });

  const [readyForFeedback, setReadyForFeedback] = useState(false);

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
      questionCount: 0
    });
  };

  const handleSubmitResponse = async (message: string) => {
    console.log('Current question count:', state.questionCount);

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: message }],
      isLoading: true,
    }));

    try {
      const response = await fetch('/api/gemini/start-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: state.jobTitle,
          userResponse: message,
          questionCount: state.questionCount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();
      console.log('Response from API:', data);
      
      if (data.isComplete) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          messages: [
            ...prev.messages,
            { role: 'assistant', content: data.message }
          ],
        }));
        setReadyForFeedback(true);
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        questionCount: prev.questionCount + 1,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content: data.message,
          },
        ],
      }));
    } catch (error) {
      console.error('Error:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const handleRestart = () => {
    setState({
      jobTitle: '',
      messages: [],
      isLoading: false,
      isComplete: false,
      feedback: null,
      questionCount: 0
    });
  };

  const getFeedback = async (messages: Array<{ role: string; content: string }>) => {
    try {
      console.log('Getting feedback for messages:', messages);
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/gemini/get-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: state.jobTitle,
          responses: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get feedback: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw feedback data:', data);
      
      if (!data.feedback) {
        throw new Error('No feedback data received');
      }

      setState(prev => ({
        ...prev,
        isComplete: true,
        isLoading: false,
        feedback: data.feedback,
      }));
    } catch (error) {
      console.error('Error getting feedback:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      alert('Failed to generate feedback. Please try again.');
    }
  };

  const handleViewFeedback = async () => {
    try {
      console.log('Starting feedback generation...');
      setState(prev => ({ ...prev, isLoading: true }));
      await getFeedback(state.messages);
      setReadyForFeedback(false);
      console.log('Feedback generation complete');
    } catch (error) {
      console.error('Error in handleViewFeedback:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
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

            {readyForFeedback ? (
              <button
                onClick={handleViewFeedback}
                disabled={state.isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {state.isLoading ? 'Generating Feedback...' : 'View Interview Feedback'}
              </button>
            ) : (
              <ChatInput
                onSubmit={handleSubmitResponse}
                disabled={state.isLoading}
              />
            )}
          </div>
        )}

        {state.isComplete && state.feedback && (
          <div className="w-full max-w-3xl">
            <InterviewFeedback
              feedback={state.feedback}
              onRestart={handleRestart}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;