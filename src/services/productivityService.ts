import { postJson } from './apiClient';
import type { Task } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ProductivityMetricsResponse {
  focusScore: number;
  burnoutRisk: string;
  riskColor: string;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
  };
}

export interface DeadlinesResponse {
  overdueList: Task[];
  dueTodayList: Task[];
  upcomingList: Task[];
  notificationsToTrigger: any[];
}

export interface RemindersResponse {
  reminders: { title: string; message: string }[];
}

export const productivityService = {
  calculateMetrics: async (tasks: Task[], pomodoroSessions: number): Promise<ProductivityMetricsResponse> => {
    return postJson<ProductivityMetricsResponse>(`${BASE_URL}/productivity/calculate`, { tasks, pomodoroSessions });
  },

  checkDeadlines: async (tasks: Task[]): Promise<DeadlinesResponse> => {
    return postJson<DeadlinesResponse>(`${BASE_URL}/deadlines/check`, { tasks });
  },

  generateReminders: async (tasks: Task[], pomodoroSessions: number): Promise<RemindersResponse> => {
    return postJson<RemindersResponse>(`${BASE_URL}/reminders/generate`, { tasks, pomodoroSessions });
  }
};
