import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { AIChat } from './AIChat';
import { StandupGenerator } from './StandupGenerator';
import { SmartSuggestions } from './SmartSuggestions';
import { ProductivityAnalytics } from './ProductivityAnalytics';
import { ProjectSummary } from './ProjectSummary';
import { NotesSummarizer } from './NotesSummarizer';
import { AutomationPanel } from './AutomationPanel';
import { 
  FiCpu, FiMessageSquare, FiTrendingUp, FiLayers, 
  FiBookOpen, FiActivity, FiKey, FiLock, FiSettings, FiCheckCircle
} from 'react-icons/fi';

export const DevPilotAI: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'standup' | 'suggestions' | 'analytics' | 'summary' | 'notes' | 'automation'>('chat');
  const [keyInput, setKeyInput] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);

  // Resolve API Key: local settings first, then env variable fallback
  const envKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
  const activeKey = settings.openaiApiKey || envKey;

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      updateSettings({ openaiApiKey: keyInput.trim() });
      setIsEditingKey(false);
      setKeyInput('');
    }
  };

  const handleClearKey = () => {
    updateSettings({ openaiApiKey: '' });
    setKeyInput('');
    setIsEditingKey(true);
  };

  // Setup tab configurations
  const tabs = [
    { id: 'chat', label: 'AI Chat Panel', icon: FiMessageSquare },
    { id: 'standup', label: 'Daily Standup', icon: FiActivity },
    { id: 'suggestions', label: 'Smart Suggestions', icon: FiTrendingUp },
    { id: 'analytics', label: 'Productivity Insights', icon: FiTrendingUp },
    { id: 'summary', label: 'Project Summary', icon: FiLayers },
    { id: 'notes', label: 'Notes Summarizer', icon: FiBookOpen },
    { id: 'automation', label: 'Automation Features', icon: FiCpu }
  ] as const;

  const renderContent = () => {
    switch (activeSubTab) {
      case 'chat':
        return <AIChat apiKey={activeKey} />;
      case 'standup':
        return <StandupGenerator apiKey={activeKey} />;
      case 'suggestions':
        return <SmartSuggestions apiKey={activeKey} />;
      case 'analytics':
        return <ProductivityAnalytics apiKey={activeKey} />;
      case 'summary':
        return <ProjectSummary apiKey={activeKey} />;
      case 'notes':
        return <NotesSummarizer apiKey={activeKey} />;
      case 'automation':
        return <AutomationPanel apiKey={activeKey} />;
    }
  };

  // If no API key is set, display a beautiful glassmorphism key onboarding panel
  if (!activeKey || isEditingKey) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[500px]">
        <div className="max-w-md w-full bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 backdrop-blur-md space-y-6 shadow-2xl relative overflow-hidden">
          {/* Animated decorative particle overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white">
              <FiKey className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Configure DevPilot AI</h2>
              <p className="text-[10px] text-neutral-400 mt-1 max-w-xs leading-relaxed">
                Connect your OpenAI API key to activate intelligent features powered by the **OpenAI GPT-5.5 API**.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">OpenAI API Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-neutral-950/40 border border-neutral-800 focus:border-violet-500/50 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 transition-colors"
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-neutral-500 pointer-events-none">
                  <FiLock className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {activeKey && (
                <button
                  onClick={() => setIsEditingKey(false)}
                  className="flex-1 py-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveKey}
                disabled={!keyInput.trim()}
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-semibold text-white cursor-pointer transition-all shadow-lg shadow-violet-500/10"
              >
                Activate DevPilot
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-neutral-950/20 border border-neutral-800/40 rounded-xl p-3 text-[10px] text-neutral-500 leading-normal">
            <FiCpu className="w-4 h-4 text-violet-400 shrink-0" />
            <p>Your API key is saved locally in settings and Firestore cloud profile, secured and sent directly to OpenAI's endpoint.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 max-w-5xl mx-auto w-full animate-fadeIn">
      {/* Title Header */}
      <div className="flex justify-between items-center bg-neutral-900/40 border border-neutral-800/60 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/15">
            <FiCpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              DevPilot AI
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-400 uppercase tracking-wider font-semibold">
                GPT-5.5 Engine
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 mt-0.5">Your intelligent code companion & workspace coordinator</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {envKey && !settings.openaiApiKey && (
            <span className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <FiCheckCircle className="w-3 h-3" /> Env Token Active
            </span>
          )}
          <button
            onClick={handleClearKey}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 hover:border-violet-500/30 text-[10px] text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <FiSettings className="w-3.5 h-3.5" />
            Config API Key
          </button>
        </div>
      </div>

      {/* Workspace Menu Bar */}
      <div className="flex gap-1.5 border-b border-neutral-800 pb-px overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'border-violet-500 text-white font-bold bg-violet-600/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Area */}
      <div className="flex-1 min-h-0">
        {renderContent()}
      </div>
    </div>
  );
};
