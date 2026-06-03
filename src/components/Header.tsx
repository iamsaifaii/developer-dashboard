import React from 'react';
import { useStore } from '../store/useStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
 FiPlus, 
 FiSearch, 
 FiUser,
 FiBell,
 FiLogOut,
 FiMenu
} from 'react-icons/fi';
import { GithubIcon } from './BrandIcons';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
 onQuickTaskClick: () => void;
 onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onQuickTaskClick, onOpenSidebar }) => {
 const { currentUser, setCurrentUser, activeTab, githubConnected, githubUsername, settings } = useStore();

 const handleLogout = async () => {
 try {
 await signOut(auth);
 setCurrentUser(null);
 } catch (error) {
 console.error('Logout error', error);
 }
 };

 const getTitle = () => {
 switch (activeTab) {
 case 'dashboard': return 'Productivity Dashboard';
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
 <header className="h-20 border-b border-neutral-200 dark:border-neutral-800/80 px-4 md:px-8 flex items-center justify-between glass-panel sticky top-0 z-20">
 <div className="flex items-center gap-3">
 <button 
 onClick={onOpenSidebar}
 className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
 >
 <FiMenu className="w-5 h-5" />
 </button>
 {/* Dynamic Title */}
 <div className="hidden sm:block">
 <h2 className="text-lg md:text-xl font-bold tracking-tight text-black dark:text-white">{getTitle()}</h2>
 <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
 {getGreeting()}, <span className="text-neutral-700 dark:text-neutral-300 font-medium">{currentUser?.displayName || settings.userName}</span> — let's build something great.
 </p>
 </div>
 </div>

 {/* Header Actions */}
 <div className="flex items-center gap-5">
 {/* Search Bar */}
 <div className="relative hidden md:block w-64">
 <FiSearch className="w-4.5 h-4.5 text-neutral-500 dark:text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
 <input 
 type="text" 
 placeholder="Search workspace..." 
 className="w-full text-xs pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-800/80 text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500/20"
 />
 </div>

 {/* Quick Task Button */}
 <button
 onClick={onQuickTaskClick}
 className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700  text-black dark:text-white rounded-lg cursor-pointer"
 >
 <FiPlus className="w-4 h-4" />
 <span>New Task</span>
 </button>

 {/* Divider */}
 <div className="h-6 w-px bg-neutral-100 dark:bg-neutral-800/60" />

 {/* GitHub Status Indicator */}
 <div 
 className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs  ${
 githubConnected 
 ? 'bg-neutral-100 dark:bg-neutral-800/40 border-neutral-300 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-300' 
 : 'bg-white dark:bg-black/40 border-neutral-200 dark:border-neutral-800/60 text-neutral-500 dark:text-neutral-400'
 }`}
 title={githubConnected ? `Synced to @${githubUsername}` : 'GitHub disconnect'}
 >
 <GithubIcon className="w-4 h-4" />
 <span className="max-w-[100px] truncate">
 {githubConnected ? `@${githubUsername || currentUser?.displayName || 'User'}` : 'Offline'}
 </span>
 <span className={`w-1.5 h-1.5 rounded-full ${githubConnected ? 'bg-neutral-400' : 'bg-neutral-600'}`} />
 </div>

 {/* Profile / Notification placeholder */}
 <div className="flex items-center gap-3">
 <ThemeToggle />
 <button className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-200 bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-800 rounded-lg cursor-pointer relative">
 <FiBell className="w-4.5 h-4.5" />
 <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full absolute top-1.5 right-1.5" />
 </button>
 <button 
 onClick={handleLogout}
 title="Log Out"
 className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-800/60 hover:border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:bg-neutral-800/80 rounded-lg cursor-pointer"
 >
 <FiLogOut className="w-4.5 h-4.5" />
 </button>
 <div className="w-9 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-700 p-0.5 flex items-center justify-center cursor-pointer shadow-md shadow-neutral-900/10 overflow-hidden">
 {currentUser?.photoURL ? (
 <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full rounded-[6px] object-cover" />
 ) : (
 <div className="w-full h-full rounded-[6px] bg-white dark:bg-black flex items-center justify-center">
 <FiUser className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
 </div>
 )}
 </div>
 </div>
 </div>
 </header>
 );
};
