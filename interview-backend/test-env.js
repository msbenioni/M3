require('dotenv').config();
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length); 