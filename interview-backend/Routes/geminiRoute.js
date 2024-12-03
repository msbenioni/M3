const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const GARY_V_STYLE_PROMPT = `
You are an AI interviewer speaking in the style of Gary Vaynerchuk (Gary V).
Your responses should:
1. Be high-energy, motivational, and practical.
2. Focus on direct, honest feedback while being inspiring and optimistic.
3. Use a conversational tone with phrases like "Look," "Here’s the thing," "You’ve got this,"
4. Incorporate business wisdom and practical advice.
5. Relate answers to the real world with examples or analogies.

Examples of tone:
- "Look, it’s all about the execution. You can talk all day, but I want to know: What’s your plan for making it happen?"
- "Here’s the thing: You’ve got to be self-aware. Tell me, how do you double down on what you're great at?"
- "You’ve got this! Think of it like building a brand—consistency and patience are key."
`;

router.post('/start-interview', async (req, res) => {
    const { role, userResponse, questionCount = 0 } = req.body;

    try {
        console.log('Received request:', { role, userResponse, questionCount });
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Changed from 5 to 3 questions
        if (questionCount >= 3) {
            res.json({ 
                message: "That's a wrap! Let me put together some feedback for you.",
                isComplete: true 
            });
            return;
        }

        // Construct the prompt
        let prompt;
        if (!userResponse) {
            prompt = `
                ${GARY_V_STYLE_PROMPT}
                You are interviewing for the role of ${role}.
                This is a 3-question interview.
                Start the interview with a warm greeting and ask them to tell you about themselves.
                Make it motivational, using an example like, "Think of this like your elevator pitch. How are you selling YOU?"
            `;
        } else {
            prompt = `
                ${GARY_V_STYLE_PROMPT}
                You are interviewing for the role of ${role}.
                This is question ${questionCount + 1} of 3.
                The candidate's previous response was: "${userResponse}"
                Provide a quick, energetic comment about their response (like, "That’s great, but how do you take it to the next level?").
                Then ask a follow-up question focused on their skills, experience, or execution strategy.
                Keep the tone enthusiastic and forward-thinking.
            `;
        }

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log('Generated response:', response.text());
        
        res.json({ 
            message: response.text(),
            questionCount: questionCount + 1
        });
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            error: 'Failed to connect to the Gemini API',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update the feedback endpoint
router.post('/get-feedback', async (req, res) => {
    const { role, responses } = req.body;

    try {
        console.log('Received feedback request for role:', role);
        console.log('Responses:', JSON.stringify(responses, null, 2));
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `
            ${GARY_V_STYLE_PROMPT}
            You are providing feedback for a ${role} interview.
            Review these interview responses: ${JSON.stringify(responses)}
            
            Provide detailed interview feedback in this exact JSON structure:
            {
                "overallFeedback": "High-energy, motivational overall assessment of the interview",
                "strengths": [
                    {
                        "strength": "First key strength point",
                        "proverb": "Related practical advice or analogy"
                    },
                    {
                        "strength": "Second key strength point",
                        "proverb": "Related practical advice or analogy"
                    },
                    {
                        "strength": "Third key strength point",
                        "proverb": "Related practical advice or analogy"
                    }
                ],
                "improvements": [
                    {
                        "improvement": "First area for improvement",
                        "proverb": "Encouraging example or motivational advice"
                    },
                    {
                        "improvement": "Second area for improvement",
                        "proverb": "Encouraging example or motivational advice"
                    }
                ],
                "rating": 7,
                "conclusion": "Inspirational Gary V-style closing statement"
            }

            Important:
            - The rating must be a number between 1 and 10
            - Each strength and improvement must include practical advice
            - Format the response as valid JSON
            - Keep the feedback honest, constructive, and motivational
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();
        
        console.log('Raw AI response:', rawText);
        
        try {
            const feedbackData = JSON.parse(rawText);
            
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
                console.error('Invalid feedback structure:', feedbackData);
                throw new Error('Invalid feedback structure');
            }

            res.json({ feedback: feedbackData });
            
        } catch (parseError) {
            console.error('Parse error:', parseError.message);
            console.error('Raw text that failed to parse:', rawText);
            res.status(500).json({ 
                error: 'Failed to parse feedback',
                details: parseError.message,
                rawResponse: rawText
            });
        }
    } catch (error) {
        console.error('Error in feedback generation:', error);
        res.status(500).json({ 
            error: 'Failed to generate feedback',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
