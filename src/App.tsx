import { useState } from 'react';
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
    canGenerateFeedback: false,
    feedback: null,
    questionCount: 0
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
      canGenerateFeedback: false,
      feedback: null,
      questionCount: 0
    });
  };

  const handleGenerateFeedback = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const feedbackResponse = await fetch('http://localhost:3000/api/interview/get-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'unique-session-id',
        }),
      });

      if (!feedbackResponse.ok) {
        const errorData = await feedbackResponse.json();
        throw new Error(errorData.message || 'Failed to get feedback');
      }

      const feedbackData = await feedbackResponse.json();

      setState(prev => ({
        ...prev,
        isLoading: false,
        feedback: feedbackData.feedback,
      }));
    } catch (error) {
      console.error('Error generating feedback:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleSubmitResponse = async (message: string) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: message }],
      isLoading: true,
    }));

    try {
      const response = await fetch('http://localhost:3000/api/interview/start-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: state.jobTitle,
          userResponse: message,
          questionCount: state.questionCount,
          sessionId: 'unique-session-id',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response from server');
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [
          ...prev.messages,
          { role: 'assistant', content: data.message },
        ],
        questionCount: data.questionCount,
        isComplete: data.isComplete,
        canGenerateFeedback: data.canGenerateFeedback || false,
      }));
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content: `Error: ${errorMessage}`,
          },
        ],
      }));
    }
  };

  const handleRestart = () => {
    setState({
      jobTitle: '',
      messages: [],
      isLoading: false,
      isComplete: false,
      canGenerateFeedback: false,
      feedback: null,
      questionCount: 0
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

        {state.jobTitle && !state.feedback && (
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

            {state.canGenerateFeedback ? (
              <button
                onClick={handleGenerateFeedback}
                disabled={state.isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {state.isLoading ? 'Generating Feedback...' : 'Generate Interview Feedback'}
              </button>
            ) : (
              !state.isComplete && (
                <ChatInput
                  onSubmit={handleSubmitResponse}
                  disabled={state.isLoading}
                />
              )
            )}
          </div>
        )}

        {state.feedback && (
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