import React from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  FiMenu, 
  FiPlus, 
  FiLogOut
} from 'react-icons/fi';
import { GithubIcon } from './BrandIcons';
import { NotificationCenter } from './Notifications/NotificationCenter';
import { GlobalSearch } from './Search/GlobalSearch';


interface HeaderProps {
 onQuickTaskClick: () => void;
 onOpenSidebar: () => void;
}

 export const Header: React.FC<HeaderProps> = ({ onQuickTaskClick, onOpenSidebar }) => {
  const { currentUser, setCurrentUser, githubConnected, githubUsername, settings } = useStore();
  const location = useLocation();
  const currentPath = location.pathname.replace(/^\//, '') || 'dashboard';

 const avatarToShow = settings.avatarUrl || currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(settings.userName || currentUser?.displayName || 'Dev')}`;

 const handleLogout = async () => {
 try {
 await signOut(auth);
 setCurrentUser(null);
 } catch (error) {
 console.error('Logout error', error);
 }
 };

 const getTitle = () => {
 switch (currentPath) {
 case 'dashboard': return 'Productivity Dashboard';
 case 'ai': return 'DevPilot AI Workspace';
 case 'kanban': return 'Sprint Kanban';
 case 'notes': return 'Markdown Notes';
 case 'calendar': return 'Project Calendar';
 case 'pomodoro': return 'Focus Session';
 case 'github': return 'GitHub Integration';
 case 'settings': return 'User Settings';
 default: return 'Developer Hub';
 }
 };

 const getGreeting = () => {
 const hours = new Date().getHours();
 if (hours < 12) return 'Good morning';
 if (hours < 18) return 'Good afternoon';
 return 'Good evening';
 };

 return (
  <header className="h-[60px] border-b border-zinc-900 px-5 flex items-center justify-between bg-[#080809]/95 backdrop-blur-md sticky top-0 z-20">
  <div className="flex items-center gap-3">
  <button 
  onClick={onOpenSidebar}
  className="lg:hidden p-2 rounded-lg hover:bg-zinc-800/80 text-zinc-500 hover:text-white transition-colors cursor-pointer"
  >
  <FiMenu className="w-4.5 h-4.5" />
  </button>
  {/* Dynamic Title */}
  <div className="hidden sm:block">
  <h2 className="text-[13px] font-bold tracking-tight text-white leading-none">{getTitle()}</h2>
  <p className="text-[10px] text-zinc-600 mt-1 leading-none">
  {getGreeting()}, <span className="text-zinc-400 font-semibold">{currentUser?.displayName || settings.userName}</span>
  </p>
  </div>
  </div>
 
  {/* Header Actions */}
  <div className="flex items-center gap-2.5">
  {/* Search Bar (Desktop) */}
  <GlobalSearch />
  
  {/* Mobile Search Icon */}
  <div className="md:hidden">
    <GlobalSearch isMobile={true} />
  </div>
 
  {/* Quick Task Button */}
  <button
  onClick={onQuickTaskClick}
  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white hover:bg-zinc-200 text-black rounded-lg cursor-pointer transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] btn-press"
  >
  <FiPlus className="w-3.5 h-3.5" />
  <span className="hidden sm:inline">New Task</span>
  </button>
 
  {/* Divider */}
  <div className="hidden md:block h-5 w-px bg-zinc-800/60" />
 
  {/* GitHub Status Indicator */}
  <div 
  className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-colors ${
  githubConnected 
  ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300' 
  : 'bg-zinc-950 border-zinc-900 text-zinc-600'
  }`}
  title={githubConnected ? `Synced to @${githubUsername}` : 'GitHub disconnected'}
  >
  <GithubIcon className="w-3.5 h-3.5 shrink-0" />
  <span className="max-w-[80px] truncate">
  {githubConnected ? `@${githubUsername || currentUser?.displayName || 'User'}` : 'Offline'}
  </span>
  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${githubConnected ? 'bg-green-500 status-dot-online' : 'bg-zinc-700'}`} />
  </div>
 
  {/* Profile / Notification center */}
  <div className="flex items-center gap-2">
  <NotificationCenter />
  <button 
  onClick={handleLogout}
  title="Log Out"
  className="p-1.5 text-zinc-500 hover:text-white bg-transparent border border-zinc-800/80 hover:border-zinc-700 rounded-lg cursor-pointer transition-all duration-150"
  >
  <FiLogOut className="w-3.5 h-3.5" />
  </button>
  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center cursor-pointer overflow-hidden ring-1 ring-transparent hover:ring-zinc-600 transition-all duration-150">
     <img src={avatarToShow} alt="Avatar" className="w-full h-full rounded-[6px] object-cover" />
  </div>
  </div>
  </div>
  </header>
 );
};
