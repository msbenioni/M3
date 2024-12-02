const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/interview', async (req, res) => {
    const { jobTitle, userResponse, conversation } = req.body;
  
    try {
      const prompt = `You are an AI interviewer for the role of ${jobTitle}.
      Conduct a dynamic mock interview. Use the following rules:
      - Tailor questions based on the user's responses.
      - Ask a total of six questions.
      - For each question, focus on different skills:
        1. Introduction and overview of experience.
        2. Problem-solving skills.
        3. Technical skills related to ${jobTitle}.
        4. Teamwork and collaboration.
        5. Leadership or conflict resolution.
        6. Career aspirations and fit for the role.
        7. Provide constructive feedback at the end of the session.
      
      Conversation so far:
      ${conversationText}
      
      User's latest response:
      ${userResponse}
      
      Continue the conversation as the interviewer.`;
  
      const result = await model.generateContent(prompt);
      res.json({ reply: result.response.text() });
    } catch (error) {
      console.error("Error generating AI response:", error);  // Log the error in detail
      if (error.response) {
        console.error("Error response from Gemini API:", error.response.data);
      }
      res.status(500).json({ error: 'Error generating AI response' });
    }
  });
