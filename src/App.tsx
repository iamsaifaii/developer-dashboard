import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getProviderIds, validateGithubToken } from './lib/auth';
import { useStore } from './store/useStore';
import { subscribeToMyTeams, subscribeToPendingInvites } from './services/teamService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskModal } from './components/Kanban/TaskModal';
import { LoginScreen } from './components/Auth/LoginScreen';
import { playChime } from './components/Pomodoro/SoundPlayer';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { GlobalShortcuts } from './components/GlobalShortcuts';

// Lazy loaded components
const DashboardHome = lazy(() => import('./components/DashboardHome').then(m => ({ default: m.DashboardHome })));
const KanbanBoard = lazy(() => import('./components/Kanban/KanbanBoard').then(m => ({ default: m.KanbanBoard })));
const NotesManager = lazy(() => import('./components/Notes/NotesManager').then(m => ({ default: m.NotesManager })));
const ProjectCalendar = lazy(() => import('./components/Calendar/ProjectCalendar').then(m => ({ default: m.ProjectCalendar })));
const PomodoroTimer = lazy(() => import('./components/Pomodoro/PomodoroTimer').then(m => ({ default: m.PomodoroTimer })));
const GithubDashboard = lazy(() => import('./components/Github/GithubDashboard').then(m => ({ default: m.GithubDashboard })));
const SettingsPanel = lazy(() => import('./components/Settings/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
const WhiteboardCanvas = lazy(() => import('./components/Whiteboard/WhiteboardCanvas').then(m => ({ default: m.WhiteboardCanvas })));
const GoalsDashboard = lazy(() => import('./components/Goals/GoalsDashboard').then(m => ({ default: m.GoalsDashboard })));
const TeamsPage = lazy(() => import('./components/Teams/TeamsPage').then(m => ({ default: m.TeamsPage })));
const JoinTeamPage = lazy(() => import('./components/Teams/JoinTeamPage').then(m => ({ default: m.JoinTeamPage })));
const TermsPage = lazy(() => import('./components/Docs/TermsPage').then(m => ({ default: m.TermsPage })));
const UserGuidePage = lazy(() => import('./components/Docs/UserGuidePage').then(m => ({ default: m.UserGuidePage })));

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser,
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
    checkOverdueTasks,
    setTeams,
    setPendingInvites
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

  // Teams real-time subscription
  useEffect(() => {
    if (!currentUser) {
      setTeams([]);
      setPendingInvites([]);
      return;
    }
    const unsubTeams = subscribeToMyTeams(currentUser.uid, (teams) => {
      setTeams(teams);
    });
    const unsubInvites = subscribeToPendingInvites(currentUser.email || '', (invites) => {
      setPendingInvites(invites);
    });
    return () => {
      unsubTeams();
      unsubInvites();
    };
  }, [currentUser, setTeams, setPendingInvites]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // 3. Overdue task checker and 5-hour reminder — runs on mount and every 60 seconds
  useEffect(() => {
    if (!currentUser) return;

    const checkProductivityReminder = () => {
      const lastReminderStr = localStorage.getItem('lastProductivityReminder');
      const now = Date.now();
      // 5 hours in milliseconds: 5 * 60 * 60 * 1000 = 18000000
      const FIVE_HOURS = 18000000;
      
      if (!lastReminderStr || now - parseInt(lastReminderStr, 10) > FIVE_HOURS) {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const title = "Stay Focused!";
          const body = "Let's do some productive work and focus on today's tasks.";
          
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification(title, {
                body,
                icon: '/icon.svg',
                tag: 'productivity-reminder',
                requireInteraction: true
              });
            });
          } else {
            const n = new Notification(title, {
              body,
              icon: '/icon.svg',
              tag: 'productivity-reminder'
            });
            n.onclick = () => window.focus();
          }
          localStorage.setItem('lastProductivityReminder', now.toString());
        }
      }
    };

    // Run immediately after user loads
    checkOverdueTasks();
    checkProductivityReminder();
  }, [currentUser, checkOverdueTasks]);

  // Overdue check interval
  useEffect(() => {
    if (!currentUser) return;
    checkOverdueTasks();
    const interval = setInterval(checkOverdueTasks, 60 * 1000);
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

  // Replaced bidirectional activeTab sync with direct navigate calls below


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
    // Allow the /join page to render even before login — it handles auth internally
    if (location.pathname === '/join') {
      return (
        <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin" /></div>}>
          <JoinTeamPage />
        </Suspense>
      );
    }
    return <LoginScreen />;
  }

 return (
    <div className={`min-h-screen ${settings.themeMode === 'glass' ? 'bg-white dark:bg-neutral-900' : 'bg-white dark:bg-neutral-900'} text-black dark:text-neutral-100 flex relative overflow-hidden `}>

 {/* Primary Sidebar Layout */}
 <Sidebar 
   isOpen={isMobileMenuOpen} 
   onClose={() => setIsMobileMenuOpen(false)} 
   isCollapsed={isSidebarCollapsed}
   onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
 />

 {/* Main Content Area */}
 <div className={`flex-1 pl-0 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-60'} flex flex-col h-screen overflow-hidden w-full transition-all duration-300 ease-in-out`}>
 {/* Workspace Top Header */}
 <Header 
 onQuickTaskClick={() => setIsQuickTaskOpen(true)} 
 onOpenSidebar={() => setIsMobileMenuOpen(true)}
 />

  {/* Workspace Views Wrapper */}
  <main className={`flex-1 relative ${location.pathname === '/whiteboard' ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-8'}`}>
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center w-full h-full min-h-[400px]">
          <div className="w-10 h-10 border-4 border-neutral-300 border-t-transparent dark:border-neutral-700 dark:border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<DashboardHome onNavigate={(tab) => navigate(tab === 'dashboard' ? '/' : `/${tab}`)} />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/notes" element={<NotesManager />} />
          <Route path="/calendar" element={<ProjectCalendar />} />
          <Route path="/pomodoro" element={<PomodoroTimer />} />
          <Route path="/github" element={<GithubDashboard />} />
          <Route path="/goals" element={<GoalsDashboard />} />
          <Route path="/settings" element={<SettingsPanel />} />
          <Route path="/whiteboard" element={<WhiteboardCanvas />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/join" element={<JoinTeamPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/guide" element={<UserGuidePage />} />
          <Route path="*" element={<DashboardHome onNavigate={(tab) => navigate(tab === 'dashboard' ? '/' : `/${tab}`)} />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </main>
 </div>

 {/* Global Quick-Add Task modal */}
 <TaskModal
 isOpen={isQuickTaskOpen}
 onClose={() => setIsQuickTaskOpen(false)}
 onSave={handleQuickTaskSave}
 />

 <GlobalShortcuts onQuickTask={() => setIsQuickTaskOpen(true)} />
 </div>
 );
}

export default App;
