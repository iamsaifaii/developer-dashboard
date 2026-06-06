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
  <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-neutral-900 sticky top-0 z-20">
  <div className="flex items-center gap-3">
  <button 
  onClick={onOpenSidebar}
  className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
  >
  <FiMenu className="w-5 h-5" />
  </button>
  {/* Dynamic Title */}
  <div className="hidden sm:block">
  <h2 className="text-sm font-bold tracking-tight text-white">{getTitle()}</h2>
  <p className="text-xxs text-zinc-400 mt-0.5">
  {getGreeting()}, <span className="text-zinc-200 font-semibold">{currentUser?.displayName || settings.userName}</span> — let's build something great.
  </p>
  </div>
  </div>
 
  {/* Header Actions */}
  <div className="flex items-center gap-3">
  {/* Search Bar (Desktop) */}
  <GlobalSearch />
  
  {/* Mobile Search Icon */}
  <div className="md:hidden">
    <GlobalSearch isMobile={true} />
  </div>
 
  {/* Quick Task Button */}
  <button
  onClick={onQuickTaskClick}
  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-150 rounded-lg cursor-pointer transition-colors"
  >
  <FiPlus className="w-3.5 h-3.5" />
  <span>New Task</span>
  </button>
 
  {/* Divider */}
  <div className="hidden md:block h-5 w-px bg-zinc-850" />
 
  {/* GitHub Status Indicator */}
  <div 
  className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xxs font-medium ${
  githubConnected 
  ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
  : 'bg-zinc-950 border-zinc-850 text-zinc-500'
  }`}
  title={githubConnected ? `Synced to @${githubUsername}` : 'GitHub disconnect'}
  >
  <GithubIcon className="w-3.5 h-3.5" />
  <span className="max-w-[90px] truncate">
  {githubConnected ? `@${githubUsername || currentUser?.displayName || 'User'}` : 'Offline'}
  </span>
  <span className={`w-1.5 h-1.5 rounded-full ${githubConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-650'}`} />
  </div>
 
  {/* Profile / Notification center */}
  <div className="flex items-center gap-2.5">
  <NotificationCenter />
  <button 
  onClick={handleLogout}
  title="Log Out"
  className="p-2 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer transition-colors"
  >
  <FiLogOut className="w-4 h-4" />
  </button>
  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-800 p-0.5 flex items-center justify-center cursor-pointer overflow-hidden shadow-inner">
     <img src={avatarToShow} alt="Avatar" className="w-full h-full rounded-[6px] object-cover" />
  </div>
  </div>
  </div>
  </header>
 );
};
