import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getProviderIds, validateGithubToken } from './lib/auth';
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
import { WhiteboardCanvas } from './components/Whiteboard/WhiteboardCanvas';
import { LoginScreen } from './components/Auth/LoginScreen';
import { playChime } from './components/Pomodoro/SoundPlayer';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { 
    currentUser,
    activeTab, 
    timerStatus, 
    tick, 
    addTask,
    settings,
    githubToken,
    fetchRealGithubData,
    setCurrentUser,
    setLinkedProviders,
    setGithubToken,
    isHydratingFromCloud,
    cloudSyncStatus,
    cloudSyncError,
    checkOverdueTasks
  } = useStore();

  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);

  // Auth persistence listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
        // Populate linked providers from Firebase user data
        setLinkedProviders(getProviderIds(user));
      } else {
        setCurrentUser(null);
        setLinkedProviders([]);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [setCurrentUser, setLinkedProviders]);

  // Auto fetch GitHub Data — runs once per session when user+token are ready
  const githubFetchedRef = useRef(false);
  useEffect(() => {
    if (currentUser && githubToken && !githubFetchedRef.current) {
      githubFetchedRef.current = true;
      // Validate token first — clear if stale (401)
      validateGithubToken(githubToken).then(valid => {
        if (valid) {
          fetchRealGithubData();
        } else {
          console.warn('GitHub token is stale — clearing.');
          setGithubToken(null);
        }
      });
    }
    if (!currentUser || !githubToken) {
      githubFetchedRef.current = false;
    }
  }, [currentUser, githubToken, fetchRealGithubData, setGithubToken]);

  // 2. Request browser notification permission once on mount (for push overdue alerts)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // 3. Overdue task checker — runs on mount and every 60 seconds
  useEffect(() => {
    if (!currentUser) return;
    // Run immediately after user loads
    checkOverdueTasks();
    const interval = setInterval(() => {
      checkOverdueTasks();
    }, 60_000);
    return () => clearInterval(interval);
  }, [currentUser, checkOverdueTasks]);

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
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tags: string[];
    subtasks: any[];
    dueDate?: string;
    coverImage?: string;
    attachmentCount?: number;
  }) => {
    addTask({
      title: taskData.title,
      description: taskData.description,
      columnId: 'todo', // defaults to To Do column
      priority: taskData.priority,
      tags: taskData.tags,
      subtasks: taskData.subtasks,
      dueDate: taskData.dueDate,
      coverImage: taskData.coverImage,
      attachmentCount: taskData.attachmentCount
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
 case 'whiteboard':
 return <WhiteboardCanvas />;
 default:
 return <DashboardHome onNavigate={(tab) => useStore.getState().setActiveTab(tab)} />;
 }
 };

  if (isAuthLoading || (currentUser && isHydratingFromCloud)) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col items-center justify-center p-6 text-neutral-800 dark:text-neutral-200">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          {cloudSyncStatus === 'error' ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-neutral-200">Database Sync Failed</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                {cloudSyncError || 'Failed to connect to Firebase Firestore. Please check your internet connection.'}
              </p>
              <button 
                onClick={() => window.location.reload()}
                type="button"
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-700 rounded-xl cursor-pointer transition-colors"
              >
                Retry Connection
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 border-4 border-neutral-300 border-t-transparent dark:border-neutral-850 dark:border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light tracking-wide animate-pulse">Syncing workspace...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

 return (
    <div className={`min-h-screen ${settings.themeMode === 'glass' ? 'bg-white dark:bg-neutral-900' : 'bg-white dark:bg-neutral-900'} text-black dark:text-neutral-100 flex relative overflow-hidden `}>

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
 <main className={`flex-1 relative ${activeTab === 'whiteboard' ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-8'}`}>
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
