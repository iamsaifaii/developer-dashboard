import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
 FiLayout, 
 FiFileText, 
 FiCalendar, 
 FiClock, 
 FiSettings, 
 FiPlay,
 FiPause,
 FiRotateCcw,
 FiPenTool,
 FiTarget,
 FiUsers,
 FiBook,
 FiShield,
 FiCheckSquare
} from 'react-icons/fi';


import { TrelloIcon, GithubIcon } from './BrandIcons';
import { FiChevronLeft, FiChevronRight, FiSkipForward, FiCircle } from 'react-icons/fi';
import { WorkspaceSwitcher } from './Teams/WorkspaceSwitcher';

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
 totalSessionsCompleted,
 pendingInvites
 } = useStore();

 const workspaceItems = [
 { id: 'dashboard', label: 'Dashboard', icon: FiLayout },
 { id: 'projects', label: 'Projects To-Do', icon: FiCheckSquare },
 { id: 'kanban', label: 'Kanban Board', icon: TrelloIcon },
 { id: 'notes', label: 'Notes', icon: FiFileText },
 { id: 'calendar', label: 'Calendar', icon: FiCalendar },
 { id: 'teams', label: 'Teams', icon: FiUsers, badge: pendingInvites.length > 0 ? pendingInvites.length : undefined },
 ];

 const toolsItems = [
 { id: 'pomodoro', label: 'Pomodoro', icon: FiClock },
 { id: 'goals', label: 'Goals & Habits', icon: FiTarget },
 { id: 'whiteboard', label: 'Whiteboard', icon: FiPenTool },
 { id: 'github', label: 'GitHub Sync', icon: GithubIcon },
 { id: 'guide', label: 'User Guide', icon: FiBook },
 { id: 'terms', label: 'Terms', icon: FiShield },
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
 <aside className={`${isCollapsed ? 'w-20 bg-indigo-950' : 'w-60 bg-black'} h-screen fixed left-0 top-0 border-r border-zinc-900 flex flex-col justify-between z-50 transition-all duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
 
  {/* Top Section: Collapse Toggle & Brand */}
  <div className={`h-16 shrink-0 border-b border-zinc-800 relative flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
  <div className="flex items-center gap-3">
  <div className="w-8 h-8 rounded-lg bg-black border border-zinc-800 flex items-center justify-center shadow-sm shrink-0">
  <img src="/icon.svg" alt="DevFlow Logo" className="w-5 h-5 object-contain" />
  </div>
  {!isCollapsed && (
  <div>
  <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
  DevFlow
  </h1>
  <p className="text-[10px] text-zinc-600 font-mono mt-0.5">v1.0.0 · 2026</p>
  </div>
  )}
  </div>
  
  {/* Collapse Toggle Button */}
  {onToggleCollapse && (
    <button 
      onClick={onToggleCollapse}
      className="absolute top-4 -right-4 flex items-center justify-center w-8 h-8 rounded-full border border-zinc-700 bg-black text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-all duration-300 z-50 shadow-md"
      title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
    >
      {isCollapsed ? <FiChevronRight className="w-4 h-4 ml-0.5" /> : <FiChevronLeft className="w-4 h-4 mr-0.5" />}
    </button>
  )}
  </div>

 {/* Navigation List */}
 <div className={`flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar ${isCollapsed ? 'px-2 flex flex-col items-center space-y-2' : 'px-4'}`}>
   
   {/* WORKSPACE SECTION */}
   {!isCollapsed && (
     <div className="mb-0.5 px-1">
       <span className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase">Workspace</span>
     </div>
   )}
   <nav className={`space-y-0 mb-1.5 ${isCollapsed ? 'w-full flex flex-col items-center' : ''}`}>
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
       : 'flex-row items-center w-full h-7 rounded-lg px-3 gap-3'
     }
     ${isActive
       ? 'bg-zinc-800/80 text-white font-bold'
       : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-300 font-medium'
     }
   `}
   >
   <Icon className={`shrink-0 transition-colors duration-200 ${isCollapsed ? 'w-3.5 h-3.5' : 'w-3 h-3'} ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-400'}`} />
   
   {!isCollapsed && <span className="text-[11px] tracking-wide">{item.label}</span>}

   {/* Badge for pending invites */}
   {item.badge && (
     <span className={`ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold ${isCollapsed ? 'absolute top-1.5 right-1.5 w-3.5 h-3.5 min-w-0 text-[8px]' : ''}`}>
       {item.badge}
     </span>
   )}
   </button>
   );
   })}
   </nav>

   {/* TOOLS SECTION */}
   {!isCollapsed && (
     <div className="mb-0.5 px-1">
       <span className="text-[9px] font-bold text-zinc-600 tracking-widest uppercase">Tools</span>
     </div>
   )}
   <nav className={`space-y-0 ${isCollapsed ? 'w-full flex flex-col items-center' : ''}`}>
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
       : 'flex-row items-center w-full h-7 rounded-lg px-3 gap-3'
     }
     ${isActive
       ? 'bg-zinc-800/80 text-white font-bold'
       : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-300 font-medium'
     }
   `}
   >
   <Icon className={`shrink-0 transition-colors duration-200 ${isCollapsed ? 'w-3.5 h-3.5' : 'w-3 h-3'} ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-400'}`} />
   
   {!isCollapsed && <span className="text-[11px] tracking-wide">{item.label}</span>}

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

 {/* Footer: WorkspaceSwitcher + Pomodoro Widget */}
 <div className={`mt-auto shrink-0 border-t border-zinc-800 ${isCollapsed ? '' : ''}`}>
   {/* Workspace Switcher */}
   <div className={`p-1 border-b border-zinc-800/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
     <WorkspaceSwitcher isCollapsed={isCollapsed} />
   </div>

   {/* Pomodoro widget */}
   <div className={`p-4 ${isCollapsed ? 'flex justify-center p-2' : ''}`}>
 
 {isCollapsed ? (
   <button 
     onClick={() => setTimerStatus(timerStatus === 'running' ? 'paused' : 'running')}
     className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${timerStatus === 'running' ? 'bg-zinc-800 border-zinc-700' : 'bg-black border-zinc-800 hover:bg-zinc-900'}`}
     title={timerStatus === 'running' ? 'Pause Pomodoro' : 'Start Pomodoro'}
   >
     {timerStatus === 'running' ? <FiPause className="w-5 h-5 text-white" /> : <FiPlay className="w-5 h-5 text-zinc-400 ml-1" />}
   </button>
 ) : (
   <div className="rounded-xl border border-zinc-800/80 bg-black p-2 flex flex-col gap-1.5 shadow-lg relative overflow-hidden">
     {/* Subtle gradient glow */}
     <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 to-transparent pointer-events-none" />
     
     {/* Header Row */}
     <div className="flex items-start justify-between relative z-10">
       <div className="flex flex-col gap-1">
         <div className="flex items-center gap-1.5">
           <FiCircle className={`w-2 h-2 fill-current ${timerStatus === 'running' ? 'text-zinc-400' : 'text-zinc-600'}`} />
           <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">
             {getTimerLabel()}
           </span>
         </div>
         <div className="text-[9px] text-zinc-400 font-medium">
           Deep work · Session {(totalSessionsCompleted % 4) + 1} of 4
         </div>
       </div>
       <span className="text-lg font-bold tracking-tight text-white tabular-nums drop-shadow-md">
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
           className="flex-1 flex items-center justify-center gap-1 py-1 rounded-md border border-zinc-700 hover:border-zinc-500 bg-black hover:bg-zinc-900 text-white cursor-pointer transition-colors text-[9px] font-bold"
         >
           <FiPause className="w-2.5 h-2.5" />
           <span>Pause</span>
         </button>
       ) : (
         <button 
           onClick={() => setTimerStatus('running')}
           className="flex-1 flex items-center justify-center gap-1 py-1 rounded-md border border-zinc-700 hover:border-zinc-500 bg-black hover:bg-zinc-900 text-white cursor-pointer transition-colors text-[9px] font-bold"
         >
           <FiPlay className="w-2.5 h-2.5" />
           <span>Start</span>
         </button>
       )}
       <button 
         onClick={resetTimer}
         className="p-1 rounded-md border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-zinc-900 text-zinc-400 hover:text-zinc-300 cursor-pointer transition-colors"
         title="Reset"
       >
         <FiRotateCcw className="w-3 h-3" />
       </button>
       <button 
         onClick={() => { /* Implement skip logic if needed */ resetTimer(); }}
         className="p-1 rounded-md border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-zinc-900 text-zinc-400 hover:text-zinc-300 cursor-pointer transition-colors"
         title="Skip Session"
       >
         <FiSkipForward className="w-3 h-3" />
       </button>
     </div>
   </div>
 )}
 </div>{/* end pomodoro div */}
 </div>{/* end footer wrapper */}
 </aside>
 </>
 );
};
