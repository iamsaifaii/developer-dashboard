import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { 
 Task, Column, Note, CalendarEvent, PomodoroSession, TimerMode, DeveloperSettings,
 GithubRepo, GithubIssue, GithubPR, GithubCommit
} from '../types';

// Mock Initial Data helper functions
const getMockTasks = (): Task[] => [
 {
 id: 'task-1',
 title: 'Set up global state management with Zustand',
 description: 'Establish a reliable centralized state container for tasks, notes, Pomodoro, and settings. Apply persist middleware to keep data on page refresh.',
 columnId: 'done',
 priority: 'high',
 tags: ['Architecture', 'React'],
 subtasks: [
 { id: 'sub-1-1', title: 'Define types and interfaces', isCompleted: true },
 { id: 'sub-1-2', title: 'Create Zustand store', isCompleted: true },
 { id: 'sub-1-3', title: 'Connect to local storage', isCompleted: true }
 ],
 dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
 githubIssueNumber: 42,
 githubIssueUrl: 'https://github.com/developer/platform/issues/42',
 createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
 },
 {
 id: 'task-2',
 title: 'Design glassmorphic CSS theme',
 description: 'Implement modern dark-mode-first aesthetic with glowing borders, translucent background panels, dynamic blur filters, and fluid layouts.',
 columnId: 'done',
 priority: 'high',
 tags: ['UI/UX', 'Tailwind'],
 subtasks: [
 { id: 'sub-2-1', title: 'Configure Tailwind theme colors', isCompleted: true },
 { id: 'sub-2-2', title: 'Design backdrop blur layouts', isCompleted: true }
 ],
 dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
 githubIssueNumber: 43,
 githubIssueUrl: 'https://github.com/developer/platform/issues/43',
 createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
 },
 {
 id: 'task-3',
 title: 'Implement animated Pomodoro circular timer',
 description: 'Construct custom SVG ring countdown that displays work (25m), short break (5m), and long break (15m) sessions. Ensure audio cues play on completion.',
 columnId: 'in-progress',
 priority: 'medium',
 tags: ['Animations', 'Core'],
 subtasks: [
 { id: 'sub-3-1', title: 'Create circular SVG', isCompleted: true },
 { id: 'sub-3-2', title: 'Connect to Zustand countdown loop', isCompleted: false },
 { id: 'sub-3-3', title: 'Add chime sound notification', isCompleted: false }
 ],
 dueDate: new Date().toISOString().split('T')[0], // Today
 createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
 },
 {
 id: 'task-4',
 title: 'Mock GitHub contribution graph grid',
 description: 'Visualize code contributions using an SVG grid resembling the official GitHub profile display. Feed mock commits from state into grid calculations.',
 columnId: 'in-progress',
 priority: 'medium',
 tags: ['GitHub', 'Analytics'],
 subtasks: [
 { id: 'sub-4-1', title: 'Create contribution grid UI', isCompleted: true },
 { id: 'sub-4-2', title: 'Generate mock commit timelines', isCompleted: false }
 ],
 dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
 createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
 },
 {
 id: 'task-5',
 title: 'Add markdown parser support for Notes system',
 description: 'Allow devs to format notes using markdown directives (headings, bold, lists, code blocks). Link notes to relevant projects.',
 columnId: 'todo',
 priority: 'low',
 tags: ['Notes', 'Rich Text'],
 subtasks: [
 { id: 'sub-5-1', title: 'Integrate custom markdown renderer', isCompleted: false },
 { id: 'sub-5-2', title: 'Add rich formatting shortcuts', isCompleted: false }
 ],
 dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // In 3 days
 createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
 },
 {
 id: 'task-6',
 title: 'Optimize calendar drag-and-drop operations',
 description: 'Research browser lag during event rescheduling. Introduce state debouncing or optimistic updates for instantaneous calendar interactions.',
 columnId: 'backlog',
 priority: 'low',
 tags: ['Performance'],
 subtasks: [],
 dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // In a week
 createdAt: new Date().toISOString()
 }
];

const getMockNotes = (): Note[] => [
 {
 id: 'note-1',
 title: 'Deployment & Release Checklist',
 content: `# Production Deployment Protocol
1. [ ] Run \`npm run build\` to verify production build.
2. [ ] Audit dependencies with \`npm audit\`.
3. [ ] Verify SSL certificates on staging.
4. [ ] Ensure environment variables are loaded in Vercel/AWS.
5. [ ] Perform quick sanity test of Kanban reordering and Pomodoro ring.
6. [ ] Deploy branch \`main\` to live server.
7. [ ] Monitor Sentry dashboard for exception spikes.`,
 folder: 'Work',
 tags: ['DevOps', 'Guide'],
 updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
 },
 {
 id: 'note-2',
 title: 'Platform Enhancements Backlog',
 content: `# Ideas for Next Version
- **Real GitHub Sync**: Transition mock hooks to official REST APIs.
- **WebSocket Team sync**: Allow multiple users to move cards on a shared Kanban board in real time.
- **AI Task Estimator**: Prompt API to analyze description and suggest Pomodoro time.
- **Spotify Integration**: Embedded mini-player inside Sidebar.`,
 folder: 'Ideas',
 tags: ['Brainstorm', 'NextV'],
 updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
 },
 {
 id: 'note-3',
 title: 'Zustand State Strategy',
 content: `# Centralized Zustand Store
- We store tasks, notes, Pomodoro countdown, and GitHub integrations.
- Prevents component unmounting issues (e.g. switching tabs doesn't reset running Pomodoro clock).
- Combines persistence to localStorage using JSON parsing.
- Easy to extract mock commit data and calculate productivity dashboards directly in getters.`,
 folder: 'Snippets',
 tags: ['Code', 'Architecture'],
 updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
 }
];

