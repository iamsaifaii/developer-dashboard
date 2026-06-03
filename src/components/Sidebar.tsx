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
 FiRotateCcw
} from 'react-icons/fi';
import { TrelloIcon, GithubIcon } from './BrandIcons';

export const Sidebar: React.FC = () => {
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
 { id: 'github', label: 'GitHub Sync', icon: GithubIcon },
 { id: 'settings', label: 'Settings', icon: FiSettings },
 ];

 // Helper to format remaining seconds into mm:ss
 const formatTime = (secs: number) => {
 const m = Math.floor(secs / 60).toString().padStart(2, '0');
 const s = (secs % 60).toString().padStart(2, '0');
 return `${m}:${s}`;
 };

 const getTimerColorClass = () => {
 if (timerMode === 'work') return 'text-neutral-700 dark:text-neutral-300 bg-white dark:bg-black/40 border-neutral-300 dark:border-neutral-700/40';
 if (timerMode === 'shortBreak') return 'text-neutral-700 dark:text-neutral-300 bg-white dark:bg-black/40 border-neutral-300 dark:border-neutral-700/40';
 return 'text-neutral-700 dark:text-neutral-300 bg-white dark:bg-black/40 border-neutral-300 dark:border-neutral-700/40';
 };

 const getTimerLabel = () => {
 if (timerMode === 'work') return 'Focus';
 if (timerMode === 'shortBreak') return 'Short Break';
 return 'Long Break';
 };

 return (
 <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between z-30">
 {/* Brand Header */}
 <div className="p-6">
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 shadow-lg shadow-neutral-900/20">
 <FiTerminal className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
 </div>
 <div>
 <h1 className="text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
 DevPulse
 </h1>
 <p className="text-xxs text-neutral-500">v1.0.0 (2026)</p>
 </div>
 </div>
 </div>

 {/* Navigation List */}
 <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2">
 {menuItems.map((item) => {
 const Icon = item.icon;
 const isActive = activeTab === item.id;
 return (
 <button
 key={item.id}
 onClick={() => setActiveTab(item.id)}
 className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl  group cursor-pointer ${
 isActive
 ? 'bg-neutral-100 dark:bg-neutral-800 border-l-2 border-neutral-500 text-neutral-800 dark:text-neutral-200 font-medium'
 : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800/40 border-l-2 border-transparent'
 }`}
 >
 <Icon className={`w-5 h-5  group- ${
 isActive ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:text-neutral-300'
 }`} />
 <span className="text-sm tracking-wide">{item.label}</span>
 {item.id === 'pomodoro' && timerStatus === 'running' && (
 <span className="ml-auto w-2 h-2 rounded-full bg-neutral-400" />
 )}
 </button>
 );
 })}
 </nav>

 {/* Footer Pomodoro Mini-Widget */}
 <div className="p-4 border-t border-neutral-200 dark:border-neutral-800/60 bg-white dark:bg-black/20">
 <div className={`p-3 rounded-xl border ${getTimerColorClass()} flex flex-col gap-2 `}>
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold tracking-wide uppercase">
 {getTimerLabel()}
 </span>
 <span className="text-xs font-bold">
 {formatTime(secondsLeft)}
 </span>
 </div>

 {/* Progress Bar */}
 <div className="w-full h-1 bg-white dark:bg-black rounded-full overflow-hidden">
 <div 
 className={`h-full  bg-neutral-500`}
 style={{ 
 width: `${(secondsLeft / ((timerMode === 'work' ? settings.pomodoroWorkTime : timerMode === 'shortBreak' ? settings.pomodoroShortBreak : settings.pomodoroLongBreak) * 60)) * 100}%` 
 }}
 />
 </div>

 {/* Mini controls */}
 <div className="flex items-center justify-center gap-4 mt-1">
 {timerStatus === 'running' ? (
 <button 
 onClick={() => setTimerStatus('paused')}
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800/80 rounded text-neutral-700 dark:text-neutral-300 cursor-pointer"
 title="Pause"
 >
 <FiPause className="w-3.5 h-3.5" />
 </button>
 ) : (
 <button 
 onClick={() => setTimerStatus('running')}
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800/80 rounded text-neutral-700 dark:text-neutral-300 cursor-pointer"
 title="Start"
 >
 <FiPlay className="w-3.5 h-3.5" />
 </button>
 )}
 <button 
 onClick={resetTimer}
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800/80 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 cursor-pointer"
 title="Reset"
 >
 <FiRotateCcw className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 </aside>
 );
};
