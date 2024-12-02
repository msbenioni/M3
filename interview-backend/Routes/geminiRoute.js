const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const NIGERIAN_STYLE_PROMPT = `
You are an AI interviewer speaking in the style of a Nigerian professional.
Your responses should:
1. Use warm, engaging Nigerian expressions and proverbs naturally
2. Maintain professionalism while being culturally rich
3. Include at least one Nigerian proverb or saying in each response
4. Keep responses focused on the job interview context
5. Use phrases like "My friend," "You see," or "Ah ah!" naturally
6. Mix wisdom with gentle humor

Examples of tone:
- "Ah! Just as a farmer knows his crops, tell me how you've grown in your career."
- "My friend, 'Knowledge is like a garden; if it is not cultivated, it cannot be harvested.'"
- "You see, experience is like wine - it gets better with time. Tell me about yours."
`;

router.post('/start-interview', async (req, res) => {
    const { role, userResponse, questionCount = 0 } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Changed from 5 to 3 questions
        if (questionCount >= 3) {
            res.json({ 
                message: "Thank you for your responses! Let me prepare your feedback.",
                isComplete: true 
            });
            return;
        }

        // Construct the prompt
        let prompt;
        if (!userResponse) {
            prompt = `
                ${NIGERIAN_STYLE_PROMPT}
                You are interviewing for the role of ${role}.
                This is a 3-question interview.
                Start the interview with a warm greeting and ask them to tell you about themselves.
                Include a relevant proverb about new beginnings or introductions.
            `;
        } else {
            prompt = `
                ${NIGERIAN_STYLE_PROMPT}
                You are interviewing for the role of ${role}.
                This is question ${questionCount + 1} of 3.
                The candidate's previous response was: "${userResponse}"
                Provide a brief, encouraging comment about their response (with a relevant proverb),
                then ask your next question about their skills, experience, or approach to work.
                Make sure your response feels warm and engaging while remaining professional.
            `;
        }

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ 
            message: response.text(),
            questionCount: questionCount + 1
        });
    } catch (error) {
        console.error('Error connecting to Gemini API:', error.message);
        res.status(500).json({ error: 'Failed to connect to the Gemini API' });
    }
});

// Update the feedback endpoint
router.post('/get-feedback', async (req, res) => {
    const { role, responses } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `
            ${NIGERIAN_STYLE_PROMPT}
            You are providing feedback for a ${role} interview.
            Review these interview responses: ${JSON.stringify(responses)}
            
            Provide detailed interview feedback in this exact JSON structure:
            {
                "overallFeedback": "A warm Nigerian-style general assessment of the interview",
                "strengths": [
                    {
                        "strength": "First key strength point",
                        "proverb": "Related Nigerian proverb"
                    },
                    {
                        "strength": "Second key strength point",
                        "proverb": "Related Nigerian proverb"
                    },
                    {
                        "strength": "Third key strength point",
                        "proverb": "Related Nigerian proverb"
                    }
                ],
                "improvements": [
                    {
                        "improvement": "First area for improvement",
                        "proverb": "Encouraging Nigerian proverb"
                    },
                    {
                        "improvement": "Second area for improvement",
                        "proverb": "Encouraging Nigerian proverb"
                    }
                ],
                "rating": 7,
                "conclusion": "A motivational Nigerian-style closing statement"
            }

            Important:
            - The rating must be a number between 1 and 10
            - Each strength and improvement must have both a main point and a related proverb
            - Format the response as valid JSON
            - Include specific examples from their responses
            - Keep the feedback constructive and encouraging
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        try {
            const feedbackData = JSON.parse(response.text());
            
            // Validate the structure
            if (
                typeof feedbackData.overallFeedback !== 'string' ||
                !Array.isArray(feedbackData.strengths) ||
                !Array.isArray(feedbackData.improvements) ||
                typeof feedbackData.rating !== 'number' ||
                feedbackData.rating < 1 ||
                feedbackData.rating > 10 ||
                typeof feedbackData.conclusion !== 'string' ||
                !feedbackData.strengths.every(s => s.strength && s.proverb) ||
                !feedbackData.improvements.every(i => i.improvement && i.proverb)
            ) {
                throw new Error('Invalid feedback structure');
            }

            res.json({ feedback: feedbackData });
        } catch (parseError) {
            console.error('Parse error:', parseError);
            console.error('Raw response:', response.text());
            res.status(500).json({ 
                error: 'Failed to parse feedback',
                details: parseError.message,
                rawResponse: response.text()
            });
        }
    } catch (error) {
        console.error('Error generating feedback:', error);
        res.status(500).json({ 
            error: 'Failed to generate feedback',
            details: error.message 
        });
    }
});

module.exports = router; 