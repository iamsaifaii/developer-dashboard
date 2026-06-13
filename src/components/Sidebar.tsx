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
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

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
 settings 
 } = useStore();

 const menuItems = [
 { id: 'dashboard', label: 'Home', icon: FiLayout },
 { id: 'kanban', label: 'Planner', icon: TrelloIcon },
 { id: 'notes', label: 'Docs', icon: FiFileText },
 { id: 'calendar', label: 'Calendar', icon: FiCalendar },
 { id: 'pomodoro', label: 'Focus', icon: FiClock },
 { id: 'goals', label: 'Goals', icon: FiTarget },
 { id: 'whiteboard', label: 'Whiteboa..', icon: FiPenTool },
 { id: 'github', label: 'GitHub', icon: GithubIcon },
 { id: 'settings', label: 'More', icon: FiSettings },
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
 <aside className={`${isCollapsed ? 'w-[88px]' : 'w-64'} h-screen fixed left-0 top-0 bg-[#161434] flex flex-col justify-between z-50 transition-all duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
 
 {/* Top Section: Collapse Toggle & Brand */}
 <div className={`pt-6 pb-2 flex flex-col items-center shrink-0`}>
   {onToggleCollapse && (
     <button 
       onClick={onToggleCollapse}
       className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 cursor-pointer transition-colors mb-2"
       title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
     >
       {isCollapsed ? <FiChevronsRight className="w-5 h-5" /> : <FiChevronsLeft className="w-5 h-5" />}
     </button>
   )}
   
   {/* Horizontal Divider exactly like screenshot */}
   <div className="w-8 h-[2px] bg-white/10 rounded-full my-2" />

   {/* Expanded Brand Name (only visible when expanded) */}
   {!isCollapsed && (
     <div className="flex items-center gap-2.5 mt-4 mb-2 px-6 w-full">
       <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
         <FiTerminal className="w-4 h-4 text-[#161434]" />
       </div>
       <div>
         <h1 className="text-sm font-black tracking-tight text-white leading-none">
           DevFlow
         </h1>
         <p className="text-[9px] text-white/50 font-mono mt-0.5">v1.0.0</p>
       </div>
     </div>
   )}
 </div>

 {/* Navigation List */}
 <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar ${isCollapsed ? 'px-2 flex flex-col items-center space-y-3' : 'px-4 space-y-1.5'}`}>
 {menuItems.map((item) => {
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
     ? 'flex-col items-center justify-center w-[68px] h-[68px] rounded-[22px] gap-1.5' 
     : 'flex-row items-center w-full h-12 rounded-[18px] px-4 gap-3.5'
   }
   ${isActive
     ? 'bg-white shadow-[0_4px_20px_rgba(255,255,255,0.15)]'
     : 'hover:bg-white/10'
   }
 `}
 >
 <Icon className={`
   shrink-0 transition-colors duration-200 
   ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
   ${isActive ? 'text-[#161434]' : 'text-white/90 group-hover:text-white'}
 `} />
 <span className={`
   font-bold tracking-tight transition-colors duration-200
   ${isCollapsed ? 'text-[11px]' : 'text-[13px]'}
   ${isActive ? 'text-[#161434]' : 'text-white/90 group-hover:text-white'}
 `}>
   {item.label}
 </span>
 
 {item.id === 'pomodoro' && timerStatus === 'running' && (
 <span className={`${isCollapsed ? 'absolute top-2 right-2' : 'ml-auto flex items-center gap-1'}`}>
 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
 </span>
 )}
 </button>
 );
 })}
 </nav>

 {/* Footer Pomodoro Mini-Widget */}
 <div className={`p-4 mt-auto shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
 <div className={`rounded-[22px] ${isCollapsed ? 'w-[68px] h-[68px] bg-white/5 flex items-center justify-center p-0' : 'border border-white/10 bg-white/5 flex flex-col p-4 gap-3'}`}>
 {/* Header Row */}
 <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between w-full'}`}>
 <div className={`flex items-center gap-2 ${isCollapsed ? 'hidden' : ''}`}>
 <FiClock className={`w-3.5 h-3.5 ${timerStatus === 'running' ? 'text-white' : 'text-white/50'}`} />
 <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">
 {getTimerLabel()}
 </span>
 </div>
 {!isCollapsed && (
 <span className="text-xs font-bold font-mono text-white tabular-nums">
 {formatTime(secondsLeft)}
 </span>
 )}
 {isCollapsed && (
   <FiClock className={`w-6 h-6 ${timerStatus === 'running' ? 'text-white animate-pulse' : 'text-white/50'}`} title={`${getTimerLabel()}: ${formatTime(secondsLeft)}`} />
 )}
 </div>

 {/* Progress Bar */}
 {!isCollapsed && (
 <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
 <div 
 className="h-full bg-white rounded-full transition-all duration-1000 ease-linear"
 style={{ width: `${progressPct}%` }}
 />
 </div>
 )}

 {/* Mini controls */}
 {!isCollapsed && (
 <div className="flex items-center justify-center gap-2.5 mt-1">
 {timerStatus === 'running' ? (
 <button 
 onClick={() => setTimerStatus('paused')}
 className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white cursor-pointer transition-colors text-[11px] font-semibold"
 title="Pause"
 >
 <FiPause className="w-3.5 h-3.5" />
 <span>Pause</span>
 </button>
 ) : (
 <button 
 onClick={() => setTimerStatus('running')}
 className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-[#161434] cursor-pointer transition-colors text-[11px] font-bold"
 title="Start"
 >
 <FiPlay className="w-3.5 h-3.5 fill-[#161434] stroke-none ml-0.5" />
 <span>Start</span>
 </button>
 )}
 <button 
 onClick={resetTimer}
 className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
 title="Reset"
 >
 <FiRotateCcw className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 </div>
 </div>
 </aside>
 </>
 );
};
