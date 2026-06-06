import { create } from 'zustand';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { 
  Task, Column, Note, CalendarEvent, PomodoroSession, TimerMode, DeveloperSettings,
  GithubRepo, GithubIssue, GithubPR, GithubCommit, GithubAnalytics,
  AppNotification, AIMessage
} from '../types';
import { fetchGithubData } from '../services/githubService';
import { productivityService } from '../services/productivityService';


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

  // AI assistant messages
  aiMessages: AIMessage[];
  addAIMessage: (msg: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  clearAIMessages: () => void;

  // Workspaces
  workspaces: import('../types').Workspace[];
  activeWorkspaceId: string;
  currentRole: import('../types').WorkspaceRole;
  createWorkspace: (name: string) => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  inviteMember: (email: string, role: import('../types').WorkspaceRole) => Promise<void>;
  acceptInvite: (token: string) => Promise<void>;
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

    // Workspaces
    workspaces: [],
    activeWorkspaceId: 'personal',
    currentRole: 'admin',

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
     set({ currentUser: user });
     if (user) {
       if ((window as any)._unsubscribeSnapshot) {
         (window as any)._unsubscribeSnapshot();
       }
       set({ isHydratingFromCloud: true, cloudSyncStatus: 'syncing', cloudSyncError: null });
       
       const docRef = doc(db, 'users', user.uid);
       
       // Async fetch of workspaces
       import('../services/workspaceService').then(({ workspaceService }) => {
         workspaceService.getUserWorkspaces(user.uid).then(workspaces => {
           set({ workspaces });
         }).catch(console.error);
       });

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
               aiMessages: cloudState.aiMessages || [],
               githubToken: resolvedToken,
               githubConnected: false,
               isHydratingFromCloud: false,
               isReceivingSnapshot: true,
               cloudSyncStatus: 'synced',
               cloudSyncError: null
             });
             setTimeout(() => set({ isReceivingSnapshot: false }), 0);
             return;
           }
         }
         // If no state exists yet
         set({
           tasks: [],
           notes: [],
           events: [],
           isHydratingFromCloud: false,
           isReceivingSnapshot: true,
           cloudSyncStatus: 'synced',
           cloudSyncError: null
         });
         setTimeout(() => set({ isReceivingSnapshot: false }), 0);
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

  createWorkspace: async (name) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const { workspaceService } = await import('../services/workspaceService');
    const newWs = await workspaceService.createWorkspace(currentUser.uid, currentUser.email || '', name);
    set(state => ({
      workspaces: [...state.workspaces, newWs]
    }));
    get().switchWorkspace(newWs.id);
  },

  switchWorkspace: (workspaceId) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    // Clear snapshot listener
    if ((window as any)._unsubscribeSnapshot) {
      (window as any)._unsubscribeSnapshot();
      (window as any)._unsubscribeSnapshot = null;
    }

    set({ isHydratingFromCloud: true, cloudSyncStatus: 'syncing', activeWorkspaceId: workspaceId });

    // Determine target doc
    const docRef = workspaceId === 'personal' 
      ? doc(db, 'users', currentUser.uid)
      : doc(db, 'workspaces', workspaceId);

    // Fetch workspace metadata to determine role if it's a team workspace
    if (workspaceId !== 'personal') {
      const ws = get().workspaces.find(w => w.id === workspaceId);
      if (ws) {
        const member = ws.members.find(m => m.uid === currentUser.uid);
        if (member) {
          set({ currentRole: member.role });
        }
      }
    } else {
      set({ currentRole: 'admin' });
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
            aiMessages: cloudState.aiMessages || [],
            githubToken: resolvedToken,
            githubConnected: false,
            isHydratingFromCloud: false,
            isReceivingSnapshot: true,
            cloudSyncStatus: 'synced',
            cloudSyncError: null
          });
          setTimeout(() => set({ isReceivingSnapshot: false }), 0);
          return;
        }
      }
      
      // If no state exists yet
      set({
        tasks: [],
        notes: [],
        events: [],
        isHydratingFromCloud: false,
        isReceivingSnapshot: true,
        cloudSyncStatus: 'synced',
        cloudSyncError: null
      });
      setTimeout(() => set({ isReceivingSnapshot: false }), 0);
    }, (err) => {
      console.error("Failed to sync from cloud", err);
      set({ cloudSyncStatus: 'error', cloudSyncError: err.message });
    });
  },

  inviteMember: async (email, role) => {
    const { activeWorkspaceId } = get();
    if (activeWorkspaceId === 'personal') return;
    const { workspaceService } = await import('../services/workspaceService');
    await workspaceService.generateInviteToken(activeWorkspaceId, email, role);
    // You could theoretically trigger the Firebase Function from frontend explicitly,
    // but the best way is to let the Firestore trigger catch the new doc in 'invites'
    // collection and send the email.
  },

  acceptInvite: async (token) => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.email) return;
    const { workspaceService } = await import('../services/workspaceService');
    const workspaceId = await workspaceService.validateAndAcceptInvite(token, currentUser.uid, currentUser.email);
    // Reload user workspaces
    const workspaces = await workspaceService.getUserWorkspaces(currentUser.uid);
    set({ workspaces });
    if (workspaceId) {
      get().switchWorkspace(workspaceId);
    }
  },

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
 updateTask: (taskId, updates) => set((state) => {
   return { tasks: (state.tasks || []).map((task) => task.id === taskId ? { ...task, ...updates } : task) };
 }),
 deleteTask: (taskId) => set((state) => {
   return { tasks: (state.tasks || []).filter((task) => task.id !== taskId) };
 }),
 moveTask: (taskId, targetColumnId) => set((state) => {
   return { tasks: (state.tasks || []).map((task) => task.id === taskId ? { ...task, columnId: targetColumnId } : task) };
 }),

  checkOverdueTasks: () => {
    const state = get();
    const tasks = state.tasks || [];
    if (tasks.length === 0) return;

    // Load already-notified set from sessionStorage
    let notifiedTags: Set<string>;
    try {
      const stored = sessionStorage.getItem('overdueNotifiedTags');
      notifiedTags = new Set(stored ? JSON.parse(stored) : []);
    } catch {
      notifiedTags = new Set();
    }

    productivityService.checkDeadlines(tasks)
      .then(data => {
        if (!data || !data.notificationsToTrigger) return;

        const prefs = state.settings.notificationPreferences;
        const newNotifications: import('../types').AppNotification[] = [];

        data.notificationsToTrigger.forEach((notif: any) => {
          const uniqueTag = `${notif.title}-${notif.message}`;
          if (notifiedTags.has(uniqueTag)) return;

          notifiedTags.add(uniqueTag);

          // 1. In-app notification
          if (prefs.taskOverdue) {
            newNotifications.push({
              id: `notif-deadline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: notif.title,
              message: notif.message,
              category: notif.category,
              isRead: false,
              createdAt: new Date().toISOString(),
              link: notif.link
            });
          }

          // 2. Browser Push notification (desktop + mobile)
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              const n = new Notification(`${notif.title} — DevFlow`, {
                body: notif.message,
                icon: '/favicon.svg',
                tag: uniqueTag,
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

        if (newNotifications.length > 0) {
          set(s => ({ notifications: [...newNotifications, ...(s.notifications || [])] }));
        }

        // Persist updated notified tags to sessionStorage
        try {
          sessionStorage.setItem('overdueNotifiedTags', JSON.stringify([...notifiedTags]));
        } catch {}
      })
      .catch(err => console.error('Error checking deadlines on backend:', err));
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
 updateNote: (noteId, updates) => set((state) => {
   return { notes: (state.notes || []).map((note) => note.id === noteId ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note) };
 }),
 deleteNote: (noteId) => set((state) => {
   return { notes: (state.notes || []).filter((note) => note.id !== noteId) };
 }),
 addFolder: (folderName) => set((state) => {
   if (state.folders.includes(folderName)) return {};
 return { folders: [...state.folders, folderName] };
 }),

 // Calendar state
 events: [],
 addEvent: (event) => set((state) => {
   const newEvent: CalendarEvent = { ...event, id: `event-${Date.now()}` };
   return { events: [...(state.events || []), newEvent] };
 }),
 updateEvent: (eventId, updates) => set((state) => {
   return { events: (state.events || []).map((evt) => evt.id === eventId ? { ...evt, ...updates } : evt) };
 }),
 deleteEvent: (eventId) => set((state) => {
   return { events: (state.events || []).filter((evt) => evt.id !== eventId) };
 }),

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

  // AI State
  aiMessages: [],
  addAIMessage: (msg) => set((state) => {
    const newMsg: AIMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    return { aiMessages: [...(state.aiMessages || []), newMsg] };
  }),
  clearAIMessages: () => set({ aiMessages: [] }),

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
      const data = await fetchGithubData(githubToken);

      set({
        githubUsername: data.realUsername,
        githubRepos: data.repos,
        githubIssues: data.issues,
        githubPRs: data.prs,
        githubCommits: data.commits,
        githubAnalytics: data.analytics,
        githubConnected: true
      });
    } catch (error: any) {
      console.error("Error fetching GitHub data:", error);
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
    const personalStateToSave = {
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
      notifications: state.notifications,
      aiMessages: state.aiMessages || []
    };

    const prevPersonalState = {
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
      notifications: prevState.notifications,
      aiMessages: prevState.aiMessages || []
    };

    const collabStateToSave = {
      tasks: state.tasks,
      notes: state.notes,
      folders: state.folders,
      events: state.events
    };

    const prevCollabState = {
      tasks: prevState.tasks,
      notes: prevState.notes,
      folders: prevState.folders,
      events: prevState.events
    };

    const stateToSave = { ...personalStateToSave, ...collabStateToSave };
    const prevStateToSave = { ...prevPersonalState, ...prevCollabState };

    // Only sync if the actual persistent data changed
    if (JSON.stringify(stateToSave) !== JSON.stringify(prevStateToSave)) {
      setDoc(doc(db, 'users', state.currentUser.uid), { state: serializeForFirestore(stateToSave) }, { merge: true })
        .catch(err => console.error('Cloud sync failed:', err));
    }
  }
});
