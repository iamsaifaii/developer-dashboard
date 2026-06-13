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


  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'pomodoro' | 'notifications' | 'advanced'>('profile');

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

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault?.();
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

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: FiUser },
    { id: 'pomodoro', label: 'Focus & Pomodoro', icon: FiClock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'advanced', label: 'Advanced & Data', icon: FiSliders },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto relative text-left h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6">

      {showSaveAlert && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xxs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xl z-50 pointer-events-none panel-in">
          <FiCheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Settings saved!</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0 glass-panel border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-2 shadow-xl overflow-y-auto h-auto md:h-full">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2 mt-1">
          Settings Menu
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-zinc-800 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} />
              {tab.label}
            </button>
          );
        })}

        {/* Global Save Button moved to bottom of sidebar */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => handleSave()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-xs font-bold text-black rounded-xl cursor-pointer shadow-lg transition-colors"
          >
            <FiSave className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 glass-panel border border-zinc-800/80 rounded-2xl p-6 shadow-xl overflow-y-auto h-full">
        <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 h-full">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white tracking-tight">Account & Profile</h2>
                <p className="text-xs text-zinc-400 mt-1">Manage your developer profile and GitHub connection.</p>
              </div>
              <UserProfilePanel />
            </div>
          )}

          {/* Pomodoro Tab */}
          {activeTab === 'pomodoro' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white tracking-tight">Pomodoro Intervals</h2>
                <p className="text-xs text-zinc-400 mt-1">Customize your focus and break durations.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Work Time */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Focus Time</label>
                  <div className="flex items-center gap-3 w-full">
                    <button type="button" onClick={() => setWorkTime(Math.max(1, workTime - 1))} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors font-mono font-bold">-</button>
                    <input 
                      type="number" 
                      min="1" max="60"
                      value={workTime}
                      onChange={(e) => setWorkTime(Number(e.target.value))}
                      className="flex-1 text-lg px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-center font-bold"
                      required
                    />
                    <button type="button" onClick={() => setWorkTime(Math.min(60, workTime + 1))} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors font-mono font-bold">+</button>
                  </div>
                  <span className="text-[10px] text-zinc-500">minutes</span>
                </div>

                {/* Short Break */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Short Break</label>
                  <div className="flex items-center gap-3 w-full">
                    <button type="button" onClick={() => setShortBreak(Math.max(1, shortBreak - 1))} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors font-mono font-bold">-</button>
                    <input 
                      type="number" 
                      min="1" max="30"
                      value={shortBreak}
                      onChange={(e) => setShortBreak(Number(e.target.value))}
                      className="flex-1 text-lg px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-center font-bold"
                      required
                    />
                    <button type="button" onClick={() => setShortBreak(Math.min(30, shortBreak + 1))} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors font-mono font-bold">+</button>
                  </div>
                  <span className="text-[10px] text-zinc-500">minutes</span>
                </div>

                {/* Long Break */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Long Break</label>
                  <div className="flex items-center gap-3 w-full">
                    <button type="button" onClick={() => setLongBreak(Math.max(1, longBreak - 1))} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors font-mono font-bold">-</button>
                    <input 
                      type="number" 
                      min="1" max="60"
                      value={longBreak}
                      onChange={(e) => setLongBreak(Number(e.target.value))}
                      className="flex-1 text-lg px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-center font-bold"
                      required
                    />
                    <button type="button" onClick={() => setLongBreak(Math.min(60, longBreak + 1))} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer transition-colors font-mono font-bold">+</button>
                  </div>
                  <span className="text-[10px] text-zinc-500">minutes</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-3">
                <FiClock className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Changing Pomodoro clock parameters will reset your active timer intervals if a timer is currently idle.</p>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white tracking-tight">Notification Preferences</h2>
                <p className="text-xs text-zinc-400 mt-1">Control which events trigger system and audio alerts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  taskDue: 'Task Due Reminders',
                  taskOverdue: 'Task Overdue Alerts',
                  pomodoroComplete: 'Pomodoro Completion',
                  focusReminder: 'Focus Reminders',
                  githubCommits: 'GitHub Commits',
                  githubPRs: 'GitHub PR Updates',
                  systemUpdates: 'System Updates'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-colors group">
                    <span className="text-sm text-zinc-300 font-medium group-hover:text-white transition-colors">{label}</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={notificationPreferences[key as keyof typeof notificationPreferences]}
                        onChange={(e) => setNotificationPreferences(prev => ({
                          ...prev, [key]: e.target.checked
                        }))}
                      />
                      <div className={`block w-11 h-6 rounded-full transition-colors ${notificationPreferences[key as keyof typeof notificationPreferences] ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${notificationPreferences[key as keyof typeof notificationPreferences] ? 'transform translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6 h-full flex flex-col">
              <div className="pb-4 border-b border-zinc-800 shrink-0">
                <h2 className="text-lg font-bold text-white tracking-tight">Advanced & Data</h2>
                <p className="text-xs text-zinc-400 mt-1">Manage data exports, aesthetics, and destructive actions.</p>
              </div>

              <div className="space-y-6 flex-1">
                {/* Theme Notice */}
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm mb-1">
                    <FiSliders className="w-4 h-4" />
                    Exclusive Dark Theme
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    DevFlow is configured to run exclusively in high-contrast monochromatic dark mode. Theme toggles are disabled to ensure consistent visibility and eliminate visual fatigue during deep work sessions.
                  </p>
                </div>

                <div className="h-px bg-zinc-800 w-full" />

                {/* Export Center (Self Contained) */}
                <div className="-mx-6 px-6">
                  <ExportCenter />
                </div>

                <div className="h-px bg-zinc-800 w-full" />

                {/* Destructive Zone */}
                <div className="p-5 border border-red-900/30 bg-red-950/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                      <FiRotateCcw className="w-4 h-4" />
                      <span>Factory Reset Workspace</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-md">
                      This will permanently wipe local storage, restoring all default templates, notes, and Pomodoro history. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetWorkspace}
                    className="shrink-0 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;
