import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { askGPTWithHistory, buildContext } from '../../lib/openai';
import { useDevPilotContext } from './DevPilotContext';
import { FiSend, FiCpu, FiUser, FiTrash2, FiZap } from 'react-icons/fi';


export const AIChat: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const { aiMessages, addAIMessage, clearAIMessages } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const chatContext = useDevPilotContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, streamedResponse]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    if (!textToSend) setInput('');

    // Add user message
    addAIMessage({
      role: 'user',
      content: messageText,
      feature: 'chat'
    });

    setLoading(true);
    setStreamedResponse('');

    try {
      // Gather context
      const systemPrompt = `You are DevPilot AI, a premium productivity assistant powered by the Google Gemini API.
Your goal is to help developers optimize their workflow, plan projects, organize their Kanban board, manage time, and gain focus insights.

Here is the user's current project/developer context:
${buildContext(chatContext)}

Generate highly actionable, clear, and context-aware responses. Format your response with clean markdown. Be concise, direct, and friendly. Do not mention that you have a context block unless asked. Always speak with authority and intelligence.`;

      // Get last 15 messages for history context
      const history = aiMessages
        .filter(m => m.feature === 'chat')
        .slice(-15)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      // Append current message
      history.push({ role: 'user', content: messageText });

      await askGPTWithHistory(apiKey, systemPrompt, history, (chunk) => {
        setStreamedResponse(chunk);
      });

      // Save assistant message when completed
      addAIMessage({
        role: 'assistant',
        content: streamedResponse || 'No response generated.',
        feature: 'chat'
      });
      setStreamedResponse('');
    } catch (err: any) {
      console.error(err);
      addAIMessage({
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to connect to OpenAI GPT-5.5 API. Please verify your API key and network connection.'}`,
        feature: 'chat'
      });
    } finally {
      setLoading(false);
    }
  };

  const presetPrompts = [
    { label: 'What should I do next?', text: 'Analyze my tasks and suggest the next most important thing to work on. Explain why.' },
    { label: 'Suggest sprint priorities', text: 'Help me plan my sprint. Look at my current backlog and recommend a priority list.' },
    { label: 'Help with blockers', text: 'I feel stuck on my overdue tasks. Can you suggest strategies to clear them?' },
    { label: 'Productivity tips', text: 'Give me 3 customized tips to improve my daily focus score and handle my current workload.' }
  ];

  const chatHistory = aiMessages.filter(m => m.feature === 'chat');

  return (
    <div className="flex flex-col h-[600px] bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <FiCpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">DevPilot Chat</h3>
            <p className="text-[10px] text-neutral-400">Powered by Google Gemini API</p>

          </div>
        </div>
        {chatHistory.length > 0 && (
          <button
            onClick={clearAIMessages}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-red-400 transition-colors"
            title="Clear Chat History"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/10 animate-bounce">
              <FiZap className="w-5 h-5 text-white" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-sm font-medium text-white">Welcome to DevPilot AI</h4>
              <p className="text-neutral-400 leading-relaxed">
                I am your intelligent developer assistant. I have full context of your projects, tasks, focus sessions, and git logs. Ask me anything or try one of the suggestions below.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
              {presetPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.text)}
                  className="p-3 text-left border border-neutral-800 hover:border-violet-500/30 bg-neutral-950/20 hover:bg-violet-950/10 rounded-xl transition-all duration-200 text-neutral-300 hover:text-white cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`p-2 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
              m.role === 'user'
                ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                : 'bg-violet-600/10 border-violet-500/20 text-violet-400'
            }`}>
              {m.role === 'user' ? <FiUser className="w-3.5 h-3.5" /> : <FiCpu className="w-3.5 h-3.5" />}
            </div>
            <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-violet-600 text-white rounded-tr-none'
                : 'bg-neutral-950/40 border border-neutral-800 text-neutral-200 rounded-tl-none font-sans'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Streaming / Loading indicator */}
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="p-2 h-8 w-8 rounded-lg bg-violet-600/10 border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <FiCpu className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-950/40 border border-neutral-800 text-neutral-200 rounded-tl-none font-sans leading-relaxed min-w-[100px]">
              {streamedResponse ? (
                <div className="whitespace-pre-wrap">{streamedResponse}</div>
              ) : (
                <div className="flex gap-1 py-1.5 items-center justify-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-neutral-800 bg-neutral-950/30 flex gap-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask DevPilot anything about your workspace..."
          disabled={loading}
          className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-violet-500/50 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-white font-medium flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-violet-500/10"
        >
          <FiSend className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
