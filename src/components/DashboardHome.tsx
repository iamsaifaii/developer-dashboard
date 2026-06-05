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
 const completedTasks = (tasks || []).filter(t => t.columnId === 'done').length;
 const inProgressTasks = (tasks || []).filter(t => t.columnId === 'in-progress');
 const upcomingEvents = (events || []).filter(e => {
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
 const commitScore = (githubCommits || []).length * 3;
 const sessionScore = totalSessionsCompleted * 6;
 return Math.min(100, base + taskScore + commitScore + sessionScore);
 };

 return (
 <div className="space-y-6 text-left">
 
 {/* 1. Welcome Banner */}
 <div className="glass-panel rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
 <div className="space-y-2.5 z-10 max-w-xl">
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xxs font-bold text-zinc-300 uppercase tracking-widest">
 <FiStar className="w-3.5 h-3.5" />
 <span>Developer Productivity Suite</span>
 </div>
 <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-white leading-tight">
 Supercharge Your Sprint Workspace
 </h2>
 <p className="text-xs text-zinc-400 leading-relaxed font-light">
 Your automated velocity dashboard is active and synced to <span className="text-zinc-200 font-bold">@{settings.githubUsername || 'your account'}</span>. Complete tasks, focus sessions, and GitHub commits to increase your productivity index!
 </p>
 </div>

 {/* Highlight Score Widget */}
 <div className="glass-panel border border-zinc-800 rounded-xl p-5 w-full md:w-52 flex flex-col items-center justify-center gap-1 z-10 shrink-0 text-center bg-zinc-900/60 shadow-sm">
 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Productivity Index</span>
 <div className="text-3xl font-extrabold text-white my-1 flex items-baseline gap-0.5">
 <span>{calculateScore()}%</span>
 <span className="text-[9px] text-zinc-500 font-bold">Z-INDEX</span>
 </div>
 <p className="text-[9px] text-zinc-400 font-bold flex items-center gap-1.5 uppercase">
 <FiActivity className="w-3.5 h-3.5" />
 <span>Optimal Velocity</span>
 </p>
 </div>
 </div>

 {/* 2. Grid Dashboard Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 
 {/* Card 1: Active Pomodoro Timer panel */}
 <div className="glass-panel rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
 <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
 <div className="flex items-center gap-2">
 <FiClock className="w-4 h-4 text-zinc-400" />
 <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Pomodoro Clock</h3>
 </div>
 <button 
 onClick={() => onNavigate('pomodoro')} 
 className="text-[9px] font-bold text-zinc-400 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
 >
 <span>Full timer</span>
 <FiChevronRight className="w-3 h-3" />
 </button>
 </div>

 <div className="flex flex-col items-center justify-center p-3 text-center">
 <div className="text-2xl font-bold text-white tracking-tight font-mono">
 {formatTime(secondsLeft)}
 </div>
 <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mt-1 block">
 Status: {timerStatus === 'running' ? 'Focusing' : 'Idle'}
 </span>
 </div>

 <button
 onClick={() => onNavigate('pomodoro')}
 className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xxs font-bold rounded-lg text-zinc-200 cursor-pointer text-center transition-colors"
 >
 Start Focus Session
 </button>
 </div>

 {/* Card 2: In-Progress Kanban Cards */}
 <div className="glass-panel rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
 <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
 <div className="flex items-center gap-2">
 <TrelloIcon className="w-4 h-4 text-zinc-400" />
 <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Active Sprints</h3>
 </div>
 <span className="text-[9px] font-bold text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
 {inProgressTasks.length} In Progress
 </span>
 </div>

 <div className="space-y-2 overflow-y-auto max-h-[120px] pr-1">
 {inProgressTasks.length === 0 ? (
 <p className="text-[10px] text-zinc-500 italic text-center py-4">No tasks currently in progress.</p>
 ) : (
 inProgressTasks.map(task => (
 <div 
 key={task.id} 
 onClick={() => onNavigate('kanban')}
 className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer flex flex-col gap-1 text-left transition-colors"
 >
 <h4 className="text-xs font-semibold text-zinc-200 truncate">{task.title}</h4>
 <div className="flex justify-between items-center text-[9px] text-zinc-500">
 <span className={`uppercase font-bold ${task.priority === 'high' ? 'text-zinc-300' : 'text-zinc-500'}`}>
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
 className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xxs font-bold rounded-lg text-zinc-200 cursor-pointer text-center transition-colors"
 >
 Manage Kanban Board
 </button>
 </div>

 {/* Card 3: Scheduled Calendar Events */}
 <div className="glass-panel rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
 <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
 <div className="flex items-center gap-2">
 <FiCalendar className="w-4 h-4 text-zinc-400" />
 <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Daily Schedule</h3>
 </div>
 <button 
 onClick={() => onNavigate('calendar')} 
 className="text-[9px] font-bold text-zinc-400 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
 >
 <span>Calendar</span>
 <FiChevronRight className="w-3 h-3" />
 </button>
 </div>

 <div className="space-y-2 overflow-y-auto max-h-[120px] pr-1">
 {upcomingEvents.length === 0 ? (
 <p className="text-[10px] text-zinc-500 italic text-center py-4">No events scheduled today.</p>
 ) : (
 upcomingEvents.map(e => (
 <div 
 key={e.id}
 onClick={() => onNavigate('calendar')}
 className="p-2 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 rounded-lg flex items-center gap-2 text-left cursor-pointer transition-colors"
 >
 <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color || '#64748b' }} />
 <div className="truncate space-y-0.5">
 <h4 className="text-xs font-semibold text-zinc-300 truncate">{e.title}</h4>
 <p className="text-[8px] text-zinc-500">{e.start}</p>
 </div>
 </div>
 ))
 )}
 </div>

 <button
 onClick={() => onNavigate('calendar')}
 className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xxs font-bold rounded-lg text-zinc-200 cursor-pointer text-center transition-colors"
 >
 Open Scheduler
 </button>
 </div>

 {/* Card 4: Recent Git Commit activity */}
 <div className="glass-panel rounded-xl p-5 shadow-sm lg:col-span-2 text-left space-y-4">
 <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
 <div className="flex items-center gap-2">
 <GithubIcon className="w-4 h-4 text-zinc-400" />
 <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Recent Commits</h3>
 </div>
 <button 
 onClick={() => onNavigate('github')} 
 className="text-[9px] font-bold text-zinc-400 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
 >
 <span>GitHub hub</span>
 <FiChevronRight className="w-3 h-3" />
 </button>
 </div>

 <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1">
 {(githubCommits || []).slice(0, 3).map(commit => (
 <div 
 key={commit.id} 
 className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between gap-3 text-xxs"
 >
 <div className="truncate space-y-0.5">
 <h5 className="font-semibold text-zinc-200 truncate">{commit.message}</h5>
 <p className="text-[8px] text-zinc-500 font-mono">Repo: {commit.repoName} • Author: @{commit.author}</p>
 </div>
 <span className="text-[8px] text-zinc-400 shrink-0 font-bold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
 {commit.date}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Card 5: Explainer info cards */}
 <div className="glass-panel rounded-xl p-5 shadow-sm lg:col-span-1 text-left flex flex-col justify-between gap-3">
 <div className="space-y-1.5">
 <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
 <FiZap className="w-4 h-4" />
 <span>Hiring Manager Review</span>
 </h4>
 <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
 This platform demonstrates advanced client-side frontend engineering capabilities. Centralized Zustand store handles data caching, local storage ensures persistence, and Web Audio API synthesizes real-time cues. Switch between tabs to see active clocks and checklists update!
 </p>
 </div>
 <div className="h-px bg-zinc-800 my-1" />
 <div className="text-[9px] text-zinc-500 flex items-center gap-1.5 justify-between">
 <span>React Ecosystem 2026</span>
 <span className="text-white font-bold">100% Client-Side</span>
 </div>
 </div>

 </div>

 </div>
 );
};
export default DashboardHome;
