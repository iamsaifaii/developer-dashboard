export const DEVPILOT_MODEL = 'gemini-1.5-flash';


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
  _apiKey: string, // Kept for API interface compatibility but unused

  systemPrompt: string,
  userMessage: string,
  onChunk?: (text: string) => void
): Promise<string> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemPrompt,
      userMessage,
      stream: !!onChunk,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to generate AI response' }));
    throw new Error(errorData.error || 'Failed to generate AI response');
  }

  if (onChunk) {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body not readable');

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value);
      const lines = chunkStr.split('\n');

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine || !cleanLine.startsWith('data: ')) continue;

        const dataStr = cleanLine.substring(6);
        if (dataStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.text) {
            fullText += parsed.text;
            onChunk(fullText);
          }
        } catch (e) {
          // Ignore incomplete chunk errors
        }
      }
    }
    return fullText;
  } else {
    const data = await response.json();
    return data.text;
  }
}

export async function askGPTWithHistory(
  _apiKey: string, // Kept for API interface compatibility but unused

  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  onChunk?: (text: string) => void
): Promise<string> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemPrompt,
      messages,
      stream: !!onChunk,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to generate AI response' }));
    throw new Error(errorData.error || 'Failed to generate AI response');
  }

  if (onChunk) {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body not readable');

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value);
      const lines = chunkStr.split('\n');

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine || !cleanLine.startsWith('data: ')) continue;

        const dataStr = cleanLine.substring(6);
        if (dataStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.text) {
            fullText += parsed.text;
            onChunk(fullText);
          }
        } catch (e) {
          // Ignore incomplete chunk errors
        }
      }
    }
    return fullText;
  } else {
    const data = await response.json();
    return data.text;
  }
}
