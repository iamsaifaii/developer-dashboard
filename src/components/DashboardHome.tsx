import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
 FiCalendar, 
 FiClock, 
 FiStar,
 FiActivity,
 FiZap,
 FiChevronRight,
 FiAlertCircle

} from 'react-icons/fi';
import { TrelloIcon, GithubIcon } from './BrandIcons';

interface DashboardHomeProps {
 onNavigate: (tab: string) => void;
}

interface SmartReminder {
  title: string;
  message: string;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
 const { tasks, events, githubCommits, timerStatus, secondsLeft, totalSessionsCompleted, settings, githubUsername } = useStore();
 const [reminders, setReminders] = useState<SmartReminder[]>([]);

 // 1. Fetch smart reminders from the backend
 useEffect(() => {
   fetch('/api/reminders/generate', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ tasks, pomodoroSessions: totalSessionsCompleted })
   })
     .then(res => res.json())
     .then(data => {
       if (data && data.reminders) {
         setReminders(data.reminders);
       }
     })
     .catch(err => console.error('Error fetching smart reminders:', err));
 }, [tasks, totalSessionsCompleted]);

 // 2. Calculations
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
 <div className="space-y-6 text-left animate-fade-in-up">
 
 {/* 1. Welcome Banner */}
 <div className="glass-panel p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
 <div className="space-y-3 z-10 max-w-xl relative">
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111113] border border-zinc-800 text-[9px] font-extrabold text-zinc-300 uppercase tracking-[0.15em] shadow-sm">
 <FiStar className="w-3 h-3 text-white" />
 <span>Developer Productivity Suite</span>
 </div>
 <h2 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
 Supercharge Your<br/>Sprint Workspace
 </h2>
 <p className="text-xs text-zinc-400 leading-relaxed font-medium">
 Your automated velocity dashboard is active and synced to <span className="text-white font-bold px-1 py-0.5 rounded bg-zinc-800/50 border border-zinc-800 mx-0.5">@{githubUsername || settings.githubUsername || 'your account'}</span>. Complete tasks, focus sessions, and GitHub commits to increase your productivity index!
 </p>
 </div>

 {/* Highlight Score Widget */}
 <div className="rounded-2xl border border-zinc-800/80 p-5 w-full md:w-52 flex flex-col items-center justify-center gap-1.5 z-10 shrink-0 text-center bg-[#080809]/80 backdrop-blur-md shadow-2xl card-lift">
 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Productivity Index</span>
 <div className="text-4xl font-black text-white my-1 flex items-baseline gap-1 tracking-tighter">
 <span>{calculateScore()}%</span>
 <span className="text-[10px] text-zinc-500 font-bold tracking-widest">Z-IDX</span>
 </div>
 <p className="text-[9px] text-green-400 font-bold flex items-center gap-1.5 uppercase tracking-wide bg-green-950/30 border border-green-900/50 px-2 py-0.5 rounded-full mt-1">
 <FiActivity className="w-3 h-3" />
 <span>Optimal Velocity</span>
 </p>
 </div>
 </div>

 {/* Smart Reminders Banner */}
 {reminders.length > 0 && (
   <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden panel-in">
     <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
     <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-wider pl-2">
       <FiAlertCircle className="w-4 h-4 text-white" />
       <span>DevPilot Smart Reminders</span>
     </div>
     <div className="flex flex-col md:flex-row md:items-center gap-3 text-xs pl-2">
       {reminders.map((r, idx) => (
         <div key={idx} className="flex-1 bg-[#0a0a0a] border border-zinc-800/80 rounded-lg p-3 card-lift shadow-sm">
           <strong className="text-white font-semibold">{r.title}:</strong>{' '}
           <span className="text-zinc-400 font-medium">{r.message}</span>
         </div>
       ))}
     </div>
   </div>
 )}


 {/* 2. Grid Dashboard Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 
 {/* Card 1: Active Pomodoro Timer panel */}
 <div className="glass-panel-interactive p-5 flex flex-col justify-between gap-4 group">
 <div className="flex items-center justify-between pb-3">
 <div className="flex items-center gap-2">
 <div className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800">
 <FiClock className="w-3.5 h-3.5 text-zinc-300" />
 </div>
 <h3 className="text-xs font-bold text-white uppercase tracking-wide">Pomodoro Clock</h3>
 </div>
 <button 
 onClick={() => onNavigate('pomodoro')} 
 className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors bg-transparent border border-transparent hover:bg-zinc-900 hover:border-zinc-800 px-2 py-1 rounded-md"
 >
 <span>Full timer</span>
 <FiChevronRight className="w-3 h-3" />
 </button>
 </div>

 <div className="flex flex-col items-center justify-center p-4 text-center rounded-xl bg-[#080809] border border-zinc-800/60 my-2 shadow-inner">
 <div className="text-3xl font-black text-white tracking-tighter font-mono">
 {formatTime(secondsLeft)}
 </div>
 <div className="flex items-center gap-1.5 mt-2">
   <span className={`w-1.5 h-1.5 rounded-full ${timerStatus === 'running' ? 'bg-green-500 status-dot-online' : 'bg-zinc-600'}`} />
   <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">
   {timerStatus === 'running' ? 'Focusing' : 'Idle'}
   </span>
 </div>
 </div>

 <button
 onClick={() => onNavigate('pomodoro')}
 className="w-full py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-lg cursor-pointer text-center transition-all duration-200 shadow-sm btn-press"
 >
 Start Focus Session
 </button>
 </div>

 {/* Card 2: In-Progress Kanban Cards */}
 <div className="glass-panel-interactive p-5 flex flex-col justify-between gap-4 group">
 <div className="flex items-center justify-between pb-3">
 <div className="flex items-center gap-2">
 <div className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800">
 <TrelloIcon className="w-3.5 h-3.5 text-zinc-300" />
 </div>
 <h3 className="text-xs font-bold text-white uppercase tracking-wide">Active Sprints</h3>
 </div>
 <span className="text-[9px] font-bold text-white bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded shadow-sm">
 {inProgressTasks.length} In Progress
 </span>
 </div>

 <div className="space-y-2 overflow-y-auto max-h-[130px] pr-1 custom-scrollbar">
 {inProgressTasks.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-6 text-center">
   <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
     <FiZap className="w-3.5 h-3.5 text-zinc-600" />
   </div>
   <p className="text-[10px] text-zinc-500 font-medium">No tasks currently in progress.</p>
 </div>
 ) : (
 inProgressTasks.map(task => (
 <div 
 key={task.id} 
 onClick={() => onNavigate('kanban')}
 className="p-3 bg-[#080809] hover:bg-[#111113] border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer flex flex-col gap-1.5 text-left transition-all duration-200"
 >
 <h4 className="text-xs font-bold text-zinc-200 truncate">{task.title}</h4>
 <div className="flex justify-between items-center text-[9px] text-zinc-500">
 <span className={`uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${task.priority === 'urgent' ? 'text-red-400 border-red-500/20 bg-red-500/10' : task.priority === 'high' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' : 'text-zinc-400 border-zinc-800 bg-zinc-900'}`}>
 {task.priority}
 </span>
 {task.dueDate && <span className="font-medium flex items-center gap-1"><FiCalendar className="w-2.5 h-2.5"/> {task.dueDate}</span>}
 </div>
 </div>
 ))
 )}
 </div>

 <button
 onClick={() => onNavigate('kanban')}
 className="w-full py-2 bg-[#111113] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold rounded-lg text-white cursor-pointer text-center transition-all duration-200 shadow-sm"
 >
 Manage Kanban Board
 </button>
 </div>

 {/* Card 3: Scheduled Calendar Events */}
 <div className="glass-panel-interactive p-5 flex flex-col justify-between gap-4 group">
 <div className="flex items-center justify-between pb-3">
 <div className="flex items-center gap-2">
 <div className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800">
 <FiCalendar className="w-3.5 h-3.5 text-zinc-300" />
 </div>
 <h3 className="text-xs font-bold text-white uppercase tracking-wide">Daily Schedule</h3>
 </div>
 <button 
 onClick={() => onNavigate('calendar')} 
 className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors bg-transparent border border-transparent hover:bg-zinc-900 hover:border-zinc-800 px-2 py-1 rounded-md"
 >
 <span>Calendar</span>
 <FiChevronRight className="w-3 h-3" />
 </button>
 </div>

 <div className="space-y-2 overflow-y-auto max-h-[130px] pr-1 custom-scrollbar">
 {upcomingEvents.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-6 text-center">
 <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
   <FiCalendar className="w-3.5 h-3.5 text-zinc-600" />
 </div>
 <p className="text-[10px] text-zinc-500 font-medium">No events scheduled today.</p>
</div>
 ) : (
 upcomingEvents.map(e => (
 <div 
 key={e.id}
 onClick={() => onNavigate('calendar')}
 className="p-2.5 border border-zinc-800 bg-[#080809] hover:bg-[#111113] hover:border-zinc-700 rounded-xl flex items-center gap-3 text-left cursor-pointer transition-all duration-200"
 >
 <span className="w-1.5 h-6 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: e.color || '#e4e4e7' }} />
 <div className="truncate space-y-0.5">
 <h4 className="text-xs font-bold text-zinc-200 truncate">{e.title}</h4>
 <p className="text-[9px] text-zinc-500 font-medium flex items-center gap-1"><FiClock className="w-2.5 h-2.5"/> {e.start}</p>
 </div>
 </div>
 ))
 )}
 </div>

 <button
 onClick={() => onNavigate('calendar')}
 className="w-full py-2 bg-[#111113] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold rounded-lg text-white cursor-pointer text-center transition-all duration-200 shadow-sm"
 >
 Open Scheduler
 </button>
 </div>

 {/* Card 4: Recent Git Commit activity */}
 <div className="glass-panel-interactive p-5 lg:col-span-2 text-left flex flex-col gap-4">
 <div className="flex items-center justify-between pb-2">
 <div className="flex items-center gap-2">
 <div className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800">
 <GithubIcon className="w-3.5 h-3.5 text-zinc-300" />
 </div>
 <h3 className="text-xs font-bold text-white uppercase tracking-wide">Recent Commits</h3>
 </div>
 <button 
 onClick={() => onNavigate('github')} 
 className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors bg-transparent border border-transparent hover:bg-zinc-900 hover:border-zinc-800 px-2 py-1 rounded-md"
 >
 <span>GitHub hub</span>
 <FiChevronRight className="w-3 h-3" />
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {(githubCommits || []).slice(0, 3).map(commit => (
 <div 
 key={commit.id} 
 className="p-3 bg-[#080809] border border-zinc-800 hover:border-zinc-700 rounded-xl flex flex-col justify-between gap-2 transition-all duration-200 group"
 >
 <div className="space-y-1">
 <h5 className="font-bold text-xs text-zinc-200 truncate group-hover:text-white transition-colors">{commit.message}</h5>
 <p className="text-[9px] text-zinc-500 font-mono truncate">{commit.repoName}</p>
 </div>
 <div className="flex items-center justify-between mt-1">
   <div className="flex items-center gap-1.5">
     <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
       <span className="text-[8px] font-bold text-zinc-300">{(commit.author || 'U')[0].toUpperCase()}</span>
     </div>
     <span className="text-[9px] text-zinc-400 font-medium">{commit.author}</span>
   </div>
   <span className="text-[9px] text-zinc-500 font-medium">
     {commit.date}
   </span>
 </div>
 </div>
 ))}
 {(!githubCommits || githubCommits.length === 0) && (
   <div className="md:col-span-3 py-6 flex flex-col items-center justify-center text-center bg-[#080809] border border-zinc-800 border-dashed rounded-xl">
      <GithubIcon className="w-5 h-5 text-zinc-700 mb-2" />
      <p className="text-[10px] text-zinc-500 font-medium">No recent commits found.</p>
   </div>
 )}
 </div>
 </div>

 {/* Card 5: Explainer info cards */}
 <div className="glass-panel p-5 lg:col-span-1 text-left flex flex-col justify-between gap-3 relative overflow-hidden group">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
 <div className="space-y-2 relative z-10">
 <div className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 inline-block mb-1">
   <FiZap className="w-3.5 h-3.5 text-zinc-300" />
 </div>
 <h4 className="text-xs font-bold uppercase tracking-wide text-white">
 Platform Architecture
 </h4>
 <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
 This dashboard leverages a high-performance React architecture. Zustand manages global state across active widgets, ensuring your timer, kanban, and GitHub data remain perfectly synchronized.
 </p>
 </div>
 <div className="relative z-10 mt-2">
  <div className="h-px bg-zinc-800/80 mb-3" />
  <div className="flex flex-wrap items-center gap-1.5">
  <span className="text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">React</span>
  <span className="text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">Zustand</span>
  <span className="text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded">Tailwind</span>
  <span className="text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-1 rounded ml-auto flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Client-Side</span>
  </div>
 </div>
 </div>

 </div>

 </div>
 );
};
export default DashboardHome;
