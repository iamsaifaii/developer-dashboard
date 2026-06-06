import OpenAI from 'openai';

// Model to use
export const DEVPILOT_MODEL = 'gpt-5.5';

// Singleton client (browser-safe)
let _client: OpenAI | null = null;

export function getOpenAIClient(apiKey: string): OpenAI {
  if (!_client || (_client as any)._apiKey !== apiKey) {
    _client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    (_client as any)._apiKey = apiKey;
  }
  return _client;
}

export interface DevPilotContext {
  userName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  urgentTasks: number;
  taskTitles: string[];
  completedTaskTitles: string[];
  recentCommits: string[];
  notesTitles: string[];
  pomodoroSessions: number;
  githubUsername: string;
  currentDate: string;
}

export function buildContext(ctx: DevPilotContext): string {
  return `
== DevPilot AI Context ==
User: ${ctx.userName} (@${ctx.githubUsername})
Date: ${ctx.currentDate}

Tasks:
- Total: ${ctx.totalTasks}
- Completed: ${ctx.completedTasks}
- In Progress: ${ctx.inProgressTasks}
- Overdue: ${ctx.overdueTasks}
- Urgent: ${ctx.urgentTasks}

Active/In-progress tasks: ${ctx.taskTitles.slice(0, 10).join(', ') || 'None'}
Recently completed: ${ctx.completedTaskTitles.slice(0, 5).join(', ') || 'None'}
Recent GitHub commits: ${ctx.recentCommits.slice(0, 5).join(' | ') || 'None'}
Notes available: ${ctx.notesTitles.slice(0, 5).join(', ') || 'None'}
Pomodoro focus sessions completed: ${ctx.pomodoroSessions}
`.trim();
}

export async function askGPT(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  onChunk?: (text: string) => void
): Promise<string> {
  const client = getOpenAIClient(apiKey);

  if (onChunk) {
    // Streaming mode
    const stream = await client.chat.completions.create({
      model: DEVPILOT_MODEL,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    let full = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        full += delta;
        onChunk(full);
      }
    }
    return full;
  } else {
    const res = await client.chat.completions.create({
      model: DEVPILOT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    return res.choices[0]?.message?.content || '';
  }
}

export async function askGPTWithHistory(
  apiKey: string,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  onChunk?: (text: string) => void
): Promise<string> {
  const client = getOpenAIClient(apiKey);

  const fullMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  if (onChunk) {
    const stream = await client.chat.completions.create({
      model: DEVPILOT_MODEL,
      stream: true,
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    let full = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        full += delta;
        onChunk(full);
      }
    }
    return full;
  } else {
    const res = await client.chat.completions.create({
      model: DEVPILOT_MODEL,
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });
    return res.choices[0]?.message?.content || '';
  }
}
