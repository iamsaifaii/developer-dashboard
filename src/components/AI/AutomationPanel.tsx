import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { askGPT } from '../../lib/openai';
import { FiLayers, FiFileText, FiRefreshCw, FiZap } from 'react-icons/fi';


export const AutomationPanel: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [output, setOutput] = useState('');
  const [loadingType, setLoadingType] = useState<'duplicates' | 'sprint' | 'optimize' | null>(null);
  const { tasks } = useStore();

  const handleDuplicateAudit = async () => {
    setLoadingType('duplicates');
    setOutput('');
    try {
      const systemPrompt = `You are DevPilot AI. You perform task deduplication analysis using the OpenAI GPT-5.5 API.
Analyze the provided Kanban tasks for duplicates, highly overlapping titles/descriptions, or conflicting scope.
Return a summary listing matching duplicates and suggestions for merging them, or confirm that the board has no duplicate items.`;

      const list = tasks.map(t => `- [${t.id}] ${t.title}: ${t.description || 'No description'}`).join('\n');
      const userMessage = `Perform a duplicate audit on my tasks:\n${list || 'No tasks available.'}`;

      const res = await askGPT(apiKey, systemPrompt, userMessage);
      setOutput(res);
    } catch (err: any) {
      console.error(err);
      setOutput(`Error auditing duplicates: ${err.message || err}`);
    } finally {
      setLoadingType(null);
    }
  };

  const handleSprintPlanning = async () => {
    setLoadingType('sprint');
    setOutput('');
    try {
      const systemPrompt = `You are DevPilot AI. You assist with sprint planning and milestone organization using the OpenAI GPT-5.5 API.
Analyze the user's tasks and create a Sprint Plan recommendation.
Group tasks into categories, propose a realistic sprint duration, suggest target milestones, and assign suggested deadlines.`;

      const list = tasks.filter(t => t.columnId !== 'done').map(t => `- ${t.title} (Priority: ${t.priority})`).join('\n');
      const userMessage = `Create a sprint proposal for these tasks:\n${list || 'No tasks in backlog.'}`;

      const res = await askGPT(apiKey, systemPrompt, userMessage);
      setOutput(res);
    } catch (err: any) {
      console.error(err);
      setOutput(`Error generating sprint plan: ${err.message || err}`);
    } finally {
      setLoadingType(null);
    }
  };

  const handleWorkflowOptimization = async () => {
    setLoadingType('optimize');
    setOutput('');
    try {
      const systemPrompt = `You are DevPilot AI. You perform productivity automation audits using the OpenAI GPT-5.5 API.
Examine the user's workload volume and provide a quick Workflow Optimization report.
Include smart reminders, categorize recommendations, and suggest 3 high-impact process improvements.`;

      const completed = tasks.filter(t => t.columnId === 'done').length;
      const total = tasks.length;
      const userMessage = `Optimize my workflow based on current stats:\nTotal tasks: ${total}\nCompleted: ${completed}\nPending: ${total - completed}`;

      const res = await askGPT(apiKey, systemPrompt, userMessage);
      setOutput(res);
    } catch (err: any) {
      console.error(err);
      setOutput(`Error generating optimization: ${err.message || err}`);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white">DevPilot Automation Center</h3>
        <p className="text-[10px] text-neutral-400">Automate repetitive management routines with OpenAI GPT-5.5 API</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Card 1 */}
        <button
          onClick={handleDuplicateAudit}
          disabled={!!loadingType}
          className="bg-neutral-950/20 border border-neutral-800 hover:border-violet-500/30 rounded-xl p-4 flex flex-col text-left space-y-3 cursor-pointer group transition-all"
        >
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
            {loadingType === 'duplicates' ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiLayers className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Audit Duplicate Tasks</h4>
            <p className="text-[10px] text-neutral-400 mt-1">Detect redundant titles or overlaps on the Kanban board.</p>
          </div>
        </button>

        {/* Card 2 */}
        <button
          onClick={handleSprintPlanning}
          disabled={!!loadingType}
          className="bg-neutral-950/20 border border-neutral-800 hover:border-violet-500/30 rounded-xl p-4 flex flex-col text-left space-y-3 cursor-pointer group transition-all"
        >
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
            {loadingType === 'sprint' ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiFileText className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Sprint Planner</h4>
            <p className="text-[10px] text-neutral-400 mt-1">Formulate sprints, deadlines, and categorize milestones.</p>
          </div>
        </button>

        {/* Card 3 */}
        <button
          onClick={handleWorkflowOptimization}
          disabled={!!loadingType}
          className="bg-neutral-950/20 border border-neutral-800 hover:border-violet-500/30 rounded-xl p-4 flex flex-col text-left space-y-3 cursor-pointer group transition-all"
        >
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
            {loadingType === 'optimize' ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Optimize Workflow</h4>
            <p className="text-[10px] text-neutral-400 mt-1">Get custom smart reminders and priority categorization recommendations.</p>
          </div>
        </button>
      </div>

      {output && (
        <div className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4 font-sans text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
          {output}
        </div>
      )}
    </div>
  );
};
