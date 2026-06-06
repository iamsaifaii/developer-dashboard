import React from 'react';
import { useStore } from '../../store/useStore';

export const GoalsDashboard: React.FC = () => {
  const { goals, habits } = useStore();

  return (
    <div className="w-full h-full p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Goals & Habits</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Track your progress and build consistent developer habits.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-4">Current Goals</h2>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">No goals set yet. Start by defining a weekly or monthly target.</div>
            ) : (
              <div className="space-y-4">
                {goals.map(goal => (
                  <div key={goal.id} className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">{goal.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded">
                        {goal.period}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-neutral-500 mb-2">
                      <span>Progress</span>
                      <span className="font-mono">{goal.current} / {goal.target}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-4">Habit Streaks</h2>
            {habits.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">No habits logged yet.</div>
            ) : (
              <div className="space-y-4">
                {habits.map(habit => (
                  <div key={habit.id} className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">{habit.name}</h3>
                      <p className="text-xs text-neutral-500 mt-1">Last log: {habit.lastLogDate}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-orange-500">{habit.currentStreak}</div>
                        <div className="text-[10px] uppercase font-bold text-neutral-500">Current</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-neutral-400">{habit.longestStreak}</div>
                        <div className="text-[10px] uppercase font-bold text-neutral-500">Longest</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
