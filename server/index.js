import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 1. Security Middleware
app.use(helmet()); // Sets secure HTTP headers
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Restrict this in true production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Parse JSON bodies safely
app.use(express.json({ limit: '1mb' }));

// 3. Initialize Gemini API
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured on the server.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// 4. Zod Schemas for Input Validation
const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  columnId: z.string().optional(),
  dueDate: z.string().optional()
});

const ProductivityRequestSchema = z.object({
  tasks: z.array(TaskSchema).default([]),
  pomodoroSessions: z.number().min(0).default(0)
});

const DeadlinesRequestSchema = z.object({
  tasks: z.array(TaskSchema).default([])
});

const AiGenerateRequestSchema = z.object({
  systemPrompt: z.string().optional(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional(),
  userMessage: z.string().optional(),
  stream: z.boolean().default(false)
});

// Middleware for validation
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Invalid request payload', details: err.errors });
  }
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', model: 'gemini-1.5-flash' });
});

// ─── Email Invite Endpoint ────────────────────────────────────────────────────

const InviteSchema = z.object({
  to: z.string().email(),
  inviterName: z.string().min(1).max(100),
  teamName: z.string().min(1).max(100),
  inviteLink: z.string().url(),
});

// Stricter rate limit for invite emails: 10 per 15 min per IP
const inviteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many invite requests. Please wait before sending more.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function getEmailTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');

  if (!user || !pass) {
    throw new Error('SMTP credentials not configured. Set SMTP_USER and SMTP_PASS in .env');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function buildInviteEmailHtml({ inviterName, teamName, inviteLink }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Team Invitation - DevFlow</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #27272a;border-radius:16px;overflow:hidden;max-width:520px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#0a0a0a 100%);padding:40px 40px 32px;text-align:center;border-bottom:1px solid #1e1b4b;">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:20px;">
                <div style="width:40px;height:40px;background:#000;border:1px solid #27272a;border-radius:10px;display:inline-block;line-height:40px;text-align:center;font-size:20px;">⚡</div>
                <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">DevFlow</span>
              </div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0;letter-spacing:-0.5px;line-height:1.2;">
                You're invited to join a team!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 24px;">
                <strong style="color:#e4e4e7;">${inviterName}</strong> has invited you to collaborate on the
                <strong style="color:#818cf8;">${teamName}</strong> workspace inside DevFlow.
              </p>

              <!-- Team card -->
              <div style="background:#111;border:1px solid #1e1b4b;border-radius:12px;padding:20px 24px;margin:0 0 28px;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                  <div style="width:36px;height:36px;background:#1e1b4b;border-radius:8px;display:inline-block;line-height:36px;text-align:center;font-size:16px;">👥</div>
                  <div>
                    <div style="color:#fff;font-size:15px;font-weight:600;">${teamName}</div>
                    <div style="color:#6b7280;font-size:12px;">Invited by ${inviterName}</div>
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${inviteLink}"
                   style="display:inline-block;background:#4f46e5;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;box-shadow:0 4px 24px rgba(79,70,229,0.4);">
                  Accept Invitation &rarr;
                </a>
              </div>

              <p style="color:#52525b;font-size:13px;line-height:1.6;margin:0;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${inviteLink}" style="color:#818cf8;word-break:break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #18181b;text-align:center;">
              <p style="color:#3f3f46;font-size:12px;margin:0;">
                This invitation was sent by <strong>${inviterName}</strong> via DevFlow.<br/>
                If you weren't expecting this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

app.post('/api/invite/send', inviteLimiter, validate(InviteSchema), async (req, res) => {
  const { to, inviterName, teamName, inviteLink } = req.body;

  try {
    const transporter = getEmailTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"DevFlow" <${fromAddress}>`,
      to,
      subject: `${inviterName} invited you to join "${teamName}" on DevFlow`,
      html: buildInviteEmailHtml({ inviterName, teamName, inviteLink }),
      text: `${inviterName} has invited you to join the "${teamName}" workspace on DevFlow.\n\nClick this link to accept: ${inviteLink}\n\nIf you weren't expecting this, you can safely ignore this email.`,
    });

    return res.json({ success: true, message: 'Invite email sent successfully.' });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send invite email.' });
  }
});


