import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Allow JSON parsing
app.use(express.json());
// Allow CORS
app.use(cors());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', model: 'gpt-5.5' });
});

// DevPilot AI endpoint
app.post('/api/ai/generate', async (req, res) => {
  const { systemPrompt, messages, userMessage, stream = false } = req.body;

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OpenAI API key not configured on the server. Please add OPENAI_API_KEY to your environment variables.'
    });
  }

  try {
    const openai = new OpenAI({ apiKey });

    // Build the messages payload
    const chatMessages = [];
    if (systemPrompt) {
      chatMessages.push({ role: 'system', content: systemPrompt });
    }

    if (messages && Array.isArray(messages)) {
      chatMessages.push(...messages);
    } else if (userMessage) {
      chatMessages.push({ role: 'user', content: userMessage });
    }

    if (stream) {
      // Set up Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await openai.chat.completions.create({
        model: 'gpt-5.5',
        messages: chatMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      });

      for await (const chunk of responseStream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          // Send as SSE data line
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-5.5',
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || '';
      return res.json({ text: responseText });
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    let message = error.message || 'An error occurred while calling the OpenAI API.';
    if (error.status === 429 || error.code === 'insufficient_quota' || message.toLowerCase().includes('quota')) {
      message = 'Your OpenAI API key has exceeded its quota or has no remaining credits. Please add billing credits to your OpenAI Platform account at https://platform.openai.com/settings/organization/billing to use this API key.';
    }
    if (stream) {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      return res.end();
    } else {
      return res.status(500).json({ error: message });
    }
  }
});


app.listen(port, () => {
  console.log(`🚀 DevPilot AI Secure Backend running on port ${port}`);
});
