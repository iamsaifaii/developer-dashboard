import React from 'react';

export const UserGuidePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">User Guide</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Everything you need to know about using DevFlow effectively.</p>
      </div>

      <div className="space-y-12">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-2">1. Getting Started</h2>
          <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Dashboard Overview</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Your Dashboard is the central hub for your workflow. From here, you can see your active tasks, recent notes, and progress on your goals. Use the Sidebar on the left to navigate between different tools and workspaces.
            </p>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mt-4">Creating Your First Task</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Navigate to the <strong>Kanban Board</strong> to start organizing your work. Click "Add Task" in any column to create a new card. You can set priorities, add tags, and break down complex tasks into subtasks.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-2">2. Productivity Tools</h2>
          <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Pomodoro Timer</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              The Pomodoro timer is integrated directly into the sidebar. Use it to break your work into focused intervals (typically 25 minutes), separated by short breaks. This technique helps maintain high levels of focus and prevents burnout.
            </p>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mt-4">Goals & Habits</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Track your long-term objectives in the <strong>Goals</strong> section. You can set daily habits and monitor your consistency over time with visual progress charts.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-2">3. Collaboration</h2>
          <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Teams</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Create a team to collaborate with others. You can invite members via email, and share specific boards or notes with them. Use the Workspace Switcher at the bottom of the sidebar to switch between your personal workspace and team workspaces.
            </p>
          </div>
        </section>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 mt-8">
        <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-300">Need more help?</h3>
        <p className="text-indigo-700 dark:text-indigo-400 mt-2">
          If you have questions that aren't answered in this guide, feel free to reach out to our support team or consult the community forums.
        </p>
      </div>
    </div>
  );
};
