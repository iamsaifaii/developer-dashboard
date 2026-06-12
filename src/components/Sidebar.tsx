import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
 FiPenTool,
 FiTarget
} from 'react-icons/fi';


import { TrelloIcon, GithubIcon } from './BrandIcons';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
 const navigate = useNavigate();
 const location = useLocation();
 const currentPath = location.pathname.replace(/^\//, '') || 'dashboard';

 const { 
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
 { id: 'goals', label: 'Goals & Habits', icon: FiTarget },
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

 const totalSeconds = (timerMode === 'work' ? settings.pomodoroWorkTime : timerMode === 'shortBreak' ? settings.pomodoroShortBreak : settings.pomodoroLongBreak) * 60;
 const progressPct = (secondsLeft / totalSeconds) * 100;

 return (
 <>
 {isOpen && (
 <div 
 className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
 onClick={onClose} 
 />
 )}
 <aside className={`w-64 h-screen fixed left-0 top-0 bg-[#080809] border-r border-zinc-900 flex flex-col justify-between z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
 {/* Brand Header */}
 <div className="px-5 pt-5 pb-4 border-b border-zinc-900">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
 <FiTerminal className="w-4 h-4 text-black" />
 </div>
 <div>
 <h1 className="text-sm font-black tracking-tight text-white leading-none">
 DevFlow
 </h1>
 <p className="text-[9px] text-zinc-600 font-mono mt-0.5">v1.0.0 · 2026</p>
 </div>
 </div>
 </div>

 {/* Navigation List */}
 <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto py-3">
 {menuItems.map((item) => {
 const Icon = item.icon;
 const isActive = currentPath === item.id;
 return (
 <button
 key={item.id}
 onClick={() => { navigate(item.id === 'dashboard' ? '/' : `/${item.id}`); onClose(); }}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group cursor-pointer transition-all duration-150 relative ${
 isActive
 ? 'bg-white/8 text-white font-semibold nav-item-active'
 : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
 }`}
 >
 <Icon className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
 isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
 }`} />
 <span className="text-xs tracking-wide">{item.label}</span>
 {item.id === 'pomodoro' && timerStatus === 'running' && (
 <span className="ml-auto flex items-center gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
 </span>
 )}
 </button>
 );
 })}
 </nav>

 {/* Footer Pomodoro Mini-Widget */}
 <div className="p-3 border-t border-zinc-900">
 <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 flex flex-col gap-3">
 {/* Header Row */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1.5">
 <FiClock className={`w-3 h-3 ${timerStatus === 'running' ? 'text-white' : 'text-zinc-500'}`} />
 <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">
 {getTimerLabel()}
 </span>
 </div>
 <span className="text-xs font-bold font-mono text-zinc-200 tabular-nums">
 {formatTime(secondsLeft)}
 </span>
 </div>

 {/* Progress Bar */}
 <div className="w-full h-[3px] bg-zinc-900 rounded-full overflow-hidden">
 <div 
 className="h-full bg-white rounded-full transition-all duration-1000 ease-linear"
 style={{ width: `${progressPct}%` }}
 />
 </div>

 {/* Mini controls */}
 <div className="flex items-center justify-center gap-2">
 {timerStatus === 'running' ? (
 <button 
 onClick={() => setTimerStatus('paused')}
 className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer transition-colors text-[10px] font-semibold"
 title="Pause"
 >
 <FiPause className="w-3 h-3" />
 <span>Pause</span>
 </button>
 ) : (
 <button 
 onClick={() => setTimerStatus('running')}
 className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black cursor-pointer transition-colors text-[10px] font-bold"
 title="Start"
 >
 <FiPlay className="w-3 h-3 fill-black stroke-none" />
 <span>Start</span>
 </button>
 )}
 <button 
 onClick={resetTimer}
 className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors"
 title="Reset"
 >
 <FiRotateCcw className="w-3 h-3" />
 </button>
 </div>
 </div>
 </div>
 </aside>
 </>
 );
};
