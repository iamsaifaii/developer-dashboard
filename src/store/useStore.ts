import { create } from 'zustand';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { 
  Task, Column, Note, CalendarEvent, PomodoroSession, TimerMode, DeveloperSettings,
  GithubRepo, GithubIssue, GithubPR, GithubCommit, GithubAnalytics, GithubWeeklyActivity,
  AppNotification
} from '../types';

interface State {
  // Auth
  currentUser: { uid: string; displayName: string | null; email: string | null; photoURL: string | null } | null;
  isHydratingFromCloud: boolean;
  isReceivingSnapshot: boolean;
  authError: string | null;
  linkedProviders: string[];
  setCurrentUser: (user: any) => void;
  setAuthError: (error: string | null) => void;
  setLinkedProviders: (providers: string[]) => void;
  signOut: () => Promise<void>;

 // Notifications
 notifications: AppNotification[];
 addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
 markNotificationRead: (id: string) => void;
 markAllNotificationsRead: () => void;
 clearNotification: (id: string) => void;

 // Navigation
 activeTab: string;
 setActiveTab: (tab: string) => void;

 // Board
 columns: Column[];
 tasks: Task[];
 addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
 updateTask: (taskId: string, updates: Partial<Task>) => void;
 deleteTask: (taskId: string) => void;
 moveTask: (taskId: string, targetColumnId: string) => void;
 checkOverdueTasks: () => void;

 // Notes
 notes: Note[];
 folders: string[];
 addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
 updateNote: (noteId: string, updates: Partial<Note>) => void;
 deleteNote: (noteId: string) => void;
 addFolder: (folderName: string) => void;

 // Calendar
 events: CalendarEvent[];
 addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
 updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
 deleteEvent: (eventId: string) => void;

 // Pomodoro
 timerMode: TimerMode;
 timerStatus: 'idle' | 'running' | 'paused';
 secondsLeft: number;
 totalSessionsCompleted: number;
 pomodoroHistory: PomodoroSession[];
 setTimerMode: (mode: TimerMode) => void;
 setTimerStatus: (status: 'idle' | 'running' | 'paused') => void;
 tick: () => void;
 resetTimer: () => void;
 addPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'timestamp'>) => void;

 // Github Mock
 githubConnected: boolean;
 githubUsername: string;
 githubRepos: GithubRepo[];
 githubIssues: GithubIssue[];
 githubPRs: GithubPR[];
 githubCommits: GithubCommit[];
 connectGithub: (username: string) => void;
 disconnectGithub: () => void;
 addMockCommit: (message: string, repoName: string) => void;
 importGithubIssue: (issueId: string, targetColumnId: string) => void;

 // Settings
 settings: DeveloperSettings;
 updateSettings: (updates: Partial<DeveloperSettings>) => void;

 // Cloud sync status
 cloudSyncStatus: 'synced' | 'syncing' | 'error' | null;
 cloudSyncError: string | null;

 // Real GitHub API
 githubToken: string | null;
 githubIsLoading: boolean;
 githubAnalytics: GithubAnalytics | null;
 setGithubToken: (token: string | null) => void;
 setGithubAnalytics: (analytics: GithubAnalytics | null) => void;
 fetchRealGithubData: () => Promise<void>;
}

