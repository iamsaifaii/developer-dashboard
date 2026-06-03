import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { 
 Task, Column, Note, CalendarEvent, PomodoroSession, TimerMode, DeveloperSettings,
 GithubRepo, GithubIssue, GithubPR, GithubCommit
} from '../types';

interface State {
 // Auth
 currentUser: { uid: string; displayName: string | null; email: string | null; photoURL: string | null } | null;
 setCurrentUser: (user: any) => void;

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

 // Real GitHub API
 githubToken: string | null;
 githubIsLoading: boolean;
 setGithubToken: (token: string | null) => void;
 fetchRealGithubData: () => Promise<void>;
}

export const useStore = create<State>()(
 persist(
 (set, get) => {
 const defaultSettings: DeveloperSettings = {
 userName: 'Alex Developer',
 githubUsername: 'alexdev-codes',
 pomodoroWorkTime: 25,
 pomodoroShortBreak: 5,
 pomodoroLongBreak: 15,
 themeMode: 'glass',
 colorScheme: 'dark'
 };

 return {
 // Auth state
 currentUser: null,
 setCurrentUser: async (user) => {
   set({ currentUser: user });
   if (user) {
     try {
       const docRef = doc(db, 'users', user.uid);
       const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudState = docSnap.data().state;
          if (cloudState) {
            const currentToken = get().githubToken;
            set({ 
              ...cloudState, 
              currentUser: user,
              githubToken: currentToken || cloudState.githubToken 
            });
          }
        }
     } catch (err) {
       console.error("Failed to load workspace from cloud", err);
     }
   } else {
     // Reset on logout
     set({
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
       githubToken: null
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
 const newTask: Task = {
 ...task,
 id: `task-${Date.now()}`,
 createdAt: new Date().toISOString()
 };
 return { tasks: [...state.tasks, newTask] };
 }),
 updateTask: (taskId, updates) => set((state) => ({
 tasks: state.tasks.map((task) => task.id === taskId ? { ...task, ...updates } : task)
 })),
 deleteTask: (taskId) => set((state) => ({
 tasks: state.tasks.filter((task) => task.id !== taskId)
 })),
 moveTask: (taskId, targetColumnId) => set((state) => ({
 tasks: state.tasks.map((task) => 
 task.id === taskId ? { ...task, columnId: targetColumnId } : task
 )
 })),

 // Notes state
 notes: [],
 folders: ['Work', 'Ideas', 'Snippets'],
 addNote: (note) => set((state) => {
 const newNote: Note = {
 ...note,
 id: `note-${Date.now()}`,
 updatedAt: new Date().toISOString()
 };
 return { notes: [...state.notes, newNote] };
 }),
 updateNote: (noteId, updates) => set((state) => ({
 notes: state.notes.map((note) => 
 note.id === noteId 
 ? { ...note, ...updates, updatedAt: new Date().toISOString() } 
 : note
 )
 })),
 deleteNote: (noteId) => set((state) => ({
 notes: state.notes.filter((note) => note.id !== noteId)
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
 return { events: [...state.events, newEvent] };
 }),
 updateEvent: (eventId, updates) => set((state) => ({
 events: state.events.map((event) => event.id === eventId ? { ...event, ...updates } : event)
 })),
 deleteEvent: (eventId) => set((state) => ({
 events: state.events.filter((event) => event.id !== eventId)
 })),

 // Pomodoro state
 timerMode: 'work',
 timerStatus: 'idle',
 secondsLeft: defaultSettings.pomodoroWorkTime * 60,
 totalSessionsCompleted: 4, // completed sessions
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

 // Calculate next timer duration
 let nextMins = state.settings.pomodoroWorkTime;
 if (nextMode === 'shortBreak') nextMins = state.settings.pomodoroShortBreak;
 if (nextMode === 'longBreak') nextMins = state.settings.pomodoroLongBreak;

 return {
 timerStatus: nextStatus,
 timerMode: nextMode,
 secondsLeft: nextMins * 60,
 totalSessionsCompleted: totalSess,
 pomodoroHistory: [...state.pomodoroHistory, newSession],
 githubCommits: newCommits
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
 return { githubCommits: [newCommit, ...state.githubCommits] };
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
 setGithubToken: (token) => set({ githubToken: token }),
  fetchRealGithubData: async () => {
    const { githubToken } = get();
    if (!githubToken) return;
    set({ githubIsLoading: true });
    try {
      // 1. Get real GitHub username
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
      
      // Update store with real username
      get().updateSettings({ githubUsername: realUsername });

      // 2. Repos
      const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
        headers: { Authorization: `Bearer ${githubToken}` }
      });
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        const repos = reposData.map((r: any) => ({
          name: r.name,
          description: r.description || '',
          stars: r.stargazers_count,
          forks: r.forks_count,
          openIssues: r.open_issues_count
        }));
        
        // 3. Issues
        const issuesRes = await fetch(`https://api.github.com/search/issues?q=author:${realUsername}+type:issue+state:open`, {
          headers: { Authorization: `Bearer ${githubToken}` }
        });
        let issues: any[] = [];
        if (issuesRes.ok) {
          const issuesData = await issuesRes.json();
          issues = (issuesData.items || []).slice(0, 10).map((i: any) => {
            const repoUrlParts = i.repository_url.split('/');
            return {
              id: `issue-${i.id}`,
              number: i.number,
              title: i.title,
              state: i.state,
              url: i.html_url,
              repoName: repoUrlParts[repoUrlParts.length - 1]
            };
          });
        }

        // 4. PRs
        const prsRes = await fetch(`https://api.github.com/search/issues?q=author:${realUsername}+type:pr+state:open`, {
          headers: { Authorization: `Bearer ${githubToken}` }
        });
        let prs: any[] = [];
        if (prsRes.ok) {
          const prsData = await prsRes.json();
          prs = (prsData.items || []).slice(0, 10).map((p: any) => {
            const repoUrlParts = p.repository_url.split('/');
            return {
              id: `pr-${p.id}`,
              number: p.number,
              title: p.title,
              state: p.state,
              url: p.html_url,
              repoName: repoUrlParts[repoUrlParts.length - 1],
              merged: false
            };
          });
        }

        // 5. Commits (Push Events)
        // We fetch up to 100 events to find as many push events as possible for the heatmap
        const eventsRes = await fetch(`https://api.github.com/users/${realUsername}/events/public?per_page=100`, {
          headers: { Authorization: `Bearer ${githubToken}` }
        });
        const commits: GithubCommit[] = [];
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          if (Array.isArray(eventsData)) {
            eventsData.filter(e => e.type === 'PushEvent').forEach(e => {
              e.payload.commits.forEach((c: any) => {
                commits.push({
                  id: c.sha,
                  message: c.message.split('\n')[0],
                  date: e.created_at.split('T')[0],
                  repoName: e.repo.name.split('/')[1] || e.repo.name,
                  author: realUsername
                });
              });
            });
          }
        }

        set({
          githubUsername: realUsername,
          githubRepos: repos,
          githubIssues: issues,
          githubPRs: prs,
          githubCommits: commits,
          githubConnected: true
        });
      }
    } catch (e) {
      console.error("Failed to fetch GitHub data:", e);
    } finally {
      set({ githubIsLoading: false });
    }
 }
 };
 },
 {
 name: 'dev-productivity-platform-store',
 partialize: (state) => ({
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
 currentUser: state.currentUser
 })
 }
 )
);

// Cloud Sync Listener
useStore.subscribe((state, prevState) => {
  if (state.currentUser && state !== prevState) {
    const stateToSave = {
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
      githubToken: state.githubToken
    };
    setDoc(doc(db, 'users', state.currentUser.uid), { state: stateToSave }, { merge: true })
      .catch(err => console.error('Cloud sync failed:', err));
  }
});
