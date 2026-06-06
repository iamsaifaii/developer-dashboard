import React, { useState } from 'react';
import { AIChat } from './AIChat';
import { StandupGenerator } from './StandupGenerator';
import { SmartSuggestions } from './SmartSuggestions';
import { ProductivityAnalytics } from './ProductivityAnalytics';
import { ProjectSummary } from './ProjectSummary';
import { NotesSummarizer } from './NotesSummarizer';
import { AutomationPanel } from './AutomationPanel';
import { 
  FiCpu, FiMessageSquare, FiTrendingUp, FiLayers, 
  FiBookOpen, FiActivity
} from 'react-icons/fi';

export const DevPilotAI: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'standup' | 'suggestions' | 'analytics' | 'summary' | 'notes' | 'automation'>('chat');

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
        return <AIChat apiKey="" />;
      case 'standup':
        return <StandupGenerator apiKey="" />;
      case 'suggestions':
        return <SmartSuggestions apiKey="" />;
      case 'analytics':
        return <ProductivityAnalytics apiKey="" />;
      case 'summary':
        return <ProjectSummary apiKey="" />;
      case 'notes':
        return <NotesSummarizer apiKey="" />;
      case 'automation':
        return <AutomationPanel apiKey="" />;
    }
  };

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
