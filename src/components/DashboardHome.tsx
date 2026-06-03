import React from 'react';
import { useStore } from '../store/useStore';
import { 
 FiCalendar, 
 FiClock, 
 FiStar,
 FiActivity,
 FiZap,
 FiChevronRight
} from 'react-icons/fi';
import { TrelloIcon, GithubIcon } from './BrandIcons';

interface DashboardHomeProps {
 onNavigate: (tab: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
 const { tasks, events, githubCommits, timerStatus, secondsLeft, totalSessionsCompleted, settings } = useStore();

 // 1. Calculations
 const completedTasks = tasks.filter(t => t.columnId === 'done').length;
 const inProgressTasks = tasks.filter(t => t.columnId === 'in-progress');
 const upcomingEvents = events.filter(e => {
 const today = new Date().toISOString().split('T')[0];
 return e.start >= today;
 }).slice(0, 3);

 const formatTime = (secs: number) => {
 const m = Math.floor(secs / 60).toString().padStart(2, '0');
 const s = (secs % 60).toString().padStart(2, '0');
 return `${m}:${s}`;
 };

 // Calculations for productivity index (dynamic)
 const calculateScore = () => {
 const base = 0; // Starts from 0
 const taskScore = completedTasks * 8;
 const commitScore = githubCommits.length * 3;
 const sessionScore = totalSessionsCompleted * 6;
 return Math.min(100, base + taskScore + commitScore + sessionScore);
 };

 return (
 <div className="space-y-6 text-left">
 
 {/* 1. Welcome Banner */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-white dark:bg-black shadow-2xl">
 <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-neutral-100 dark:bg-neutral-800/5 blur-3xl pointer-events-none" />
 <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-neutral-100 dark:bg-neutral-800/5 blur-3xl pointer-events-none" />

 <div className="space-y-2.5 z-10 max-w-xl">
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-300 dark:border-neutral-700/50 text-xxs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
 <FiStar className="w-3.5 h-3.5" />
 <span>Developer Productivity Suite</span>
 </div>
 <h2 className="text-xl md:text-2xl font-black tracking-tight text-black dark:text-white leading-tight">
 Supercharge Your Sprint Workspace
 </h2>
 <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
 Your automated velocity dashboard is active and synced to <span className="text-neutral-700 dark:text-neutral-300 font-bold">@{settings.githubUsername || 'your account'}</span>. Complete tasks, focus sessions, and GitHub commits to increase your productivity index!
 </p>
 </div>

 {/* Highlight Score Widget */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 w-full md:w-56 flex flex-col items-center justify-center gap-1 z-10 shrink-0 text-center shadow-lg bg-white dark:bg-black/20">
 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Productivity Index</span>
 <div className="text-4xl font-black text-black dark:text-white my-1 flex items-baseline gap-0.5">
 <span>{calculateScore()}%</span>
 <span className="text-xs text-neutral-500 font-bold">Z-INDEX</span>
 </div>
 <p className="text-xxs text-neutral-500 dark:text-neutral-400 font-semibold flex items-center gap-1.5 uppercase">
 <FiActivity className="w-3.5 h-3.5" />
 <span>Optimal Velocity</span>
 </p>
 </div>
 </div>

 {/* 2. Grid Dashboard Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 
 {/* Card 1: Active Pomodoro Timer panel */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
 <div className="flex items-center justify-between border-b border-neutral-300 dark:border-black pb-3">
 <div className="flex items-center gap-2">
 <FiClock className="w-4.5 h-4.5 text-neutral-500 dark:text-neutral-400" />
 <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Pomodoro Clock</h3>
 </div>
 <button 
 onClick={() => onNavigate('pomodoro')} 
 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 flex items-center gap-0.5 cursor-pointer"
 >
 <span>Full timer</span>
 <FiChevronRight className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="flex flex-col items-center justify-center p-3 text-center">
 <div className="text-3xl font-extrabold text-black dark:text-white drop-shadow-md tracking-tight tabular-nums">
 {formatTime(secondsLeft)}
 </div>
 <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mt-1 block">
 Status: {timerStatus === 'running' ? 'Focusing' : 'Idle'}
 </span>
 </div>

 <button
 onClick={() => onNavigate('pomodoro')}
 className="w-full py-2 bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 dark:bg-neutral-800 text-xxs font-bold rounded-xl text-neutral-700 dark:text-neutral-300 cursor-pointer text-center"
 >
 Start Focus Session
 </button>
 </div>

 {/* Card 2: In-Progress Kanban Cards */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
 <div className="flex items-center justify-between border-b border-neutral-300 dark:border-black pb-3">
 <div className="flex items-center gap-2">
 <TrelloIcon className="w-4.5 h-4.5 text-neutral-500 dark:text-neutral-400" />
 <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Sprint Sprints</h3>
 </div>
 <span className="text-[9px] font-bold text-neutral-500 bg-white dark:bg-black px-2 py-0.5 rounded">
 {inProgressTasks.length} In Progress
 </span>
 </div>

 <div className="space-y-2.5 overflow-y-auto max-h-[120px] pr-1">
 {inProgressTasks.length === 0 ? (
 <p className="text-[10px] text-neutral-500 italic text-center py-4">No tasks currently in progress.</p>
 ) : (
 inProgressTasks.map(task => (
 <div 
 key={task.id} 
 onClick={() => onNavigate('kanban')}
 className="p-2 bg-white dark:bg-black/20 hover:bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 rounded-xl cursor-pointer flex flex-col gap-1 text-left"
 >
 <h4 className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">{task.title}</h4>
 <div className="flex justify-between items-center text-[9px] text-neutral-500">
 <span className={`uppercase font-bold ${task.priority === 'high' ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-500'}`}>
 {task.priority}
 </span>
 {task.dueDate && <span>Due: {task.dueDate}</span>}
 </div>
 </div>
 ))
 )}
 </div>

 <button
 onClick={() => onNavigate('kanban')}
 className="w-full py-2 bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 dark:bg-neutral-800 text-xxs font-bold rounded-xl text-neutral-700 dark:text-neutral-300 cursor-pointer text-center"
 >
 Manage Kanban Board
 </button>
 </div>

 {/* Card 3: Scheduled Calendar Events */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
 <div className="flex items-center justify-between border-b border-neutral-300 dark:border-black pb-3">
 <div className="flex items-center gap-2">
 <FiCalendar className="w-4.5 h-4.5 text-neutral-500 dark:text-neutral-400" />
 <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Daily Schedule</h3>
 </div>
 <button 
 onClick={() => onNavigate('calendar')} 
 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 flex items-center gap-0.5 cursor-pointer"
 >
 <span>Calendar</span>
 <FiChevronRight className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="space-y-2.5 overflow-y-auto max-h-[120px] pr-1">
 {upcomingEvents.length === 0 ? (
 <p className="text-[10px] text-neutral-500 italic text-center py-4">No events scheduled today.</p>
 ) : (
 upcomingEvents.map(e => (
 <div 
 key={e.id}
 onClick={() => onNavigate('calendar')}
 className="p-2 border border-neutral-200 dark:border-neutral-850/80 bg-white dark:bg-black/15 hover:bg-white dark:bg-black/30 rounded-xl flex items-center gap-2 text-left cursor-pointer"
 >
 <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color || '#64748b' }} />
 <div className="truncate space-y-0.5">
 <h4 className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">{e.title}</h4>
 <p className="text-[8px] text-neutral-500">{e.start}</p>
 </div>
 </div>
 ))
 )}
 </div>

 <button
 onClick={() => onNavigate('calendar')}
 className="w-full py-2 bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 dark:bg-neutral-800 text-xxs font-bold rounded-xl text-neutral-700 dark:text-neutral-300 cursor-pointer text-center"
 >
 Open Scheduler
 </button>
 </div>

 {/* Card 4: Recent Git Commit activity */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl lg:col-span-2 text-left space-y-4">
 <div className="flex items-center justify-between border-b border-neutral-300 dark:border-black pb-3">
 <div className="flex items-center gap-2">
 <GithubIcon className="w-4.5 h-4.5 text-neutral-500 dark:text-neutral-400" />
 <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Recent Commits</h3>
 </div>
 <button 
 onClick={() => onNavigate('github')} 
 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 flex items-center gap-0.5 cursor-pointer"
 >
 <span>GitHub hub</span>
 <FiChevronRight className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1">
 {githubCommits.slice(0, 3).map(commit => (
 <div 
 key={commit.id} 
 className="p-2.5 bg-white dark:bg-black/15 border border-neutral-200 dark:border-neutral-850 rounded-xl flex items-center justify-between gap-3 text-[11px]"
 >
 <div className="truncate space-y-0.5">
 <h5 className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{commit.message}</h5>
 <p className="text-[8px] text-neutral-500">Repo: {commit.repoName} • Author: @{commit.author}</p>
 </div>
 <span className="text-[8px] text-neutral-500 shrink-0 font-bold bg-white dark:bg-black border border-neutral-300 dark:border-black px-1.5 py-0.5 rounded">
 {commit.date}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Card 5: Explainer info cards */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl lg:col-span-1 text-left flex flex-col justify-between gap-3">
 <div className="space-y-1.5">
 <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
 <FiZap className="w-3.5 h-3.5" />
 <span>Hiring Manager Review</span>
 </h4>
 <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
 This platform demonstrates advanced client-side frontend engineering capabilities. Centralized Zustand store handles data caching, local storage ensures persistence, and Web Audio API synthesizes real-time cues. Switch between tabs to see active clocks and checklists update!
 </p>
 </div>
 <div className="h-px bg-neutral-100 dark:bg-neutral-800/60" />
 <div className="text-[9px] text-neutral-500 flex items-center gap-1.5 justify-between">
 <span>React Ecosystem 2026</span>
 <span className="text-neutral-700 dark:text-neutral-300 font-bold">100% Client-Side</span>
 </div>
 </div>

 </div>

 </div>
 );
};
export default DashboardHome;
