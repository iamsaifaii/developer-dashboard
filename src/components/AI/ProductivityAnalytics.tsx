import React, { useState } from 'react';
import { askGPT } from '../../lib/openai';
import { useDevPilotContext } from './DevPilotContext';
import { FiTrendingUp, FiActivity, FiAlertCircle, FiCpu, FiAward } from 'react-icons/fi';

export const ProductivityAnalytics: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const context = useDevPilotContext();

  // Simple formulaic focus score calculation
  const total = context.totalTasks || 1;
  const compRate = context.completedTasks / total;
  const sessions = context.pomodoroSessions;
  const scoreBase = (compRate * 60) + (Math.min(sessions, 10) * 4);
  const focusScore = Math.max(10, Math.min(Math.round(scoreBase), 100));

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const systemPrompt = `You are DevPilot AI, a productivity coach. You analyze user work patterns and calculate focus/burnout metrics using the OpenAI GPT-5.5 API.
Analyze the user's workload, completed tasks, Pomodoro sessions, and recent commit logs.
Identify work patterns (e.g. high volume but high overdue, strong git activity, etc.).
Evaluate Burnout risk (High risk if active tasks > 10, low focus sessions, or multiple overdue items).
Offer 3 actionable tips for workload balancing.`;

      const userMessage = `Analyze my productivity metrics:
- Focus Score: ${focusScore}/100
- Pomodoro Sessions Completed: ${context.pomodoroSessions}
- Total Tasks: ${context.totalTasks} (Completed: ${context.completedTasks}, In-Progress: ${context.inProgressTasks}, Overdue: ${context.overdueTasks})
- GitHub commits: ${context.recentCommits.length}`;

      const res = await askGPT(apiKey, systemPrompt, userMessage);
      setAnalysis(res);
    } catch (err: any) {
      console.error(err);
      setAnalysis(`Failed to generate analysis: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const getBurnoutRisk = () => {
    if (context.overdueTasks > 2 || context.inProgressTasks > 5) return { label: 'High', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    if (context.inProgressTasks > 3) return { label: 'Moderate', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
    return { label: 'Low', color: 'text-green-400 bg-green-500/10 border-green-500/20' };
  };

  const risk = getBurnoutRisk();

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-white">Productivity Insights</h3>
          <p className="text-[10px] text-neutral-400">Burnout audit and workflow analysis powered by OpenAI GPT-5.5 API</p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-[10px] font-semibold text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-500/10"
        >
          {loading ? (
            <>
              <FiCpu className="w-3 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FiActivity className="w-3 h-3" />
              Analyze Focus
            </>
          )}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-neutral-950/20 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <FiAward className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-medium">Focus Score</p>
            <p className="text-lg font-bold text-white mt-0.5">{focusScore}<span className="text-[10px] text-neutral-500">/100</span></p>
          </div>
        </div>

        <div className="bg-neutral-950/20 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FiTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-medium">Focus Sessions</p>
            <p className="text-lg font-bold text-white mt-0.5">{context.pomodoroSessions}</p>
          </div>
        </div>

        <div className={`bg-neutral-950/20 border rounded-xl p-4 flex items-center gap-3 ${risk.color}`}>
          <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
            <FiAlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-medium">Burnout Risk</p>
            <p className="text-sm font-bold mt-0.5">{risk.label}</p>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4 font-sans text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
          {analysis}
        </div>
      )}
    </div>
  );
};
