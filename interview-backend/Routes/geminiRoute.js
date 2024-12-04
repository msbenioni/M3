const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateRole, validateQuestionCount, validateResponses, generatePrompt } = require('./utils');
const SENIOR_PROFESSIONAL_PROMPT = require('./prompts');
const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST: Start Interview
router.post('/start-interview', async (req, res) => {
    const { role, userResponse, questionCount = 0 } = req.body;

    try {
        validateRole(role);
        validateQuestionCount(questionCount);

        if (questionCount >= 6) {
            return res.json({ 
                message: "Interview completed. Preparing feedback.",
                isComplete: true 
            });
        }

        const prompt = generatePrompt(role, userResponse, questionCount, SENIOR_PROFESSIONAL_PROMPT);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ message: response, questionCount: questionCount + 1 });
    } catch (error) {
        console.error('Error starting interview:', error.message);
        res.status(500).json({ error: 'Failed to start interview', details: error.message });
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
            Provide professional feedback as a JSON object with strengths, improvements, and a rating.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const feedback = JSON.parse(result.response.text());

        res.json({ feedback });
    } catch (error) {
        console.error('Error generating feedback:', error.message);
        res.status(500).json({ error: 'Failed to generate feedback', details: error.message });
    }
});

module.exports = router;