// DevPilot AI endpoint
app.post('/api/ai/generate', validate(AiGenerateRequestSchema), async (req, res) => {
  const { systemPrompt, messages, userMessage, stream } = req.body;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let promptParts = [];
    if (systemPrompt) promptParts.push(`System Instruction: ${systemPrompt}\n`);
    
    if (messages && messages.length > 0) {
      messages.forEach(m => promptParts.push(`${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`));
    } else if (userMessage) {
      promptParts.push(`User: ${userMessage}`);
    }

    const promptText = promptParts.join('\n');

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const result = await model.generateContentStream([promptText]);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      const result = await model.generateContent([promptText]);
      return res.json({ text: result.response.text() });
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    let message = error.message || 'An error occurred while calling the AI API.';
    if (stream) {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      return res.end();
    } else {
      return res.status(500).json({ error: message });
    }
  }
});

// Productivity calculations backend endpoint
app.post('/api/productivity/calculate', validate(ProductivityRequestSchema), (req, res) => {
  const { tasks, pomodoroSessions } = req.body;

  try {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.columnId === 'done').length;
    const inProgressTasks = tasks.filter(t => t.columnId === 'progress').length;
    
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const sessionWeight = Math.min(pomodoroSessions, 12) * 5;
    const completionWeight = completionRate * 40;
    const focusScore = Math.max(10, Math.min(Math.round(completionWeight + sessionWeight), 100));

    const now = new Date();
    const overdueTasks = tasks.filter(t => {
      if (t.columnId === 'done' || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(23, 59, 59, 999);
      return due < now;
    }).length;

    let burnoutRisk = 'Low';
    let riskColor = 'text-green-400 bg-green-500/10 border-green-500/20';
    if (overdueTasks > 2 || inProgressTasks > 5) {
      burnoutRisk = 'High';
      riskColor = 'text-red-400 bg-red-500/10 border-red-500/20';
    } else if (inProgressTasks > 3) {
      burnoutRisk = 'Moderate';
      riskColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }

    return res.json({ focusScore, burnoutRisk, riskColor, metrics: { totalTasks, completedTasks, inProgressTasks, overdueTasks } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate productivity metrics.' });
  }
});

// Deadline tracking backend endpoint
app.post('/api/deadlines/check', validate(DeadlinesRequestSchema), (req, res) => {
  const { tasks } = req.body;

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

    return res.json({ overdueList, dueTodayList, upcomingList, notificationsToTrigger });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to track deadlines.' });
  }
});

// Smart reminder generator endpoint
app.post('/api/reminders/generate', validate(ProductivityRequestSchema), (req, res) => {
  const { tasks, pomodoroSessions } = req.body;

  try {
    const pendingTasksCount = tasks.filter(t => t.columnId !== 'done').length;
    const nowHour = new Date().getHours();
    const reminders = [];

    if (pendingTasksCount > 8) {
      reminders.push({ title: 'Workload Reminder', message: `You have ${pendingTasksCount} pending tasks. Try breaking them down or shifting priorities to prevent burnout.` });
    }
    if (pomodoroSessions > 4 && nowHour > 17) {
      reminders.push({ title: 'Wind Down Reminder', message: `You completed ${pomodoroSessions} focus sessions today. Great work! Consider wrapping up for the day.` });
    }
    if (pendingTasksCount === 0) {
      reminders.push({ title: 'Inbox Zero!', message: 'No pending tasks left. Enjoy the empty backlog or plan your next sprint!' });
    }
    if (reminders.length === 0) {
      reminders.push({ title: 'Daily Focus Tip', message: 'Try scheduling a 25-minute Pomodoro focus session to stay in flow.' });
    }

    return res.json({ reminders });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate reminders.' });
  }
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

app.listen(port, () => {
  console.log(`🚀 Secure API backend running on port ${port}`);
});

