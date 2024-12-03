const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini API
let genAI;
try {
    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is undefined in environment');
    } else {
        // Clean the API key and log its details
        const cleanApiKey = process.env.GEMINI_API_KEY.trim();
        console.log('Original API key length:', process.env.GEMINI_API_KEY.length);
        console.log('Cleaned API key length:', cleanApiKey.length);
        
        genAI = new GoogleGenerativeAI(cleanApiKey);
    }
} catch (error) {
    console.error('Error initializing Gemini:', error);
}

const TONY_ROBBINS_STYLE_PROMPT = `
You are an AI interviewer speaking in the style of Tony Robbins. Your responses should:
1. Be motivational, empowering, and action-oriented.
2. Focus on asking reflective questions that help the candidate think deeply about their skills and experiences.
3. Always refer to the user's previous answers when framing the next question.
4. Highlight strengths and opportunities for growth with actionable insights.
5. Use a warm, encouraging tone.

Here are the interview topics you can use to generate your questions:
- Personal Background: Ask about the candidate's story, motivations, and goals.
- Job-Specific Skills: Focus on the technical or practical skills required for the role.
- Work Experience: Explore past achievements, challenges, and responsibilities.
- Problem-Solving: Ask about how they approach complex problems or decisions.
- Teamwork and Collaboration: Discuss how they work with others or manage conflicts.
- Adaptability and Learning: Examine how they handle change or acquire new skills.
- Cultural Fit: Explore their alignment with company values and team dynamics.
- Goals and Ambitions: Understand their long-term vision and professional aspirations.
- Situational Questions: Use real-world scenarios to assess behavior and decision-making.

For each question, randomly select one topic from the above list and tailor it to the user's role and previous response.
`;

let interviewData = {}; // Object to store user responses during the session

router.post('/start-interview', async (req, res) => {
    console.log('Environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        GEMINI_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
        GEMINI_KEY_LENGTH: process.env.GEMINI_API_KEY?.length
    });

    const { role, userResponse, questionCount = 0, sessionId } = req.body;

    // Add this debug log (make sure to not commit this to production!)
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length);

    // Validate required fields
    if (!role || !sessionId) {
        return res.status(400).json({ 
            error: 'Missing required fields', 
            details: 'Role and sessionId are required' 
        });
    }

    // Initialize session data if new session
    if (!interviewData[sessionId]) {
        interviewData[sessionId] = {
            role,
            responses: [],
        };
    }

    try {
        // Verify API key exists
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Store the final response if this is the last question
        if (questionCount === 6 && userResponse) {
            interviewData[sessionId].responses.push(userResponse);
            return res.json({
                message: "Thank you for participating in this interview! Your responses have been thoughtfully recorded. Click below to generate your personalized feedback.",
                isComplete: true,
                canGenerateFeedback: true
            });
        }

        // Check if we've reached the end of questions (but haven't received final response)
        if (questionCount >= 6) {
            return res.json({
                message: "Great job completing the interview! Let me prepare your feedback.",
                isComplete: true
            });
        }

        let prompt;
        if (!userResponse) {
            prompt = `
                ${TONY_ROBBINS_STYLE_PROMPT}
                You are interviewing for the role of ${role}.
                Provide a warm greeting and ask: "Tell me about yourself and what drives you in this field."
                Frame it as an opportunity for the candidate to set the tone for the interview.
                Important: Do not include any formatting markers or labels in your response (like **Motivational Comment** or **Next Question**).
                Simply write your response in a natural, conversational way.
            `;
        } else {
            interviewData[sessionId].responses.push(userResponse);

            prompt = `
                ${TONY_ROBBINS_STYLE_PROMPT}
                You are interviewing for the role of ${role}.
                This is question ${questionCount + 1} of 6.
                Based on the candidate's previous response: "${userResponse}", provide an empowering comment followed by your next question.
                Important: Write your response naturally without any formatting markers or labels.
                Do not include phrases like **Motivational Comment** or **Topic**.
                Simply write your response as a flowing conversation.
            `;
        }

        console.log('Sending prompt to Gemini API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log('Received response from Gemini API');

        return res.json({
            message: response.text(),
            questionCount: questionCount + 1,
        });
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            details: error.details || 'No additional details'
        });
        
        return res.status(500).json({ 
            error: 'Failed to process interview request',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

router.post('/get-feedback', async (req, res) => {
    const { sessionId } = req.body;

    if (!interviewData[sessionId] || interviewData[sessionId].responses.length < 6) {
        res.status(400).json({ error: "Incomplete interview session" });
        return;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const responses = interviewData[sessionId].responses;

        const prompt = `
            ${TONY_ROBBINS_STYLE_PROMPT}
            You are providing feedback for a ${interviewData[sessionId].role} interview.
            Review these interview responses: ${JSON.stringify(responses)}
            
            Provide feedback in this exact JSON structure:
            {
                "overallFeedback": "Tony Robbins-style overall assessment of the interview, focusing on strengths, potential, and action steps.",
                "strengths": [
                    {
                        "strength": "First key strength based on responses",
                        "action": "Empowering action step to build on this strength"
                    },
                    {
                        "strength": "Second key strength based on responses",
                        "action": "Empowering action step to build on this strength"
                    }
                ],
                "improvements": [
                    {
                        "improvement": "First area for improvement",
                        "action": "Motivational action step to address this area"
                    },
                    {
                        "improvement": "Second area for improvement",
                        "action": "Motivational action step to address this area"
                    }
                ],
                "rating": 8,
                "conclusion": "A motivational closing statement that inspires the candidate to take action on their growth opportunities."
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        try {
            const feedbackData = JSON.parse(response.text());
            res.json({ feedback: feedbackData });
        } catch (parseError) {
            console.error('Parse error:', parseError);
            res.status(500).json({
                error: 'Failed to parse feedback',
                details: parseError.message,
                rawResponse: response.text(),
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to generate feedback',
            details: error.message,
        });
    }
});

module.exports = router;