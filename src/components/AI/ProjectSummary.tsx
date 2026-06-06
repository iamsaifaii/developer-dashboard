import React, { useState } from 'react';
import { askGPT } from '../../lib/openai';
import { useDevPilotContext } from './DevPilotContext';
import { FiCpu, FiFileText } from 'react-icons/fi';


export const ProjectSummary: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [range, setRange] = useState<'sprint' | 'weekly' | 'monthly' | 'overall'>('sprint');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const context = useDevPilotContext();

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const systemPrompt = `You are DevPilot AI. You generate workspace and project summaries using the Google Gemini API.
Generate a concise ${range} report.
Ensure you highlight:
1. Completed accomplishments
2. Key milestones hit
3. Remaining workload / backlog
4. Potential risks / delay predictions`;

      const userMessage = `Summarize my project. Here is my current dashboard state:
- Active backlog: ${context.taskTitles.join(', ') || 'No active tasks.'}
- Completed milestones: ${context.completedTaskTitles.join(', ') || 'None.'}
- Total focus sessions: ${context.pomodoroSessions}
- GitHub commits: ${context.recentCommits.join(' | ') || 'No commits recorded.'}`;

      const res = await askGPT(apiKey, systemPrompt, userMessage);
      setSummary(res);
    } catch (err: any) {
      console.error(err);
      setSummary(`Failed to generate summary: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-white">Project & Sprint Summarizer</h3>
          <p className="text-[10px] text-neutral-400">Generate executive summary reports powered by Google Gemini API</p>

        </div>
        <div className="flex gap-2">
          {(['sprint', 'weekly', 'monthly', 'overall'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-medium capitalize cursor-pointer transition-all ${
                range === r
                  ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                  : 'bg-neutral-950/20 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {r === 'overall' ? 'overall progress' : r + ' summary'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-500/10"
        >
          {loading ? (
            <>
              <FiCpu className="w-3.5 h-3.5 animate-spin" />
              Compiling report...
            </>
          ) : (
            <>
              <FiFileText className="w-3.5 h-3.5" />
              Generate Summary
            </>
          )}
        </button>
      </div>

      {summary && (
        <div className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4 font-sans text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
          {summary}
        </div>
      )}
    </div>
  );
};
