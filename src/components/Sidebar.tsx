import React from 'react';
import { useStore } from '../store/useStore';
import { 
 FiLayout, 
 FiFileText, 
 FiCalendar, 
 FiClock, 
 FiSettings, 
 FiTerminal,
 FiPlay,
 FiPause,
 FiRotateCcw,
 FiPenTool
} from 'react-icons/fi';


import { TrelloIcon, GithubIcon } from './BrandIcons';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
 const { 
 activeTab, 
 setActiveTab, 
 timerStatus, 
 timerMode, 
 secondsLeft, 
 setTimerStatus, 
 resetTimer,
 settings 
 } = useStore();

 const menuItems = [
 { id: 'dashboard', label: 'Dashboard', icon: FiLayout },
 { id: 'kanban', label: 'Kanban Board', icon: TrelloIcon },
 { id: 'notes', label: 'Notes System', icon: FiFileText },
 { id: 'calendar', label: 'Calendar', icon: FiCalendar },
 { id: 'pomodoro', label: 'Pomodoro', icon: FiClock },
 { id: 'whiteboard', label: 'Whiteboard', icon: FiPenTool },
 { id: 'github', label: 'GitHub Sync', icon: GithubIcon },
 { id: 'settings', label: 'Settings', icon: FiSettings },
 ];

 // Helper to format remaining seconds into mm:ss
 const formatTime = (secs: number) => {
 const m = Math.floor(secs / 60).toString().padStart(2, '0');
 const s = (secs % 60).toString().padStart(2, '0');
 return `${m}:${s}`;
 };

 const getTimerLabel = () => {
 if (timerMode === 'work') return 'Focus';
 if (timerMode === 'shortBreak') return 'Short Break';
 return 'Long Break';
 };

 return (
 <>
 {isOpen && (
 <div 
 className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity" 
 onClick={onClose} 
 />
 )}
 <aside className={`w-64 h-screen fixed left-0 top-0 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
 {/* Brand Header */}
 <div className="p-5 border-b border-zinc-900">
 <div className="flex items-center gap-2.5">
 <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
 <FiTerminal className="w-4 h-4 text-white" />
 </div>
 <div>
 <h1 className="text-sm font-bold tracking-tight text-white">
 DevFlow
 </h1>
 <p className="text-[9px] text-zinc-500 font-mono">v1.0.0 (2026)</p>
 </div>
 </div>
 </div>

 {/* Navigation List */}
 <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-3">
 {menuItems.map((item) => {
 const Icon = item.icon;
 const isActive = activeTab === item.id;
 return (
 <button
 key={item.id}
 onClick={() => { setActiveTab(item.id); onClose(); }}
 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg group cursor-pointer transition-all border ${
 isActive
 ? 'bg-zinc-900 border-zinc-800 text-white font-medium shadow-sm'
 : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border-transparent'
 }`}
 >
 <Icon className={`w-4 h-4 ${
 isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-350'
 }`} />
 <span className="text-xs tracking-wide">{item.label}</span>
 {item.id === 'pomodoro' && timerStatus === 'running' && (
 <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
 )}
 </button>
 );
 })}
 </nav>

 {/* Footer Pomodoro Mini-Widget */}
 <div className="p-3 border-t border-zinc-900 bg-zinc-950">
 <div className={`p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col gap-2.5`}>
 <div className="flex items-center justify-between">
 <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-400">
 {getTimerLabel()}
 </span>
 <span className="text-xxs font-bold font-mono text-zinc-200">
 {formatTime(secondsLeft)}
 </span>
 </div>

 {/* Progress Bar */}
 <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
 <div 
 className="h-full bg-white"
 style={{ 
 width: `${(secondsLeft / ((timerMode === 'work' ? settings.pomodoroWorkTime : timerMode === 'shortBreak' ? settings.pomodoroShortBreak : settings.pomodoroLongBreak) * 60)) * 100}%` 
 }}
 />
 </div>

 {/* Mini controls */}
 <div className="flex items-center justify-center gap-3 mt-0.5">
 {timerStatus === 'running' ? (
 <button 
 onClick={() => setTimerStatus('paused')}
 className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
 title="Pause"
 >
 <FiPause className="w-3.5 h-3.5" />
 </button>
 ) : (
 <button 
 onClick={() => setTimerStatus('running')}
 className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
 title="Start"
 >
 <FiPlay className="w-3.5 h-3.5" />
 </button>
 )}
 <button 
 onClick={resetTimer}
 className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer"
 title="Reset"
 >
 <FiRotateCcw className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 </aside>
 </>
 );
};
