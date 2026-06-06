import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { askGPT } from '../../lib/openai';
import { FiPlus, FiCheck, FiLayers, FiCpu } from 'react-icons/fi';

interface ExtractedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface NoteSummaryResult {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  suggestedTasks: ExtractedTask[];
}

export const NotesSummarizer: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const { notes, addTask, addNotification } = useStore();
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [result, setResult] = useState<NoteSummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Record<number, boolean>>({});

  const activeNote = notes.find(n => n.id === selectedNoteId);

  const handleSummarize = async () => {
    if (!activeNote) return;
    setLoading(true);
    setResult(null);
    setAddedTasks({});

    try {
      const systemPrompt = `You are DevPilot AI. You summarize notes and extract tasks using the OpenAI GPT-5.5 API.
You MUST output your response strictly as valid JSON with no markdown block fences (i.e. no \`\`\`json). The JSON structure must be:
{
  "summary": "Short paragraph summary",
  "keyPoints": ["Key point 1", "Key point 2"],
  "actionItems": ["Action item 1", "Action item 2"],
  "suggestedTasks": [
    { "title": "Task title", "description": "Short details", "priority": "low" | "medium" | "high" | "urgent" }
  ]
}`;

      const userMessage = `Note Title: ${activeNote.title}\nContent:\n${activeNote.content}`;
      const res = await askGPT(apiKey, systemPrompt, userMessage);

      // Clean markdown code blocks if AI added them
      const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: NoteSummaryResult = JSON.parse(cleanJson);
      setResult(parsed);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to analyze note: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (task: ExtractedTask, index: number) => {
    // Calculate auto-deadline of tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split('T')[0];

    addTask({
      title: task.title,
      description: task.description,
      columnId: 'todo',
      priority: task.priority,
      tags: ['AI-Extracted', 'Notes'],
      subtasks: [],
      dueDate
    });

    addNotification({
      title: 'Task Created from Note',
      message: `"${task.title}" has been added to your Kanban board (Due: ${dueDate})`,
      category: 'task'
    });

    setAddedTasks(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white">Notes Summarizer & Ingestion</h3>
        <p className="text-[10px] text-neutral-400">Extract action items and ingest tasks to Kanban board via OpenAI GPT-5.5 API</p>
      </div>

      <div className="flex gap-3 items-center">
        <select
          value={selectedNoteId}
          onChange={(e) => setSelectedNoteId(e.target.value)}
          className="bg-neutral-950/40 border border-neutral-800 text-xs text-white rounded-xl px-4 py-2.5 max-w-xs flex-1 focus:outline-none focus:border-violet-500"
        >
          <option value="">Select a note to summarize...</option>
          {notes.map(n => (
            <option key={n.id} value={n.id}>{n.title}</option>
          ))}
        </select>

        <button
          onClick={handleSummarize}
          disabled={!selectedNoteId || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-500/10"
        >
          {loading ? (
            <>
              <FiCpu className="w-3.5 h-3.5 animate-spin" />
              Ingesting Note...
            </>
          ) : (
            <>
              <FiLayers className="w-3.5 h-3.5" />
              Summarize & Extract Tasks
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Summary</h4>
            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/20 border border-neutral-800 rounded-xl p-4">
              {result.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Key Discussion Points */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Key Discussion Points</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-neutral-400">
                {result.keyPoints.map((p, idx) => (
                  <li key={idx} className="leading-relaxed">{p}</li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Action Items</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-neutral-400">
                {result.actionItems.map((ai, idx) => (
                  <li key={idx} className="leading-relaxed">{ai}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Tasks */}
          {result.suggestedTasks && result.suggestedTasks.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Suggested Kanban Tasks</h4>
              <div className="grid grid-cols-2 gap-3">
                {result.suggestedTasks.map((t, idx) => (
                  <div key={idx} className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4 flex justify-between items-start">
                    <div className="space-y-1 pr-4">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded border font-medium ${
                        t.priority === 'urgent' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        t.priority === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                        t.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}>
                        {t.priority}
                      </span>
                      <h5 className="text-xs font-semibold text-white mt-1.5">{t.title}</h5>
                      <p className="text-[10px] text-neutral-400 leading-normal">{t.description}</p>
                    </div>
                    {addedTasks[idx] ? (
                      <span className="p-1.5 bg-green-500/15 border border-green-500/20 text-green-400 rounded-lg text-[10px] flex items-center gap-1">
                        <FiCheck className="w-3 h-3" /> Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddTask(t, idx)}
                        className="p-1.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Add to Kanban"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
