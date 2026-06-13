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
  <header className="h-16 border-b border-[#222] px-6 flex items-center justify-between bg-black sticky top-0 z-20 transition-all duration-300">
  <div className="flex items-center gap-4">
  <button 
  onClick={onOpenSidebar}
  className="lg:hidden p-2 rounded-md hover:bg-[#222] text-[#ccc] hover:text-white transition-colors duration-200 cursor-pointer flex items-center justify-center"
  >
  <FiMenu className="w-5 h-5" />
  </button>
  {/* Dynamic Title */}
  <div className="hidden sm:flex flex-col justify-center">
  <h2 className="text-sm font-semibold tracking-wide text-white leading-tight">{getTitle()}</h2>
  <p className="text-xs text-[#ccc] mt-0.5 leading-none">
  {getGreeting()}, <span className="text-white font-medium">{currentUser?.displayName || settings.userName}</span>
  </p>
  </div>
  </div>
 
  {/* Header Actions */}
  <div className="flex items-center gap-4">
  {/* Search Bar (Desktop) */}
  <div className="hidden md:flex items-center">
    <GlobalSearch />
  </div>
  
  {/* Mobile Search Icon */}
  <div className="md:hidden flex items-center">
    <GlobalSearch isMobile={true} />
  </div>
 
  {/* Quick Task Button */}
  <button
  onClick={onQuickTaskClick}
  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-white hover:bg-[#e0e0e0] text-black rounded-md cursor-pointer transition-colors duration-200"
  >
  <FiPlus className="w-4 h-4" />
  <span className="hidden sm:inline">New Task</span>
  </button>
 
  {/* Divider */}
  <div className="hidden md:block h-6 w-[1px] bg-[#333]" />
 
  {/* GitHub Status Indicator */}
  <div 
  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors duration-200 ${
  githubConnected 
  ? 'bg-[#111] border-[#333] text-black dark:text-white' 
  : 'bg-black border-[#222] text-[#ccc]'
  }`}
  title={githubConnected ? `Synced to @${githubUsername}` : 'GitHub disconnected'}
  >
  <GithubIcon className="w-4 h-4 shrink-0" />
  <span className="max-w-[100px] truncate">
  {githubConnected ? `@${githubUsername || currentUser?.displayName || 'User'}` : 'Offline'}
  </span>
  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${githubConnected ? 'bg-white' : 'bg-[#444]'}`} />
  </div>
 
  {/* Profile / Notification center */}
  <div className="flex items-center gap-3">
  <NotificationCenter />
  <button 
  onClick={handleLogout}
  title="Log Out"
  className="p-2 text-[#ccc] hover:text-white bg-transparent hover:bg-[#222] border border-transparent rounded-md cursor-pointer transition-colors duration-200 flex items-center justify-center"
  >
  <FiLogOut className="w-4 h-4" />
  </button>
  <div className="w-9 h-9 rounded-full bg-[#111] border border-[#333] flex items-center justify-center cursor-pointer overflow-hidden hover:border-white transition-colors duration-200 shrink-0">
     <img src={avatarToShow} alt="Avatar" className="w-full h-full object-cover" />
  </div>
  </div>
  </div>
  </header>
 );
};
