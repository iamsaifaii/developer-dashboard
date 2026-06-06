import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Allow JSON parsing
app.use(express.json());
// Allow CORS
app.use(cors());

// Initialize Gemini API
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured on the server. Please add GEMINI_API_KEY to your environment variables.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', model: 'gemini-1.5-flash' });
});

// 1. DevPilot AI endpoint (Chat, standup, suggestions, summaries)
app.post('/api/ai/generate', async (req, res) => {
  const { systemPrompt, messages, userMessage, stream = false } = req.body;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format prompt for Gemini
    // Combine system prompt, history (messages), and current message
    let promptParts = [];
    if (systemPrompt) {
      promptParts.push(`System Instruction: ${systemPrompt}\n`);
    }

    if (messages && Array.isArray(messages)) {
      messages.forEach(m => {
        promptParts.push(`${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`);
      });
    } else if (userMessage) {
      promptParts.push(`User: ${userMessage}`);
    }

    const promptText = promptParts.join('\n');

    if (stream) {
      // Set up Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const result = await model.generateContentStream([promptText]);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      const result = await model.generateContent([promptText]);
      const responseText = result.response.text();
      return res.json({ text: responseText });
    }
  } catch (error) {
    console.error('Error generating Gemini AI response:', error);
    let message = error.message || 'An error occurred while calling the Gemini API.';
    if (message.includes('API key') || message.includes('key not configured')) {
      message = 'Google Gemini API Key is missing or invalid on the server. Please verify your GEMINI_API_KEY environment variable.';
    }
    if (stream) {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      return res.end();
    } else {
      return res.status(500).json({ error: message });
    }
  }
});

// 2. Productivity calculations backend endpoint
app.post('/api/productivity/calculate', (req, res) => {
  const { tasks = [], pomodoroSessions = 0 } = req.body;

  try {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.columnId === 'done').length;
    const inProgressTasks = tasks.filter(t => t.columnId === 'progress').length;
    
    // Compute focus score
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const sessionWeight = Math.min(pomodoroSessions, 12) * 5;
    const completionWeight = completionRate * 40;
    const focusScore = Math.max(10, Math.min(Math.round(completionWeight + sessionWeight), 100));

    // Overdue check
    const now = new Date();
    const overdueTasks = tasks.filter(t => {
      if (t.columnId === 'done' || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(23, 59, 59, 999);
      return due < now;
    }).length;

    // Burnout risk assessment
    let burnoutRisk = 'Low';
    let riskColor = 'text-green-400 bg-green-500/10 border-green-500/20';
    if (overdueTasks > 2 || inProgressTasks > 5) {
      burnoutRisk = 'High';
      riskColor = 'text-red-400 bg-red-500/10 border-red-500/20';
    } else if (inProgressTasks > 3) {
      burnoutRisk = 'Moderate';
      riskColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }

    return res.json({
      focusScore,
      burnoutRisk,
      riskColor,
      metrics: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks
      }
    });
  } catch (err) {
    console.error('Error calculating productivity:', err);
    return res.status(500).json({ error: 'Failed to calculate productivity metrics.' });
  }
});

// 3. Deadline tracking backend endpoint
app.post('/api/deadlines/check', (req, res) => {
  const { tasks = [] } = req.body;

  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const overdueList = [];
    const dueTodayList = [];
    const upcomingList = [];
    const notificationsToTrigger = [];

    tasks.forEach(t => {
      if (t.columnId === 'done' || !t.dueDate) return;

      const due = new Date(t.dueDate);
      due.setHours(23, 59, 59, 999);

      if (due < now) {
        overdueList.push(t);
        notificationsToTrigger.push({
          title: 'Task Overdue!',
          message: `"${t.title}" was due on ${t.dueDate}. Please update the status or deadline.`,
          category: 'task',
          link: `kanban`
        });
      } else if (t.dueDate === todayStr) {
        dueTodayList.push(t);
        notificationsToTrigger.push({
          title: 'Task Due Today',
          message: `"${t.title}" is due today! Make sure to prioritize it.`,
          category: 'task',
          link: `kanban`
        });
      } else if (t.dueDate === tomorrowStr) {
        upcomingList.push(t);
      }
    });

    return res.json({
      overdueList,
      dueTodayList,
      upcomingList,
      notificationsToTrigger
    });
  } catch (err) {
    console.error('Error checking deadlines:', err);
    return res.status(500).json({ error: 'Failed to track deadlines.' });
  }
});

// 4. Smart reminder generator endpoint
app.post('/api/reminders/generate', (req, res) => {
  const { tasks = [], pomodoroSessions = 0 } = req.body;

  try {
    const pendingTasksCount = tasks.filter(t => t.columnId !== 'done').length;
    const nowHour = new Date().getHours();
    const reminders = [];

    if (pendingTasksCount > 8) {
      reminders.push({
        title: 'Workload Reminder',
        message: `You have ${pendingTasksCount} pending tasks. Try breaking them down or shifting priorities to prevent burnout.`
      });
    }

    if (pomodoroSessions > 4 && nowHour > 17) {
      reminders.push({
        title: 'Wind Down Reminder',
        message: `You completed ${pomodoroSessions} focus sessions today. Great work! Consider wrapping up for the day.`
      });
    }

    if (pendingTasksCount === 0) {
      reminders.push({
        title: 'Inbox Zero!',
        message: 'No pending tasks left. Enjoy the empty backlog or plan your next sprint!'
      });
    }

    // Default friendly prompt
    if (reminders.length === 0) {
      reminders.push({
        title: 'Daily Focus Tip',
        message: 'Try scheduling a 25-minute Pomodoro focus session to stay in flow.'
      });
    }

    return res.json({ reminders });
  } catch (err) {
    console.error('Error generating reminders:', err);
    return res.status(500).json({ error: 'Failed to generate reminders.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 DevPilot AI secure Gemini backend running on port ${port}`);
});
