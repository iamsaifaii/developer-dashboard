import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardHome } from './components/DashboardHome';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { NotesManager } from './components/Notes/NotesManager';
import { ProjectCalendar } from './components/Calendar/ProjectCalendar';
import { PomodoroTimer } from './components/Pomodoro/PomodoroTimer';
import { GithubDashboard } from './components/Github/GithubDashboard';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { TaskModal } from './components/Kanban/TaskModal';
import { LoginScreen } from './components/Auth/LoginScreen';
import { playChime } from './components/Pomodoro/SoundPlayer';

function App() {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const { 
 currentUser,
 activeTab, 
 timerStatus, 
 tick, 
 addTask,
 settings 
 } = useStore();

 const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);

 // 0. Sync Theme
 useEffect(() => {
   if (settings.colorScheme === 'dark') {
     document.documentElement.classList.add('dark');
   } else {
     document.documentElement.classList.remove('dark');
   }
 }, [settings.colorScheme]);

 // 1. Global Pomodoro Clock Loop
 useEffect(() => {
 let interval: any = null;

 if (timerStatus === 'running') {
 interval = setInterval(() => {
 // Read current seconds before ticking
 const currentSeconds = useStore.getState().secondsLeft;
 
 // If it's about to hit zero, play chime right before state resets
 if (currentSeconds <= 1) {
 playChime();
 }

 tick();
 }, 1000);
 } else {
 if (interval) clearInterval(interval);
 }

 return () => {
 if (interval) clearInterval(interval);
 };
 }, [timerStatus, tick]);

 // 2. Global Quick Task Saving
 const handleQuickTaskSave = (taskData: {
 title: string;
 description: string;
 priority: 'low' | 'medium' | 'high';
 tags: string[];
 subtasks: any[];
 dueDate?: string;
 }) => {
 addTask({
 title: taskData.title,
 description: taskData.description,
 columnId: 'todo', // defaults to To Do column
 priority: taskData.priority,
 tags: taskData.tags,
 subtasks: taskData.subtasks,
 dueDate: taskData.dueDate
 });
 };

 // 3. Tab rendering switcher
 const renderTabContent = () => {
 switch (activeTab) {
 case 'dashboard':
 return <DashboardHome onNavigate={(tab) => useStore.getState().setActiveTab(tab)} />;
 case 'kanban':
 return <KanbanBoard />;
 case 'notes':
 return <NotesManager />;
 case 'calendar':
 return <ProjectCalendar />;
 case 'pomodoro':
 return <PomodoroTimer />;
 case 'github':
 return <GithubDashboard />;
 case 'settings':
 return <SettingsPanel />;
 default:
 return <DashboardHome onNavigate={(tab) => useStore.getState().setActiveTab(tab)} />;
 }
 };

 if (!currentUser) {
 return <LoginScreen />;
 }

 return (
    <div className={`min-h-screen ${settings.themeMode === 'glass' ? 'bg-white dark:bg-black' : 'bg-white dark:bg-black'} text-black dark:text-neutral-100 flex relative overflow-hidden `}>

 {/* Primary Sidebar Layout */}
 <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

 {/* Main Content Area */}
 <div className="flex-1 pl-0 lg:pl-64 flex flex-col h-screen overflow-hidden w-full">
 {/* Workspace Top Header */}
 <Header 
 onQuickTaskClick={() => setIsQuickTaskOpen(true)} 
 onOpenSidebar={() => setIsMobileMenuOpen(true)}
 />

 {/* Workspace Views Wrapper */}
 <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
 <>
 <div
 key={activeTab}
 className="h-full"
 >
 {renderTabContent()}
 </div>
 </>
 </main>
 </div>

 {/* Global Quick-Add Task modal */}
 <TaskModal
 isOpen={isQuickTaskOpen}
 onClose={() => setIsQuickTaskOpen(false)}
 onSave={handleQuickTaskSave}
 />
 </div>
 );
}

export default App;
