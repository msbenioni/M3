const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const { validateRole, validateResponses } = require('./utils');
const SENIOR_PROFESSIONAL_PROMPT = `
    You are an AI interviewer providing thoughtful career advice with the tone of a seasoned mentor.
    Your responses should focus on:
    - Career growth, leadership, and decision-making.
    - Constructive and actionable feedback.
    - Encouraging reflection and professional insight.
`;
const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST: Start Interview
router.post('/start-interview', async (req, res) => {
    const { role, userResponse, questionCount = 0 } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        let prompt;
        if (!userResponse) {
            prompt = `
                ${SENIOR_PROFESSIONAL_PROMPT}
                You are interviewing for the role of ${role}.
                Ask ONE clear, focused question about their background and interest in the role.
                Keep the question concise and specific.
                Do not ask multiple questions in one response.
            `;
        } else {
            prompt = `
                ${SENIOR_PROFESSIONAL_PROMPT}
                You are interviewing for the role of ${role}.
                This is question ${questionCount + 1} of 3.
                Based on their previous response: "${userResponse}"
                
                Provide a brief, encouraging comment followed by ONE focused follow-up question.
                The question should be specific and require a detailed response.
                Do not include multiple questions or bullet points.
                Focus on one aspect at a time.
            `;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ 
            message: response.text(),
            questionCount: questionCount + 1
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to connect to the Gemini API' });
    }
});

// POST: Get Feedback
router.post('/get-feedback', async (req, res) => {
    const { role, responses } = req.body;

    try {
        validateRole(role);
        validateResponses(responses);

        const prompt = `
            ${SENIOR_PROFESSIONAL_PROMPT}
            You are generating feedback for a ${role} interview. 
            Responses: ${JSON.stringify(responses)}
            Please provide feedback in the following JSON format:
            {
                "overallFeedback": "...",
                "strengths": [{"strength": "...", "action": "..."}],
                "improvements": [{"improvement": "...", "action": "..."}],
                "rating": number between 1-10,
                "conclusion": "..."
            }
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        
        // Safely extract and parse the response
        const response = result.response;
        if (!response) {
            throw new Error('No response received from Gemini API');
        }

        const feedbackText = response.text();
        if (!feedbackText) {
            throw new Error('Empty response from Gemini API');
        }

        let feedback;
        try {
            feedback = JSON.parse(feedbackText);
        } catch (parseError) {
            console.error('Failed to parse feedback:', feedbackText);
            throw new Error('Invalid feedback format received');
        }

        res.json({ feedback });
    } catch (error) {
        console.error('Error in get-feedback:', error);
        res.status(500).json({ 
            error: 'Failed to generate feedback', 
            details: error.message || 'Unknown error occurred'
        });
    }
});

module.exports = router;