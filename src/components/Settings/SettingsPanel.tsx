import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  FiClock, 
  FiSliders, 
  FiRotateCcw, 
  FiSave, 
  FiStar,
  FiCheckCircle,
  FiUser,
  FiSun,
  FiMoon,
  FiMonitor
} from 'react-icons/fi';
import { UserProfilePanel } from '../Auth/UserProfilePanel';
export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useStore();

  // Form local states
  const [workTime, setWorkTime] = useState(settings.pomodoroWorkTime);
  const [shortBreak, setShortBreak] = useState(settings.pomodoroShortBreak);
  const [longBreak, setLongBreak] = useState(settings.pomodoroLongBreak);
  const [themeMode, setThemeMode] = useState(settings.themeMode);
  const [colorScheme, setColorScheme] = useState(settings.colorScheme);
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      pomodoroWorkTime: Number(workTime),
      pomodoroShortBreak: Number(shortBreak),
      pomodoroLongBreak: Number(longBreak),
      themeMode,
      colorScheme,
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-600 text-neutral-800 dark:text-neutral-200 text-xxs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xl z-50 pointer-events-none">
          <FiCheckCircle className="w-4 h-4" />
          <span>Settings saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Account & Profile */}
          <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              <FiUser className="w-4 h-4" />
              <span>Account &amp; Profile</span>
            </div>
            <UserProfilePanel />
          </div>

          {/* Card 2: Pomodoro */}
          <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              <FiClock className="w-4.5 h-4.5" />
              <span>Pomodoro Clock Intervals</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Work (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={workTime}
                  onChange={(e) => setWorkTime(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-500 text-center"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Short (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="30"
                  value={shortBreak}
                  onChange={(e) => setShortBreak(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-500 text-center"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Long (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={longBreak}
                  onChange={(e) => setLongBreak(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-500 text-center"
                  required
                />
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal">
              Changing Pomodoro clock parameters resets active timer intervals when timer is idle.
            </p>
          </div>

          {/* Card 3: Theme Aesthetics */}
          <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              <FiSliders className="w-4 h-4" />
              <span>Theme Aesthetics</span>
            </div>

            <div>
              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">Color Scheme</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setColorScheme('light')}
                  className={`px-4 py-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    colorScheme === 'light'
                      ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 text-neutral-800 dark:text-neutral-200'
                      : 'bg-white dark:bg-black/20 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-neutral-300'
                  }`}
                >
                  <FiSun className="w-4.5 h-4.5" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setColorScheme('dark')}
                  className={`px-4 py-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    colorScheme === 'dark'
                      ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 text-neutral-800 dark:text-neutral-200'
                      : 'bg-white dark:bg-black/20 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-neutral-300'
                  }`}
                >
                  <FiMoon className="w-4.5 h-4.5" />
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setColorScheme('system')}
                  className={`px-4 py-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    colorScheme === 'system'
                      ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 text-neutral-800 dark:text-neutral-200'
                      : 'bg-white dark:bg-black/20 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-neutral-300'
                  }`}
                >
                  <FiMonitor className="w-4.5 h-4.5" />
                  System
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">Dashboard Style</label>
              <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setThemeMode('glass')}
                  className={`px-4 py-3 rounded-xl border cursor-pointer flex flex-col items-center gap-1.5 ${
                    themeMode === 'glass'
                      ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-500 text-neutral-700 dark:text-neutral-300 shadow-md'
                      : 'bg-white dark:bg-black/30 border-neutral-200 dark:border-neutral-850 text-neutral-500 dark:text-neutral-400 hover:border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <FiStar className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                  <span>Glassmorphism</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`px-4 py-3 rounded-xl border cursor-pointer flex flex-col items-center gap-1.5 ${
                    themeMode === 'dark'
                      ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-500 text-neutral-700 dark:text-neutral-300 shadow-md'
                      : 'bg-white dark:bg-black/30 border-neutral-200 dark:border-neutral-850 text-neutral-500 dark:text-neutral-400 hover:border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <FiUser className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                  <span>Sleek Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Destructive */}
          <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                <FiRotateCcw className="w-4 h-4" />
                <span>Workspace Data</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                Resetting will wipe local storage, restoring default templates for tasks, notes, and Pomodoro history.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetWorkspace}
              className="py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl cursor-pointer text-center transition-colors"
            >
              Reset Workspace Data
            </button>
          </div>

        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-black dark:text-white rounded-xl cursor-pointer shadow-lg transition-colors"
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