export const useStore = create<State>()((set, get) => {
  const defaultSettings: DeveloperSettings = {
    userName: 'Alex Developer',
    githubUsername: 'alexdev-codes',
    pomodoroWorkTime: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    themeMode: 'glass',
    colorScheme: 'system',
    avatarUrl: '',
    bio: '',
    notificationPreferences: {
      taskDue: true,
      taskOverdue: true,
      pomodoroComplete: true,
      focusReminder: true,
      githubCommits: true,
      githubPRs: true,
      systemUpdates: true
    }
  };

  return {
   // Auth state
   currentUser: null,
   isHydratingFromCloud: false,
   isReceivingSnapshot: false,
   authError: null,
   linkedProviders: [],
   cloudSyncStatus: null,
   cloudSyncError: null,
   notifications: [],
   addNotification: (notif) => set((state) => {
     const newNotif: AppNotification = {
       ...notif,
       id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
       isRead: false,
       createdAt: new Date().toISOString()
     };
     return { notifications: [newNotif, ...(state.notifications || [])] };
   }),
   markNotificationRead: (id) => set((state) => ({
     notifications: (state.notifications || []).map(n => n.id === id ? { ...n, isRead: true } : n)
   })),
   markAllNotificationsRead: () => set((state) => ({
     notifications: (state.notifications || []).map(n => ({ ...n, isRead: true }))
   })),
   clearNotification: (id) => set((state) => ({
     notifications: (state.notifications || []).filter(n => n.id !== id)
   })),
   setAuthError: (error) => set({ authError: error }),
   setLinkedProviders: (providers) => set({ linkedProviders: providers }),
   signOut: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
    if ((window as any)._unsubscribeSnapshot) {
      (window as any)._unsubscribeSnapshot();
      (window as any)._unsubscribeSnapshot = null;
    }
    set({
      currentUser: null,
      tasks: [],
      notes: [],
      events: [],
      pomodoroHistory: [],
      githubRepos: [],
      githubIssues: [],
      githubPRs: [],
      githubCommits: [],
      githubConnected: false,
      githubUsername: '',
      githubToken: null,
      githubAnalytics: null,
      linkedProviders: [],
      authError: null,
      cloudSyncStatus: null,
      cloudSyncError: null,
    });
  },
  setCurrentUser: (user) => {
    if (user) {
      set({ currentUser: user, isHydratingFromCloud: true, cloudSyncStatus: 'syncing', cloudSyncError: null });
      const docRef = doc(db, 'users', user.uid);
      
      // Cleanup previous listener if any
      if ((window as any)._unsubscribeSnapshot) {
        (window as any)._unsubscribeSnapshot();
      }

      (window as any)._unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudState = docSnap.data().state;
          if (cloudState) {
            const currentToken = get().githubToken;
            const resolvedToken = currentToken || cloudState.githubToken || null;
            set({ 
              ...cloudState, 
              tasks: cloudState.tasks || [],
              notes: cloudState.notes || [],
              events: cloudState.events || [],
              pomodoroHistory: cloudState.pomodoroHistory || [],
              githubRepos: cloudState.githubRepos || [],
              githubIssues: cloudState.githubIssues || [],
              githubPRs: cloudState.githubPRs || [],
              githubCommits: cloudState.githubCommits || [],
              currentUser: user,
              githubToken: resolvedToken,
              // Reset githubConnected so App.tsx re-fetches fresh GitHub data
              // This is critical for cross-device sync — without this, the
              // auto-fetch effect is blocked by !githubConnected being false
              githubConnected: false,
              isHydratingFromCloud: false,
              isReceivingSnapshot: true,
              cloudSyncStatus: 'synced',
              cloudSyncError: null
            });
            // Allow subscribe to trigger normally after this tick
            setTimeout(() => set({ isReceivingSnapshot: false }), 0);
            return;
          }
        }
        set({ isHydratingFromCloud: false, cloudSyncStatus: 'synced', cloudSyncError: null });
      }, (err) => {
        console.error("Failed to sync from cloud", err);
        set({ cloudSyncStatus: 'error', cloudSyncError: err.message });
      });

    } else {
      if ((window as any)._unsubscribeSnapshot) {
        (window as any)._unsubscribeSnapshot();
        (window as any)._unsubscribeSnapshot = null;
      }
      // Reset on logout
      set({
       currentUser: null,
       tasks: [],
       notes: [],
       events: [],
       pomodoroHistory: [],
       githubRepos: [],
       githubIssues: [],
       githubPRs: [],
       githubCommits: [],
       githubConnected: false,
       githubUsername: '',
       githubToken: null,
       cloudSyncStatus: null,
       cloudSyncError: null
     });
   }
 },

 // Navigation state
 activeTab: 'dashboard',
 setActiveTab: (tab) => set({ activeTab: tab }),

 // Board state
 columns: [
 { id: 'backlog', title: 'Backlog' },
 { id: 'todo', title: 'To Do' },
 { id: 'in-progress', title: 'In Progress' },
 { id: 'review', title: 'Review' },
 { id: 'done', title: 'Done' }
 ],
 tasks: [],
 addTask: (task) => set((state) => {
 // Auto-set dueDate to tomorrow if not specified
 let dueDate = task.dueDate;
 if (!dueDate) {
   const tomorrow = new Date();
   tomorrow.setDate(tomorrow.getDate() + 1);
   dueDate = tomorrow.toISOString().split('T')[0];
 }
 const newTask: Task = {
   ...task,
   dueDate,
   id: `task-${Date.now()}`,
   createdAt: new Date().toISOString()
 };
 return { tasks: [...(state.tasks || []), newTask] };
 }),
 updateTask: (taskId, updates) => set((state) => ({
 tasks: (state.tasks || []).map((task) => task.id === taskId ? { ...task, ...updates } : task)
 })),
 deleteTask: (taskId) => set((state) => ({
 tasks: (state.tasks || []).filter((task) => task.id !== taskId)
 })),
 moveTask: (taskId, targetColumnId) => set((state) => ({
 tasks: (state.tasks || []).map((task) => 
   task.id === taskId ? { ...task, columnId: targetColumnId } : task
 )
 })),

 checkOverdueTasks: () => {
   const state = get();
   const today = new Date();
   // Normalize today to midnight so overdue triggers at start of the day AFTER due date
   today.setHours(0, 0, 0, 0);

   // Load already-notified set from sessionStorage so we don't re-notify in same session
   let notifiedIds: Set<string>;
   try {
     const stored = sessionStorage.getItem('overdueNotifiedIds');
     notifiedIds = new Set(stored ? JSON.parse(stored) : []);
   } catch {
     notifiedIds = new Set();
   }

   const overdueTasks = (state.tasks || []).filter(task => {
     if (!task.dueDate) return false;
     if (task.columnId === 'done') return false;
     const due = new Date(task.dueDate);
     due.setHours(0, 0, 0, 0);
     // Overdue = due date is strictly before today
     return due < today;
   });

   const newOverdueTasks = overdueTasks.filter(t => !notifiedIds.has(t.id));

   if (newOverdueTasks.length === 0) return;

   const prefs = state.settings.notificationPreferences;

   newOverdueTasks.forEach(task => {
     notifiedIds.add(task.id);

     // 1. In-app notification
     if (prefs.taskOverdue) {
       const message = `"${task.title}" was due on ${new Date(task.dueDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} and is now overdue.`;
       const newNotif: import('../types').AppNotification = {
         id: `notif-overdue-${task.id}-${Date.now()}`,
         title: '⚠️ Task Overdue',
         message,
         category: 'task',
         isRead: false,
         createdAt: new Date().toISOString()
       };
       set(s => ({ notifications: [newNotif, ...(s.notifications || [])] }));
     }

     // 2. Browser Push notification (desktop + mobile)
     if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
       try {
         const n = new Notification('⚠️ Task Overdue — Developer Dashboard', {
           body: `"${task.title}" was due on ${new Date(task.dueDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} and is now overdue.`,
           icon: '/favicon.svg',
           tag: `overdue-${task.id}`,
           requireInteraction: true
         });
         n.onclick = () => {
           window.focus();
           n.close();
         };
       } catch (e) {
         console.warn('Push notification failed:', e);
       }
     }
   });

   // Persist updated notified IDs to sessionStorage
   try {
     sessionStorage.setItem('overdueNotifiedIds', JSON.stringify([...notifiedIds]));
   } catch {}
 },

 // Notes state
 notes: [],
 folders: ['Work', 'Ideas', 'Snippets'],
 addNote: (note) => set((state) => {
 const newNote: Note = {
 ...note,
 id: `note-${Date.now()}`,
 updatedAt: new Date().toISOString()
 };
 return { notes: [...(state.notes || []), newNote] };
 }),
 updateNote: (noteId, updates) => set((state) => ({
 notes: (state.notes || []).map((note) => 
 note.id === noteId 
 ? { ...note, ...updates, updatedAt: new Date().toISOString() } 
 : note
 )
 })),
 deleteNote: (noteId) => set((state) => ({
 notes: (state.notes || []).filter((note) => note.id !== noteId)
 })),
 addFolder: (folderName) => set((state) => {
 if (state.folders.includes(folderName)) return {};
 return { folders: [...state.folders, folderName] };
 }),

 // Calendar state
 events: [],
 addEvent: (event) => set((state) => {
 const newEvent: CalendarEvent = {
 ...event,
 id: `event-${Date.now()}`
 };
 return { events: [...(state.events || []), newEvent] };
 }),
 updateEvent: (eventId, updates) => set((state) => ({
 events: (state.events || []).map((evt) => evt.id === eventId ? { ...evt, ...updates } : evt)
 })),
 deleteEvent: (eventId) => set((state) => ({
 events: (state.events || []).filter((evt) => evt.id !== eventId)
 })),

 // Pomodoro state
 timerMode: 'work',
 timerStatus: 'idle',
 secondsLeft: defaultSettings.pomodoroWorkTime * 60,
 totalSessionsCompleted: 0, // completed sessions
 pomodoroHistory: [],
 setTimerMode: (mode) => set((state) => {
 let mins = state.settings.pomodoroWorkTime;
 if (mode === 'shortBreak') mins = state.settings.pomodoroShortBreak;
 if (mode === 'longBreak') mins = state.settings.pomodoroLongBreak;
 return {
 timerMode: mode,
 secondsLeft: mins * 60,
 timerStatus: 'idle'
 };
 }),
 setTimerStatus: (status) => set({ timerStatus: status }),
 tick: () => set((state) => {
 if (state.secondsLeft <= 1) {
 // Timer expired!
 const nextStatus = 'idle';
 const mode = state.timerMode;
 let totalSess = state.totalSessionsCompleted;
 let nextMode: TimerMode = 'work';

 if (mode === 'work') {
 totalSess += 1;
 // Cycle: 4th work session -> long break, otherwise short break
 nextMode = totalSess % 4 === 0 ? 'longBreak' : 'shortBreak';
 } else {
 nextMode = 'work';
 }

 // Save to history
 const mins = mode === 'work' ? state.settings.pomodoroWorkTime
 : mode === 'shortBreak' ? state.settings.pomodoroShortBreak
 : state.settings.pomodoroLongBreak;

 const newSession: PomodoroSession = {
 id: `pom-${Date.now()}`,
 mode,
 duration: mins,
 timestamp: new Date().toISOString()
 };

 // Play Chime (we'll play it via a sound player component)
 // Trigger auto-commit mockup for productivity if mode was work
 let newCommits = state.githubCommits;
 if (mode === 'work' && state.githubConnected) {
 const mockCommitMsg = `docs: documented work from completed Pomodoro session #${totalSess}`;
 const activeRepo = state.githubRepos[0]?.name || 'dev-productivity-hub';
 const newCommit: GithubCommit = {
 id: `commit-${Date.now()}`,
 message: mockCommitMsg,
 date: new Date().toISOString().split('T')[0],
 repoName: activeRepo,
 author: state.githubUsername
 };
 newCommits = [newCommit, ...state.githubCommits];
 }

 let nextMins = state.settings.pomodoroWorkTime;
 if (nextMode === 'shortBreak') nextMins = state.settings.pomodoroShortBreak;
 if (nextMode === 'longBreak') nextMins = state.settings.pomodoroLongBreak;

 let newNotifications = state.notifications || [];
 if (state.settings.notificationPreferences.pomodoroComplete) {
   newNotifications = [{
     id: `notif-${Date.now()}`,
     title: mode === 'work' ? 'Focus Session Completed' : 'Break Completed',
     message: mode === 'work' ? 'Great job! Time for a break.' : 'Ready to get back to work?',
     category: 'productivity',
     isRead: false,
     createdAt: new Date().toISOString()
   }, ...newNotifications];
 }

 return {
 timerStatus: nextStatus,
 timerMode: nextMode,
 secondsLeft: nextMins * 60,
 totalSessionsCompleted: totalSess,
 pomodoroHistory: [...state.pomodoroHistory, newSession],
 githubCommits: newCommits,
 notifications: newNotifications
 };
 }
 return { secondsLeft: state.secondsLeft - 1 };
 }),
 resetTimer: () => set((state) => {
 let mins = state.settings.pomodoroWorkTime;
 if (state.timerMode === 'shortBreak') mins = state.settings.pomodoroShortBreak;
 if (state.timerMode === 'longBreak') mins = state.settings.pomodoroLongBreak;
 return {
 secondsLeft: mins * 60,
 timerStatus: 'idle'
 };
 }),
 addPomodoroSession: (session) => set((state) => ({
 pomodoroHistory: [...state.pomodoroHistory, {
 ...session,
 id: `pom-${Date.now()}`,
 timestamp: new Date().toISOString()
 }]
 })),

 // GitHub mock state
 githubConnected: false,
 githubUsername: '',
 githubRepos: [],
 githubIssues: [],
 githubPRs: [],
 githubCommits: [],
 connectGithub: (username) => set(() => ({ githubConnected: true, githubUsername: username })),
 disconnectGithub: () => set({
 githubConnected: false,
 githubUsername: '',
 githubRepos: [],
 githubIssues: [],
 githubPRs: [],
 githubCommits: [],
 githubToken: null
 }),
 addMockCommit: (message, repoName) => set((state) => {
 if (!state.githubConnected) return {};
 const newCommit: GithubCommit = {
 id: `commit-${Date.now()}`,
 message,
 date: new Date().toISOString().split('T')[0],
 repoName,
 author: state.githubUsername
 };
 
 let newNotifications = state.notifications || [];
 if (state.settings.notificationPreferences.githubCommits) {
   newNotifications = [{
     id: `notif-${Date.now()}`,
     title: 'New Mock Commit',
     message: `Commit to ${repoName}: ${message}`,
     category: 'github',
     isRead: false,
     createdAt: new Date().toISOString()
   }, ...newNotifications];
 }

 return { githubCommits: [newCommit, ...state.githubCommits], notifications: newNotifications };
 }),
 importGithubIssue: (issueId, targetColumnId) => set((state) => {
 const issue = state.githubIssues.find((i) => i.id === issueId);
 if (!issue) return {};

 const newTask: Task = {
 id: `task-${Date.now()}`,
 title: `GitHub Issue #${issue.number}: ${issue.title}`,
 description: `Imported from GitHub repository **${issue.repoName}**.\nOriginal Issue: ${issue.url}`,
 columnId: targetColumnId,
 priority: 'medium',
 tags: ['GitHub', issue.repoName],
 subtasks: [],
 githubIssueId: issue.id,
 githubIssueNumber: issue.number,
 githubIssueUrl: issue.url,
 createdAt: new Date().toISOString()
 };

 // Remove issue from the open issues list to simulate ingestion
 return {
 tasks: [...state.tasks, newTask],
 githubIssues: state.githubIssues.filter((i) => i.id !== issueId)
 };
 }),

 // Settings state
 settings: defaultSettings,
 updateSettings: (updates) => set((state) => {
 // Adjust timer if settings changed and clock is currently idle
 const timerTimeChanged = 
 updates.pomodoroWorkTime !== undefined || 
 updates.pomodoroShortBreak !== undefined || 
 updates.pomodoroLongBreak !== undefined;

 const mergedSettings = { ...state.settings, ...updates };
 let nextSeconds = state.secondsLeft;

 if (timerTimeChanged && state.timerStatus === 'idle') {
 let mins = mergedSettings.pomodoroWorkTime;
 if (state.timerMode === 'shortBreak') mins = mergedSettings.pomodoroShortBreak;
 if (state.timerMode === 'longBreak') mins = mergedSettings.pomodoroLongBreak;
 nextSeconds = mins * 60;
 }

 return {
 settings: mergedSettings,
 secondsLeft: nextSeconds,
 githubUsername: updates.githubUsername !== undefined ? updates.githubUsername : state.githubUsername
 };
 }),

 // Real Github API functions
 githubToken: null,
 githubIsLoading: false,
 githubAnalytics: null,
 setGithubToken: (token) => set({ githubToken: token }),
 setGithubAnalytics: (analytics) => set({ githubAnalytics: analytics }),
 fetchRealGithubData: async () => {
    const { githubToken } = get();
    if (!githubToken) return;
    set({ githubIsLoading: true });
    try {
      // 1. Get real GitHub user info
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${githubToken}` }
      });
      if (userRes.status === 401 || userRes.status === 403) {
        set({ githubToken: null, githubConnected: false });
        throw new Error("Invalid or expired GitHub token");
      }
      if (!userRes.ok) throw new Error("Failed to fetch user");
      const userData = await userRes.json();
      const realUsername = userData.login;
      get().updateSettings({ githubUsername: realUsername });

      // 2. Parallel fetch: repos, open PRs, closed PRs, open issues, closed issues, events
      const headers = { Authorization: `Bearer ${githubToken}` };

      const [reposResult, openPRsResult, closedPRsResult, openIssuesResult, closedIssuesResult, eventsResult] =
        await Promise.allSettled([
          fetch(`https://api.github.com/user/repos?sort=updated&per_page=30&type=all`, { headers }).then(r => r.json()),
          fetch(`https://api.github.com/search/issues?q=author:${realUsername}+type:pr+state:open&per_page=20`, { headers }).then(r => r.json()),
          fetch(`https://api.github.com/search/issues?q=author:${realUsername}+type:pr+state:closed&per_page=20`, { headers }).then(r => r.json()),
          fetch(`https://api.github.com/search/issues?q=assignee:${realUsername}+type:issue+state:open&per_page=20`, { headers }).then(r => r.json()),
          fetch(`https://api.github.com/search/issues?q=assignee:${realUsername}+type:issue+state:closed&per_page=20`, { headers }).then(r => r.json()),
          fetch(`https://api.github.com/users/${realUsername}/events/public?per_page=100`, { headers }).then(r => r.json()),
        ]);

      // 3. Process repos
      const repos: GithubRepo[] = reposResult.status === 'fulfilled' && Array.isArray(reposResult.value)
        ? reposResult.value.map((r: any) => ({
            name: r.name,
            description: r.description || '',
            stars: r.stargazers_count,
            forks: r.forks_count,
            openIssues: r.open_issues_count,
            language: r.language || null,
            updatedAt: r.updated_at,
            isPrivate: r.private,
            url: r.html_url
          }))
        : [];

      // 4. Process PRs (open)
      const mapPR = (p: any, merged = false): GithubPR => {
        const repoUrlParts = p.repository_url.split('/');
        const isMerged = merged || !!p.pull_request?.merged_at;
        return {
          id: `pr-${p.id}`,
          number: p.number,
          title: p.title,
          state: p.state,
          url: p.html_url,
          repoName: repoUrlParts[repoUrlParts.length - 1],
          merged: isMerged,
          createdAt: p.created_at,
          closedAt: p.closed_at || null,
          mergedAt: p.pull_request?.merged_at || null
        };
      };

      const openPRItems = openPRsResult.status === 'fulfilled' ? (openPRsResult.value.items || []) : [];
      const closedPRItems = closedPRsResult.status === 'fulfilled' ? (closedPRsResult.value.items || []) : [];
      const allPRs: GithubPR[] = [
        ...openPRItems.slice(0, 15).map((p: any) => mapPR(p, false)),
        ...closedPRItems.slice(0, 15).map((p: any) => mapPR(p, false))
      ];

      // 5. Process Issues
      const mapIssue = (i: any): GithubIssue => {
        const repoUrlParts = i.repository_url.split('/');
        return {
          id: `issue-${i.id}`,
          number: i.number,
          title: i.title,
          state: i.state,
          url: i.html_url,
          repoName: repoUrlParts[repoUrlParts.length - 1],
          labels: (i.labels || []).map((l: any) => l.name),
          createdAt: i.created_at,
          closedAt: i.closed_at || null,
          assignee: i.assignee?.login || null
        };
      };

      const openIssueItems = openIssuesResult.status === 'fulfilled' ? (openIssuesResult.value.items || []) : [];
      const closedIssueItems = closedIssuesResult.status === 'fulfilled' ? (closedIssuesResult.value.items || []) : [];
      const allIssues: GithubIssue[] = [
        ...openIssueItems.slice(0, 15).map(mapIssue),
        ...closedIssueItems.slice(0, 10).map(mapIssue)
      ];

      // 6. Process commits from events
      const commits: GithubCommit[] = [];
      if (eventsResult.status === 'fulfilled' && Array.isArray(eventsResult.value)) {
        eventsResult.value
          .filter((e: any) => e.type === 'PushEvent')
          .forEach((e: any) => {
            (e.payload.commits || []).forEach((c: any) => {
              commits.push({
                id: c.sha,
                sha: c.sha,
                message: c.message.split('\n')[0],
                date: e.created_at.split('T')[0],
                repoName: e.repo.name.split('/')[1] || e.repo.name,
                author: realUsername
              });
            });
          });
      }

      // 7. Build analytics aggregate
      const commitCounts: Record<string, number> = {};
      commits.forEach(c => { commitCounts[c.date] = (commitCounts[c.date] || 0) + 1; });

      // Language breakdown from repos
      const languageBreakdown: Record<string, number> = {};
      repos.forEach(r => {
        if (r.language) {
          languageBreakdown[r.language] = (languageBreakdown[r.language] || 0) + 1;
        }
      });

      // Weekly activity (last 12 weeks from events data)
      const weeklyActivity: GithubWeeklyActivity[] = [];
      const now = new Date();
      for (let w = 11; w >= 0; w--) {
        const weekSunday = new Date(now);
        weekSunday.setDate(now.getDate() - now.getDay() - w * 7);
        const weekStart = weekSunday.toISOString().split('T')[0];
        let total = 0;
        for (let d = 0; d < 7; d++) {
          const day = new Date(weekSunday);
          day.setDate(weekSunday.getDate() + d);
          const dayStr = day.toISOString().split('T')[0];
          total += commitCounts[dayStr] || 0;
        }
        weeklyActivity.push({ weekStart, total });
      }

      // Streak calculation
      let currentStreak = 0;
      let longestStreak = 0;
      let streak = 0;
      const checkDate = new Date();
      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (commitCounts[dateStr] && commitCounts[dateStr] > 0) {
          streak++;
          if (i === 0) currentStreak = streak;
          longestStreak = Math.max(longestStreak, streak);
        } else {
          if (i === 0) currentStreak = 0;
          streak = 0;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      }

      const totalOpenPRs = openPRItems.length;
      const mergedPRs = closedPRItems.filter((p: any) => p.pull_request?.merged_at);
      const totalMergedPRs = mergedPRs.length;
      const totalClosedPRs = closedPRItems.length - totalMergedPRs;

      const analytics: GithubAnalytics = {
        totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
        totalForks: repos.reduce((sum, r) => sum + r.forks, 0),
        totalCommits: commits.length,
        totalOpenPRs,
        totalClosedPRs,
        totalMergedPRs,
        totalOpenIssues: openIssueItems.length,
        totalClosedIssues: closedIssueItems.length,
        weeklyActivity,
        languageBreakdown,
        currentStreak,
        longestStreak
      };

      set({
        githubUsername: realUsername,
        githubRepos: repos,
        githubIssues: allIssues,
        githubPRs: allPRs,
        githubCommits: commits,
        githubAnalytics: analytics,
        githubConnected: true
      });
    } catch (e) {
      console.error("Failed to fetch GitHub data:", e);
    } finally {
      set({ githubIsLoading: false });
    }
    }
  };
});

