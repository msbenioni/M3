import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // External CSS file

const JobInterviewApp = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [conversation, setConversation] = useState([]);
    const [userResponse, setUserResponse] = useState('');
    const [interviewOngoing, setInterviewOngoing] = useState(false);

    const startInterview = () => {
        if (!jobTitle.trim()) {
            alert('Please enter a job title!');
            return;
        }
        setInterviewOngoing(true);
        addMessage('AI Interviewer', 'Tell me about yourself.');
    };

    const addMessage = (sender, message) => {
        setConversation(prev => [...prev, { sender, message }]);
    };

    const handleUserResponse = async () => {
        if (!userResponse.trim()) return;

        addMessage('You', userResponse);

        try {
          const response = await axios.post('http://localhost:5000/interview', {
            jobTitle: jobTitle.trim(),
            userResponse: userResponse.trim(),
            conversation: conversation || [],
          });
          

            const aiReply = response.data.reply;
            addMessage('AI Interviewer', aiReply);
            setUserResponse('');
        } catch (error) {
            console.error('Error fetching AI response:', error);
            addMessage('AI Interviewer', 'There was an error processing your response. Try again.');
        }
    };

    return (
        <div className="container">
            <h1>Mock Job Interview</h1>
            {!interviewOngoing && (
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Enter job title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="text-input"
                    />
                    <button onClick={startInterview} className="button">
                        Start Interview
                    </button>
                </div>
            )}
            <div className="conversation-box">
                {conversation.map((msg, index) => (
                    <div key={index} className="message">
                        <strong>{msg.sender}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            {interviewOngoing && (
                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Type your response"
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        className="text-input"
                    />
                    <button onClick={handleUserResponse} className="button">
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
};

export default JobInterviewApp;
