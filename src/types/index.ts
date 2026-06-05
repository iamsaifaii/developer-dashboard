export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
 id: string;
 title: string;
 isCompleted: boolean;
}

export interface TaskAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
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
 attachments?: TaskAttachment[];
 dependencies?: string[];
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

export type NotificationCategory = 'task' | 'productivity' | 'github' | 'system';

export interface AppNotification {
 id: string;
 title: string;
 message: string;
 category: NotificationCategory;
 isRead: boolean;
 createdAt: string;
 link?: string; // Optional link to task, issue, etc.
}


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
  language?: string;
  updatedAt?: string;
  isPrivate?: boolean;
  url?: string;
}

export interface GithubIssue {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed';
  url: string;
  repoName: string;
  labels?: string[];
  createdAt?: string;
  closedAt?: string | null;
  assignee?: string | null;
}

export interface GithubPR {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed';
  url: string;
  repoName: string;
  merged: boolean;
  createdAt?: string;
  closedAt?: string | null;
  mergedAt?: string | null;
}

export interface GithubCommit {
  id: string;
  message: string;
  date: string; // YYYY-MM-DD
  repoName: string;
  author: string;
  sha?: string;
}

export interface GithubContributionDay {
  date: string;
  count: number;
}

export interface GithubWeeklyActivity {
  weekStart: string; // YYYY-MM-DD of Sunday
  total: number;
}

export interface GithubAnalytics {
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  totalOpenPRs: number;
  totalClosedPRs: number;
  totalMergedPRs: number;
  totalOpenIssues: number;
  totalClosedIssues: number;
  weeklyActivity: GithubWeeklyActivity[];
  languageBreakdown: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
}

export interface NotificationPreferences {
 taskDue: boolean;
 taskOverdue: boolean;
 pomodoroComplete: boolean;
 focusReminder: boolean;
 githubCommits: boolean;
 githubPRs: boolean;
 systemUpdates: boolean;
}

export interface DeveloperSettings {
 userName: string;
 githubUsername: string;
 pomodoroWorkTime: number; // in minutes
 pomodoroShortBreak: number;
 pomodoroLongBreak: number;
 themeMode: 'dark' | 'glass';
 colorScheme: 'dark' | 'light' | 'system';
 avatarUrl?: string;
 bio?: string;
 notificationPreferences: NotificationPreferences;
}
