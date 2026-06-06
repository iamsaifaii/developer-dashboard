import React, { useState } from 'react';
import { askGPT } from '../../lib/openai';
import { useDevPilotContext } from './DevPilotContext';
import { FiPlay, FiCopy, FiCheck, FiCpu } from 'react-icons/fi';

export const StandupGenerator: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical' | 'bullet'>('professional');
  const [standupText, setStandupText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const context = useDevPilotContext();

  const handleGenerate = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const systemPrompt = `You are DevPilot AI. You generate a daily standup report for a developer using the Google Gemini API.
Tone chosen: ${tone}.
Format should clearly separate:
1. Yesterday (Completed tasks/commits)
2. Today (Planned goals/tasks)
3. Blockers (Overdue/Urgent tasks or pending items)`;

      const userMessage = `Generate a standup report for me. Here is my current workspace data:
- Yesterday's Completed: ${context.completedTaskTitles.join(', ') || 'No tasks completed. Checked in commits: ' + context.recentCommits.join(', ')}
- Today's Planned: ${context.taskTitles.slice(0, 5).join(', ') || 'No planned tasks listed.'}
- Current Blockers / Warnings: Overdue tasks (${context.overdueTasks}), Urgent tasks (${context.urgentTasks})`;

      const res = await askGPT(apiKey, systemPrompt, userMessage);
      setStandupText(res);
    } catch (err: any) {
      console.error(err);
      setStandupText(`Failed to generate standup: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(standupText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-white">Daily Standup Generator</h3>
          <p className="text-[10px] text-neutral-400">Generate structured standup notes using Google Gemini API</p>

        </div>
        <div className="flex gap-2">
          {(['professional', 'casual', 'technical', 'bullet'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-medium capitalize cursor-pointer transition-all ${
                tone === t
                  ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                  : 'bg-neutral-950/20 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-500/10"
        >
          {loading ? (
            <>
              <FiCpu className="w-3.5 h-3.5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FiPlay className="w-3.5 h-3.5" />
              Generate Standup
            </>
          )}
        </button>
      </div>

      {standupText && (
        <div className="relative bg-neutral-950/40 border border-neutral-800 rounded-xl p-4 font-sans text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 bg-neutral-900 border border-neutral-800 hover:border-violet-500/40 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Copy to Clipboard"
          >
            {copied ? <FiCheck className="w-3.5 h-3.5 text-green-400" /> : <FiCopy className="w-3.5 h-3.5" />}
          </button>
          {standupText}
        </div>
      )}
    </div>
  );
};