// Helper to recursively strip undefined properties before saving to Firestore
function serializeForFirestore(val: any): any {
  if (val === undefined) {
    return null;
  }
  if (Array.isArray(val)) {
    return val.map(serializeForFirestore);
  }
  if (val !== null && typeof val === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(val)) {
      const value = val[key];
      if (value !== undefined) {
        cleaned[key] = serializeForFirestore(value);
      }
    }
    return cleaned;
  }
  return val;
}

// Cloud Sync Listener
useStore.subscribe((state, prevState) => {
  if (state.currentUser && !state.isHydratingFromCloud && !state.isReceivingSnapshot) {
    const stateToSave = {
      activeTab: state.activeTab,
      tasks: state.tasks,
      notes: state.notes,
      folders: state.folders,
      events: state.events,
      totalSessionsCompleted: state.totalSessionsCompleted,
      pomodoroHistory: state.pomodoroHistory,
      settings: state.settings,
      githubConnected: state.githubConnected,
      githubUsername: state.githubUsername,
      githubRepos: state.githubRepos,
      githubIssues: state.githubIssues,
      githubPRs: state.githubPRs,
      githubCommits: state.githubCommits,
      githubToken: state.githubToken,
      notifications: state.notifications
    };
    
    const prevStateToSave = {
      activeTab: prevState.activeTab,
      tasks: prevState.tasks,
      notes: prevState.notes,
      folders: prevState.folders,
      events: prevState.events,
      totalSessionsCompleted: prevState.totalSessionsCompleted,
      pomodoroHistory: prevState.pomodoroHistory,
      settings: prevState.settings,
      githubConnected: prevState.githubConnected,
      githubUsername: prevState.githubUsername,
      githubRepos: prevState.githubRepos,
      githubIssues: prevState.githubIssues,
      githubPRs: prevState.githubPRs,
      githubCommits: prevState.githubCommits,
      githubToken: prevState.githubToken,
      notifications: prevState.notifications
    };

    // Only sync if the actual persistent data changed
    // This prevents the pomodoro timer (which updates secondsLeft every 1s) from triggering a Firebase write every second
    if (JSON.stringify(stateToSave) !== JSON.stringify(prevStateToSave)) {
      setDoc(doc(db, 'users', state.currentUser.uid), { state: serializeForFirestore(stateToSave) }, { merge: true })
        .catch(err => console.error('Cloud sync failed:', err));
    }
  }
});
