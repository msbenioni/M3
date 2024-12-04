const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyAvE6YeRSefz9ezp6A6UsfKrCGCm7z-Gh0");

let userInput = [];

router.post('/start-interview', async (req, res) => {
    const prompt1 = `
    You are conducting a six-question job interview for the mentioned role. The first 
    question must be "Tell me about yourself", and the remaining six questions must be different topics. 
    Wait for a response before asking the following questions. Ask the questions without numbering them, 
    building on the responses when asking the following question. At the end of the interview, state that the 
    interview is over and give feedback on how the user performed after asking all questions.
    Crucially, you must only ask one question at a time and await a response from the user before proceeding to the next question.
    `;
    const prompt2 = `You are conducting a six-question job interview. The interviewee will first state the job title they are applying for. Your first question MUST be: "Tell me about yourself." After the interviewee provides their answer, you MUST wait for my response before asking the next question. This process will repeat for all six questions. The remaining five questions should be unique and relevant to the stated job title. After the sixth question, provide me with constructive feedback on the interviewee's performance, focusing on the content of their answers and how well they addressed the questions asked. Avoid commenting on grammar or spelling. Crucially, you must only ask one question at a time and await a response from the user before proceeding to the next question.`;

    const { role, userResponse,} = req.body;
    try { 
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        if (userResponse) {
            userInput.push(userResponse);
            console.log(userInput)
        };


        // Construct the prompt
        let prompt;
        if (!userResponse) {
            prompt = `
                The role you will be interviewing me for is ${role}. ${prompt1} 
                Start the interview with a warm greeting and ask them to tell you about themselves.
            `;
        } else if (userInput.length < 6){
            prompt = `
                ${prompt1}
                The previous user responses are: "${userInput}"
                Provide a brief, encouraging comment about their most recent response, then ask your next question.
            `;
        } else {
            prompt = `You are providing feedback for a job interview for ${role}, please provide feedback based on the following responses ${userInput}, format the feedback as a paragraph, 
            there is no need to separate and identify the feedback topics`;
        }

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ 
            message: response.text(),
            // questionCount: questionCount + 1
        });
    } catch (error) {
        console.error('Error connecting to Gemini API:', error.message);
        res.status(500).json({ error: 'Failed to connect to the Gemini API' });
    }
});
// feedback is provided through the initial prompt
// Update the feedback endpoint
// router.post('/get-feedback', async (req, res) => {
//     const { role, responses } = req.body;

//     try {
//         const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
//         const prompt = `
//             ${prompt1}
//             You are providing feedback for a ${role} job interview.
//             Review these interview responses: ${JSON.stringify(responses)}
//             Important:
//             - Each strength and improvement must have a main point
//             - Include specific examples from their responses
//             - Keep the feedback constructive and encouraging
//         `;

//         const result = await model.generateContent(prompt);
//         const response = await result.response;
        
//         try {
//             const feedbackData = JSON.parse(response.text());
            
//             // Validate the structure
//             if (
//                 typeof feedbackData.overallFeedback !== 'string' ||
//                 !Array.isArray(feedbackData.strengths) ||
//                 !Array.isArray(feedbackData.improvements) ||
//                 typeof feedbackData.conclusion !== 'string' ||
//                 !feedbackData.strengths.every(s => s.strength && s.proverb) ||
//                 !feedbackData.improvements.every(i => i.improvement && i.proverb)
//             ) {
//                 throw new Error('Invalid feedback structure');
//             }

//             res.json({ feedback: feedbackData });
//         } catch (parseError) {
//             console.error('Parse error:', parseError);
//             console.error('Raw response:', response.text());
//             res.status(500).json({ 
//                 error: 'Failed to parse feedback',
//                 details: parseError.message,
//                 rawResponse: response.text()
//             });
//         }
//     } catch (error) {
//         console.error('Error generating feedback:', error);
//         res.status(500).json({ 
//             error: 'Failed to generate feedback',
//             details: error.message 
//         });
//     }
// });

module.exports = router; 