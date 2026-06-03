export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
 id: string;
 title: string;
 isCompleted: boolean;
}

export interface Task {
 id: string;
 title: string;
 description: string;
 columnId: string;
 priority: Priority;
 tags: string[];
 subtasks: Subtask[];
 dueDate?: string;
 githubIssueId?: string;
 githubIssueUrl?: string;
 githubIssueNumber?: number;
 coverImage?: string;
 attachmentCount?: number;
 createdAt: string;
}

export interface Column {
 id: string;
 title: string;
}

export interface Note {
 id: string;
 title: string;
 content: string;
 folder: string;
 tags: string[];
 updatedAt: string;
}

export interface CalendarEvent {
 id: string;
 title: string;
 description: string;
 start: string; // ISO date string (YYYY-MM-DD)
 end: string; // ISO date string (YYYY-MM-DD)
 color?: string;
 taskId?: string; // Linked task ID, if any
}

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSession {
 id: string;
 mode: TimerMode;
 duration: number; // in minutes
 timestamp: string;
}

export interface GithubRepo {
 name: string;
 description: string;
 stars: number;
 forks: number;
 openIssues: number;
}

export interface GithubIssue {
 id: string;
 number: number;
 title: string;
 state: 'open' | 'closed';
 url: string;
 repoName: string;
}

export interface GithubPR {
 id: string;
 number: number;
 title: string;
 state: 'open' | 'closed';
 url: string;
 repoName: string;
 merged: boolean;
}

export interface GithubCommit {
 id: string;
 message: string;
 date: string; // YYYY-MM-DD
 repoName: string;
 author: string;
}

export interface DeveloperSettings {
 userName: string;
 githubUsername: string;
 pomodoroWorkTime: number; // in minutes
 pomodoroShortBreak: number;
 pomodoroLongBreak: number;
 themeMode: 'dark' | 'glass';
 colorScheme: 'dark' | 'light';
}