const getMockEvents = (): CalendarEvent[] => {
 const todayStr = new Date().toISOString().split('T')[0];
 const tomorrowStr = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
 const nextDayStr = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
 return [
 {
 id: 'event-1',
 title: 'Daily Standup Sync',
 description: 'Discuss blocking points, review current sprints, check GitHub issues status.',
 start: todayStr,
 end: todayStr,
 color: '#8b5cf6' // violet
 },
 {
 id: 'event-2',
 title: 'Technical Design Review',
 description: 'Go over new database indexes and Tailwind CSS v4 performance benefits.',
 start: tomorrowStr,
 end: tomorrowStr,
 color: '#06b6d4' // cyan
 },
 {
 id: 'event-3',
 title: 'Portfolio Showcase Rehearsal',
 description: 'Review with peers to ensure animations are optimized and responsive.',
 start: nextDayStr,
 end: nextDayStr,
 color: '#ec4899' // pink
 }
 ];
};

const getMockGithubData = () => {
 const username = 'developer-profile';
 const repos: GithubRepo[] = [
 { name: 'dev-productivity-hub', description: 'Central dashboard showing tasks, calendars, notes, and Pomodoro trackers.', stars: 128, forks: 14, openIssues: 3 },
 { name: 'framer-motion-helpers', description: 'Fluid helper utilities for drag-and-drop React boards.', stars: 54, forks: 4, openIssues: 1 },
 { name: 'zustand-persistent-state', description: 'Simple wrapper for easy persistence configuration.', stars: 92, forks: 8, openIssues: 0 },
 { name: 'tailwind-v4-gradients', description: 'Curated premium gradients specifically built for tailwindcss v4.', stars: 215, forks: 21, openIssues: 2 }
 ];

 const issues: GithubIssue[] = [
 { id: 'issue-101', number: 101, title: 'Fix drag lag on high refresh rate displays', state: 'open', url: 'https://github.com/developer/dev-productivity-hub/issues/101', repoName: 'dev-productivity-hub' },
 { id: 'issue-102', number: 102, title: 'Add long break audio chime triggers', state: 'open', url: 'https://github.com/developer/dev-productivity-hub/issues/102', repoName: 'dev-productivity-hub' },
 { id: 'issue-103', number: 103, title: 'Document TS types for Github actions API', state: 'open', url: 'https://github.com/developer/dev-productivity-hub/issues/103', repoName: 'dev-productivity-hub' },
 { id: 'issue-201', number: 201, title: 'Optimize animations in nested lists', state: 'open', url: 'https://github.com/developer/framer-motion-helpers/issues/201', repoName: 'framer-motion-helpers' }
 ];

 const prs: GithubPR[] = [
 { id: 'pr-110', number: 110, title: 'feat: Add circular SVG pomodoro dashboard panel', state: 'open', url: 'https://github.com/developer/dev-productivity-hub/pull/110', repoName: 'dev-productivity-hub', merged: false },
 { id: 'pr-108', number: 108, title: 'refactor: Move routing states to Zustand store', state: 'closed', url: 'https://github.com/developer/dev-productivity-hub/pull/108', repoName: 'dev-productivity-hub', merged: true },
 { id: 'pr-105', number: 105, title: 'docs: Update setup scripts for npm dev server', state: 'closed', url: 'https://github.com/developer/dev-productivity-hub/pull/105', repoName: 'dev-productivity-hub', merged: true }
 ];

 // Helper to generate past commits
 const commits: GithubCommit[] = [];
 const reposList = ['dev-productivity-hub', 'framer-motion-helpers', 'tailwind-v4-gradients'];
 const commitMessages = [
 'feat: add zustand persistent middleware configuration',
 'style: design glow effects for glass panels',
 'fix: pomodoro interval reset timer tick bug',
 'docs: write comprehensive README deployment guide',
 'refactor: type definitions structure cleanup',
 'test: add mocks for GitHub REST API hooks',
 'perf: dynamic lazy load sub-calendars',
 'feat: drag event handler optimizations'
 ];

 for (let i = 0; i < 15; i++) {
 const commitDate = new Date();
 commitDate.setDate(commitDate.getDate() - Math.floor(i / 2));
 const dateStr = commitDate.toISOString().split('T')[0];
 commits.push({
 id: `commit-${1000 + i}`,
 message: commitMessages[i % commitMessages.length],
 date: dateStr,
 repoName: reposList[i % reposList.length],
 author: username
 });
 }

 return { username, repos, issues, prs, commits };
};

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
 const gitData = getMockGithubData();
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
 tasks: getMockTasks(),
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
 notes: getMockNotes(),
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
 events: getMockEvents(),
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
 githubConnected: true, // Connect by default for instant wow factor!
 githubUsername: gitData.username,
 githubRepos: gitData.repos,
 githubIssues: gitData.issues,
 githubPRs: gitData.prs,
 githubCommits: gitData.commits,
 connectGithub: (username) => set(() => {
 const freshData = getMockGithubData();
 return {
 githubConnected: true,
 githubUsername: username,
 githubRepos: freshData.repos,
 githubIssues: freshData.issues.map(i => ({ ...i, repoName: freshData.repos[0].name })),
 githubPRs: freshData.prs.map(p => ({ ...p, repoName: freshData.repos[0].name })),
 githubCommits: freshData.commits
 };
 }),
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
                  message: c.message.split('\\n')[0],
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
 githubToken: state.githubToken
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
