const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// let userInput = [];

router.post('/start-interview', async (req, res) => {
    const { role, userResponse,} = req.body;
    const prompt1 = `
    I would like you to carry out a practice job interview with me for the role of ${role}. Can you then give me a
     job interview for the role stated so I can response to you after each question. You need to ask at least 
     6 questions with the first question being "Tell me about yourself". Do not mention that it is a practice 
     interview. Please ask the questions without numbering them, and after asking the initial question build on
      my response when asking the following question. At the end of the interview, mention the interview is over 
      instead of the number of questions being over and give feedback on how I performed after
      asking all questions.
    `;
//  questionCount = 0 
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // if (userResponse) {
        //     userInput.push(userResponse);
        // };
        // Changed from 5 to 3 questions
        // if (questionCount >= 3) {
        //     res.json({ 
        //         message: "Thank you for your responses! Let me prepare your feedback.",
        //         isComplete: true 
        //     });
        //     return;
        // }

        // Construct the prompt
        let prompt;
        if (!userResponse) {
            prompt = `
                ${prompt1}
                Start the interview with a warm greeting and ask them to tell you about themselves.
            `;
        } else {
            prompt = `
                ${prompt1}
                The previous response was: "${userResponse}"
                Provide a brief, encouraging comment about their response, then ask your next question.
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
            You are providing feedback for a ${role} job interview.
            Review these interview responses: ${JSON.stringify(responses)}
            Important:
            - Each strength and improvement must have a main point
            - Include specific examples from their responses
            - Keep the feedback constructive and encouraging
        `;

// extra request content from Jasmin's Nigerian-style interviewer.
        
        // Provide detailed interview feedback in this exact JSON structure:
        // {
        //     "overallFeedback": "A warm Nigerian-style general assessment of the interview",
        //     "strengths": [
        //         {
        //             "strength": "First key strength point",
        //             "proverb": "Related Nigerian proverb"
        //         },
        //         {
        //             "strength": "Second key strength point",
        //             "proverb": "Related Nigerian proverb"
        //         },
        //         {
        //             "strength": "Third key strength point",
        //             "proverb": "Related Nigerian proverb"
        //         }
        //     ],
        //     "improvements": [
        //         {
        //             "improvement": "First area for improvement",
        //             "proverb": "Encouraging Nigerian proverb"
        //         },
        //         {
        //             "improvement": "Second area for improvement",
        //             "proverb": "Encouraging Nigerian proverb"
        //         }
        //     ],
        //     "rating": 7,
        //     "conclusion": "A motivational Nigerian-style closing statement"
        // }

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