import { useStore } from '../../store/useStore';
import type { DevPilotContext } from '../../lib/openai';

export function useDevPilotContext(): DevPilotContext {
  const { tasks, notes, githubCommits, totalSessionsCompleted, settings } = useStore();

  const inProgressTasks = tasks.filter(t => t.columnId === 'progress');
  const completedTasks = tasks.filter(t => t.columnId === 'done');

  // Calculate overdue tasks
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    if (t.columnId === 'done' || !t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(23, 59, 59, 999);
    return due < now;
  });

  const urgentTasks = tasks.filter(t => t.priority === 'urgent');

  return {
    userName: settings.userName || 'Developer',
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    inProgressTasks: inProgressTasks.length,
    overdueTasks: overdueTasks.length,
    urgentTasks: urgentTasks.length,
    taskTitles: tasks.filter(t => t.columnId !== 'done').map(t => `[${t.priority}] ${t.title}`),
    completedTaskTitles: completedTasks.map(t => t.title),
    recentCommits: githubCommits.map(c => `[${c.repoName}] ${c.message}`),
    notesTitles: notes.map(n => n.title),
    pomodoroSessions: totalSessionsCompleted,
    githubUsername: settings.githubUsername || '',
    currentDate: new Date().toLocaleDateString()
  };
}
