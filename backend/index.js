require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper function to generate a response using the combined prompt
const generate = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// API Routes
app.post('/spell-check', async (req, res) => {
  try {
    let { prompt } = req.body;
    console.log("Received prompt:\n", prompt);

    const combinedPrompt = `You are an AI assistant that check if there is any grammatical or spelling mistakes in provided input text . Your input sentence is: \n\n`;
    prompt += combinedPrompt;

    const generatedText = await generate(prompt);
    console.log("Generated Text:\n", generatedText);
    res.json({ generatedText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/request', async (req, res) => {
  try {
    const { conversation } = req.body;
    let combinedPrompt = '';

    if (conversation && Array.isArray(conversation)) {
      combinedPrompt = `You are an AI assistant that remembers the entire conversation. Use the context below to generate your response.\n\n`;
      combinedPrompt += conversation
        .map(msg => (msg.role === 'user' ? `User: ${msg.text}` : `Assistant: ${msg.text}`))
        .join('\n');
    } else {
      combinedPrompt = req.body.prompt;
    }

    console.log("Combined Prompt:\n", combinedPrompt);

    const generatedText = await generate(combinedPrompt);
    console.log("Generated Text:\n", generatedText);
    res.json({ generatedText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🚀 Use Render's PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App is running on port ${PORT}`);
});
