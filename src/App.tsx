import { useState } from 'react';
import { JobTitleInput } from './components/JobTitleInput';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { InterviewFeedback } from './components/InterviewFeedback';
import type { InterviewState } from './types/interview';

const initialState = (): InterviewState => ({
  jobTitle: '',
  messages: [],
  isLoading: false,
  isComplete: false,
  feedback: null,
  questionCount: 0,
  canGenerateFeedback: false,
});

function App() {

  const [state, setState] = useState<InterviewState>(initialState());
  const [readyForFeedback, setReadyForFeedback] = useState(false);

  const updateState = (updates: Partial<InterviewState>) =>
    setState((prev) => ({ ...prev, ...updates }));


  const handleStartInterview = (jobTitle: string) => {
    updateState({
      jobTitle,
      messages: [
        {
          role: 'assistant',
          content: `Tell me about yourself and why you're interested in the ${jobTitle} position.`,
        },
      ],

      questionCount: 0,
    });
  };

  const fetchFromAPI = async (endpoint: string, body: object) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to fetch from API');
    return response.json();
  };

  const cleanAIResponse = (response: string): string => {
    return response
      // Remove various prefix patterns
      .replace(/^\*\*[^*]+\*\*:?\s*/g, '')  // Removes any **text**: at start
      .replace(/^"(.+)"$/, '$1')  // Remove surrounding quotes
      .replace(/^I understand|^Thank you for sharing|^That's interesting/i, '')  // Remove common starts
      .replace(/\*\*Next Thoughtful Question:\*\*\s*/g, '')  // Remove mid-text markers
      .replace(/\*\*[^*]+\*\*/g, '')  // Remove any remaining **text**
      .trim();
  };

  const handleSubmitResponse = async (message: string) => {
    console.log('Starting submission with:', {
      role: state.jobTitle,
      message,
      questionCount: state.questionCount
    });

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: message }],
      isLoading: true,
    }));

    try {
      const response = await fetch('/api/gemini/start-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: state.jobTitle,
          userResponse: message,
          questionCount: state.questionCount,
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Failed to parse response: ${responseText}`);
      }

      const cleanedMessage = cleanAIResponse(data.message);
      console.log('Cleaned message:', cleanedMessage);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        questionCount: prev.questionCount + 1,
        messages: [...prev.messages, { 
          role: 'assistant', 
          content: cleanedMessage
        }],
      }));

      if (data.isComplete) {
        setReadyForFeedback(true);
      }
    } catch (error) {
      console.error('Detailed error:', error);
      setState((prev) => ({ 
        ...prev, 
        isLoading: false,
        messages: [...prev.messages, { 
          role: 'assistant', 
          content: `Error: ${error.message}. Please try again.` 
        }],
      }));
    }
  };
  
  const handleViewFeedback = async () => {
    try {
      updateState({ isLoading: true });
      const data = await fetchFromAPI('/api/gemini/get-feedback', {
        role: state.jobTitle,
        responses: state.messages,
      });


      updateState({
        isLoading: false,
        isComplete: true,
        feedback: data.feedback,
      });
      setReadyForFeedback(false);
    } catch (error) {
      console.error('Error getting feedback:', error);
      updateState({ isLoading: false });
      alert('Failed to generate feedback. Please try again.');

    }
  };

  const handleRestart = () => {

    setState(initialState());

  };

  const renderContent = () => {
    if (!state.jobTitle) {
      return <JobTitleInput onSubmit={handleStartInterview} />;
    }

    if (state.isComplete && state.feedback) {
      return (
        <InterviewFeedback feedback={state.feedback} onRestart={handleRestart} />
      );
    }


    return (
      <div className="flex h-full w-full max-w-3xl flex-1 flex-col gap-6 rounded-lg bg-white p-6 shadow-lg">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {state.messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} />
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
  questionCount={state.questionCount} 
  maxQuestions={6} 
/>


        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-blue-600 px-6 py-4 text-white">
        <h1 className="text-2xl font-bold">Interview Practice Assistant</h1>
      </header>
      <main className="flex flex-1 flex-col items-center gap-6 p-6">{renderContent()}</main>
    </div>
  );
}

export default App;