import React, { useState } from 'react';
import { askGPT } from '../../lib/openai';
import { useStore } from '../../store/useStore';
import { FiPlay, FiCpu, FiCheckSquare } from 'react-icons/fi';


export const SmartSuggestions: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [suggestions, setSuggestions] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { tasks } = useStore();

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const systemPrompt = `You are DevPilot AI. You analyze developer Kanban boards and suggest next steps using the Google Gemini API.
Recommend which tasks the user should work on next, sorted by priority.
Point out any overdue or urgent tasks first.
Detect any dependencies or blockers based on titles/descriptions.
Provide a clear, bulleted response with 'Task Name', 'Recommended Priority', 'Reasoning/Bottleneck Analysis'.`;

      const activeTasks = tasks.filter(t => t.columnId !== 'done');
      const taskList = activeTasks.map(t => {
        return `- [ID: ${t.id}] Title: "${t.title}", Priority: "${t.priority}", DueDate: "${t.dueDate || 'None'}", Column: "${t.columnId}", Description: "${t.description || ''}"`;
      }).join('\n');

      const userMessage = `Analyze my active tasks and recommend my next actions. Here are my tasks:\n${taskList || 'No active tasks.'}`;

      const res = await askGPT(apiKey, systemPrompt, userMessage);
      setSuggestions(res);
    } catch (err: any) {
      console.error(err);
      setSuggestions(`Failed to generate recommendations: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white">Smart Task Suggestions</h3>
        <p className="text-[10px] text-neutral-400">Get AI-driven priorities and bottleneck analysis from Google Gemini API</p>

      </div>

      <div>
        <button
          onClick={handleSuggest}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-500/10"
        >
          {loading ? (
            <>
              <FiCpu className="w-3.5 h-3.5 animate-spin" />
              Analyzing Workflow...
            </>
          ) : (
            <>
              <FiPlay className="w-3.5 h-3.5" />
              Get Action Plan
            </>
          )}
        </button>
      </div>

      {suggestions ? (
        <div className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4 font-sans text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
          {suggestions}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-neutral-500 text-center space-y-2">
          <FiCheckSquare className="w-8 h-8 text-neutral-600" />
          <p className="text-xs">Click the button above to calculate task urgency and analyze your board.</p>
        </div>
      )}
    </div>
  );
};
