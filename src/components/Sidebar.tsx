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
import { FiChevronLeft, FiChevronRight, FiSkipForward, FiCircle } from 'react-icons/fi';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void; isCollapsed?: boolean; onToggleCollapse?: () => void }> = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
 const navigate = useNavigate();
 const location = useLocation();
 const currentPath = location.pathname.replace(/^\//, '') || 'dashboard';

 const { 
 timerStatus, 
 timerMode, 
 secondsLeft, 
 setTimerStatus, 
 resetTimer,
 settings,
 tasks,
 githubIssues,
 totalSessionsCompleted
 } = useStore();

 const workspaceItems = [
 { id: 'dashboard', label: 'Dashboard', icon: FiLayout },
 { id: 'kanban', label: 'Kanban Board', icon: TrelloIcon, badge: tasks?.length || 0 },
 { id: 'notes', label: 'Notes', icon: FiFileText, badge: 3 },
 { id: 'calendar', label: 'Calendar', icon: FiCalendar, badge: 2 },
 ];

 const toolsItems = [
 { id: 'pomodoro', label: 'Pomodoro', icon: FiClock },
 { id: 'goals', label: 'Goals & Habits', icon: FiTarget },
 { id: 'whiteboard', label: 'Whiteboard', icon: FiPenTool },
 { id: 'github', label: 'GitHub Sync', icon: GithubIcon, alert: githubIssues?.length > 0 },
 { id: 'settings', label: 'Settings', icon: FiSettings },
 ];

 // Helper to format remaining seconds into mm:ss
 const formatTime = (secs: number) => {
 const m = Math.floor(secs / 60).toString().padStart(2, '0');
 const s = (secs % 60).toString().padStart(2, '0');
 return `${m}:${s}`;
 };

 const getTimerLabel = () => {
 if (timerMode === 'work') return 'FOCUS';
 if (timerMode === 'shortBreak') return 'SHORT BREAK';
 return 'LONG BREAK';
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
 <aside className={`${isCollapsed ? 'w-20 bg-[#161434]' : 'w-64 bg-[#0a0a0c]'} h-screen fixed left-0 top-0 border-r border-zinc-900 flex flex-col justify-between z-50 transition-all duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
 
 {/* Top Section: Collapse Toggle & Brand */}
 <div className={`pt-5 pb-4 border-b border-zinc-900 relative flex ${isCollapsed ? 'flex-col items-center px-0' : 'items-center justify-between px-5'}`}>
 {!isCollapsed && (
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-sm shrink-0">
 <FiTerminal className="w-5 h-5 text-zinc-300" />
 </div>
 <div>
 <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
 DevFlow
 </h1>
 <p className="text-[10px] text-zinc-600 font-mono mt-0.5">v1.0.0 · 2026</p>
 </div>
 </div>
 )}
 
 {/* Collapse Toggle Button */}
 {onToggleCollapse && (
   <button 
     onClick={onToggleCollapse}
     className={`flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-800 bg-[#0f0f11] text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors z-50 ${isCollapsed ? 'mt-2' : ''}`}
     title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
   >
     {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
   </button>
 )}
 </div>

 {/* Navigation List */}
 <div className={`flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar ${isCollapsed ? 'px-2 flex flex-col items-center space-y-2' : 'px-4'}`}>
   
   {/* WORKSPACE SECTION */}
   {!isCollapsed && (
     <div className="mb-2 px-1">
       <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">Workspace</span>
     </div>
   )}
   <nav className={`space-y-1 mb-6 ${isCollapsed ? 'w-full flex flex-col items-center' : ''}`}>
   {workspaceItems.map((item) => {
   const Icon = item.icon;
   const isActive = currentPath === item.id;
   return (
   <button
   key={item.id}
   onClick={() => { navigate(item.id === 'dashboard' ? '/' : `/${item.id}`); onClose(); }}
   title={isCollapsed ? item.label : undefined}
   className={`
     group cursor-pointer transition-all duration-200 relative flex
     ${isCollapsed 
       ? 'flex-col items-center justify-center w-12 h-12 rounded-xl gap-1' 
       : 'flex-row items-center w-full h-11 rounded-xl px-3 gap-3'
     }
     ${isActive
       ? 'bg-zinc-800/80 text-white font-bold'
       : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300 font-medium'
     }
   `}
   >
   <Icon className={`shrink-0 transition-colors duration-200 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
   
   {!isCollapsed && <span className="text-[13px] tracking-wide">{item.label}</span>}
   
   {!isCollapsed && typeof item.badge === 'number' && item.badge > 0 && (
     <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold border ${isActive ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
       {item.badge}
     </span>
   )}
   </button>
   );
   })}
   </nav>

   {/* TOOLS SECTION */}
   {!isCollapsed && (
     <div className="mb-2 px-1">
       <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">Tools</span>
     </div>
   )}
   <nav className={`space-y-1 ${isCollapsed ? 'w-full flex flex-col items-center' : ''}`}>
   {toolsItems.map((item) => {
   const Icon = item.icon;
   const isActive = currentPath === item.id;
   return (
   <button
   key={item.id}
   onClick={() => { navigate(item.id === 'dashboard' ? '/' : `/${item.id}`); onClose(); }}
   title={isCollapsed ? item.label : undefined}
   className={`
     group cursor-pointer transition-all duration-200 relative flex
     ${isCollapsed 
       ? 'flex-col items-center justify-center w-12 h-12 rounded-xl gap-1' 
       : 'flex-row items-center w-full h-11 rounded-xl px-3 gap-3'
     }
     ${isActive
       ? 'bg-zinc-800/80 text-white font-bold'
       : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300 font-medium'
     }
   `}
   >
   <Icon className={`shrink-0 transition-colors duration-200 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
   
   {!isCollapsed && <span className="text-[13px] tracking-wide">{item.label}</span>}
   
   {!isCollapsed && item.alert && (
     <span className="ml-auto w-5 h-5 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-500 text-[10px] font-bold">
       !
     </span>
   )}

   {item.id === 'pomodoro' && timerStatus === 'running' && isCollapsed && (
     <span className="absolute top-2 right-2 flex items-center gap-1">
       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
     </span>
   )}
   </button>
   );
   })}
   </nav>
 </div>

 {/* Footer Pomodoro Widget */}
 <div className={`p-4 mt-auto shrink-0 border-t border-zinc-900 ${isCollapsed ? 'flex justify-center p-2' : ''}`}>
 
 {isCollapsed ? (
   <button 
     onClick={() => setTimerStatus(timerStatus === 'running' ? 'paused' : 'running')}
     className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${timerStatus === 'running' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}
     title={timerStatus === 'running' ? 'Pause Pomodoro' : 'Start Pomodoro'}
   >
     {timerStatus === 'running' ? <FiPause className="w-5 h-5 text-white" /> : <FiPlay className="w-5 h-5 text-zinc-400 ml-1" />}
   </button>
 ) : (
   <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-4 flex flex-col gap-4 shadow-lg relative overflow-hidden">
     {/* Subtle gradient glow */}
     <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 to-transparent pointer-events-none" />
     
     {/* Header Row */}
     <div className="flex items-start justify-between relative z-10">
       <div className="flex flex-col gap-1">
         <div className="flex items-center gap-1.5">
           <FiCircle className={`w-2 h-2 fill-current ${timerStatus === 'running' ? 'text-zinc-400' : 'text-zinc-600'}`} />
           <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-500">
             {getTimerLabel()}
           </span>
         </div>
         <div className="text-[10px] text-zinc-500 font-medium">
           Deep work · Session {(totalSessionsCompleted % 4) + 1} of 4
         </div>
       </div>
       <span className="text-2xl font-bold tracking-tight text-white tabular-nums drop-shadow-md">
         {formatTime(secondsLeft)}
       </span>
     </div>

     {/* Segmented Progress Bar */}
     <div className="flex items-center gap-1 relative z-10">
       {[1, 2, 3, 4].map((seg) => {
         const isActiveSegment = seg === ((totalSessionsCompleted % 4) + 1);
         const isCompletedSegment = seg <= (totalSessionsCompleted % 4);
         return (
           <div key={seg} className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
             {isActiveSegment && (
               <div className="h-full bg-zinc-500 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progressPct}%` }} />
             )}
             {isCompletedSegment && (
               <div className="h-full bg-zinc-500 rounded-full" style={{ width: '100%' }} />
             )}
           </div>
         );
       })}
     </div>

     {/* Controls */}
     <div className="flex items-center gap-2 mt-1 relative z-10">
       {timerStatus === 'running' ? (
         <button 
           onClick={() => setTimerStatus('paused')}
           className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer transition-colors text-xs font-bold"
         >
           <FiPause className="w-3.5 h-3.5" />
           <span>Pause</span>
         </button>
       ) : (
         <button 
           onClick={() => setTimerStatus('running')}
           className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-[#121214] hover:bg-zinc-800 text-white cursor-pointer transition-colors text-xs font-bold"
         >
           <FiPlay className="w-3.5 h-3.5" />
           <span>Start</span>
         </button>
       )}
       <button 
         onClick={resetTimer}
         className="p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-[#121214] hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
         title="Reset"
       >
         <FiRotateCcw className="w-4 h-4" />
       </button>
       <button 
         onClick={() => { /* Implement skip logic if needed */ resetTimer(); }}
         className="p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-[#121214] hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
         title="Skip Session"
       >
         <FiSkipForward className="w-4 h-4" />
       </button>
     </div>
   </div>
 )}
 </div>
 </aside>
 </>
 );
};
