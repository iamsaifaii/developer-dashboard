import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  FiClock, 
  FiSliders, 
  FiRotateCcw, 
  FiSave, 
  FiCheckCircle,
  FiUser,
  FiBell
} from 'react-icons/fi';
import { UserProfilePanel } from '../Auth/UserProfilePanel';
import { ExportCenter } from './ExportCenter';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useStore();


  // Form local states
  const [workTime, setWorkTime] = useState(settings.pomodoroWorkTime);
  const [shortBreak, setShortBreak] = useState(settings.pomodoroShortBreak);
  const [longBreak, setLongBreak] = useState(settings.pomodoroLongBreak);
  const [notificationPreferences, setNotificationPreferences] = useState(
    settings.notificationPreferences || {
      taskDue: true, taskOverdue: true, pomodoroComplete: true, focusReminder: true, githubCommits: true, githubPRs: true, systemUpdates: true
    }
  );
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      pomodoroWorkTime: Number(workTime),
      pomodoroShortBreak: Number(shortBreak),
      pomodoroLongBreak: Number(longBreak),
      themeMode: 'dark',
      colorScheme: 'dark',
      notificationPreferences
    });
    setShowSaveAlert(true);
    setTimeout(() => setShowSaveAlert(false), 2500);
  };

  const handleResetWorkspace = () => {
    if (confirm('Are you sure you want to reset your workspace? This will restore mock values, notes, and Pomodoro statistics.')) {
      localStorage.removeItem('dev-productivity-platform-store');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto relative text-left">


      {showSaveAlert && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 text-neutral-100 text-xxs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xl z-50 pointer-events-none">
          <FiCheckCircle className="w-4 h-4 text-black dark:text-white" />
          <span>Settings saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Account & Profile */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-350 uppercase tracking-wider mb-2">
              <FiUser className="w-4 h-4" />
              <span>Account &amp; Profile</span>
            </div>
            <UserProfilePanel />
          </div>

          {/* Card 2: Pomodoro */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-350 uppercase tracking-wider mb-2">
              <FiClock className="w-4.5 h-4.5" />
              <span>Pomodoro Clock Intervals</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-bold text-neutral-550 uppercase tracking-wider block mb-1">Work (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={workTime}
                  onChange={(e) => setWorkTime(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-neutral-500 text-center"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-550 uppercase tracking-wider block mb-1">Short (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="30"
                  value={shortBreak}
                  onChange={(e) => setShortBreak(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-neutral-500 text-center"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-550 uppercase tracking-wider block mb-1">Long (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={longBreak}
                  onChange={(e) => setLongBreak(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-neutral-500 text-center"
                  required
                />
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 leading-normal">
              Changing Pomodoro clock parameters resets active timer intervals when timer is idle.
            </p>
          </div>

          {/* Card 3: Theme Aesthetics */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-350 uppercase tracking-wider mb-2">
              <FiSliders className="w-4 h-4" />
              <span>Theme Aesthetics</span>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-xl space-y-2">
              <p className="text-xs font-bold text-neutral-200">Exclusive Flat Dark Theme Active</p>
              <p className="text-[10px] text-neutral-500 leading-normal">
                DevFlow is configured to run exclusively in high-contrast monochromatic dark mode. Color scheme controls have been disabled to ensure design consistency and eliminate visual fatigue.
              </p>
            </div>
          </div>

          {/* Card 4: Notifications */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-350 uppercase tracking-wider mb-2">
              <FiBell className="w-4 h-4" />
              <span>Notification Preferences</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries({
                taskDue: 'Task Due Reminders',
                taskOverdue: 'Task Overdue Alerts',
                pomodoroComplete: 'Pomodoro Completion',
                focusReminder: 'Focus Reminders',
                githubCommits: 'GitHub Commits',
                githubPRs: 'GitHub PR Updates',
                systemUpdates: 'System Updates'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={notificationPreferences[key as keyof typeof notificationPreferences]}
                      onChange={(e) => setNotificationPreferences(prev => ({
                        ...prev, [key]: e.target.checked
                      }))}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${notificationPreferences[key as keyof typeof notificationPreferences] ? 'bg-white' : 'bg-neutral-800'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-neutral-900 w-4 h-4 rounded-full transition-transform ${notificationPreferences[key as keyof typeof notificationPreferences] ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-xs text-neutral-300 font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Card 4.5: Export & Backup Center */}
          <ExportCenter />

          {/* Card 5: Destructive */}
          <div className="glass-panel rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-4 md:col-span-2">
            <div className="text-left">
              <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-350 uppercase tracking-wider mb-2">
                <FiRotateCcw className="w-4 h-4" />
                <span>Workspace Data</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                Resetting will wipe local storage, restoring default templates for tasks, notes, and Pomodoro history.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetWorkspace}
              className="py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold rounded-xl cursor-pointer text-center transition-colors"
            >
              Reset Workspace Data
            </button>
          </div>

        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 bg-white hover:bg-neutral-200 text-xs font-bold text-neutral-950 rounded-xl cursor-pointer shadow-lg transition-colors"
          >
            <FiSave className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;
