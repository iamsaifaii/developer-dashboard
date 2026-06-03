import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
 FiUser, 
 FiClock, 
 FiSliders, 
 FiRotateCcw, 
 FiSave, 
 FiStar,
 FiCheckCircle
} from 'react-icons/fi';
import { GithubIcon } from '../BrandIcons';
export const SettingsPanel: React.FC = () => {
 const { settings, updateSettings, githubConnected, connectGithub } = useStore();

 // Form local states
 const [userName, setUserName] = useState(settings.userName);
 const [githubUsername, setGithubUsername] = useState(settings.githubUsername);
 const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl || '');
 const [bio, setBio] = useState(settings.bio || '');
 const [workTime, setWorkTime] = useState(settings.pomodoroWorkTime);
 const [shortBreak, setShortBreak] = useState(settings.pomodoroShortBreak);
 const [longBreak, setLongBreak] = useState(settings.pomodoroLongBreak);
 const [themeMode, setThemeMode] = useState(settings.themeMode);

 const [showSaveAlert, setShowSaveAlert] = useState(false);

 const handleSave = (e: React.FormEvent) => {
 e.preventDefault();
 updateSettings({
 userName,
 githubUsername,
 pomodoroWorkTime: Number(workTime),
 pomodoroShortBreak: Number(shortBreak),
 pomodoroLongBreak: Number(longBreak),
 themeMode,
 avatarUrl,
 bio
 });

 // If connected to github, sync state profile handle automatically
 if (githubConnected && githubUsername !== settings.githubUsername) {
 connectGithub(githubUsername);
 }

 setShowSaveAlert(true);
 setTimeout(() => {
 setShowSaveAlert(false);
 }, 2500);
 };

 const handleResetWorkspace = () => {
 if (confirm('Are you sure you want to reset your workspace? This will restore mock values, notes, and Pomodoro statistics.')) {
 localStorage.removeItem('dev-productivity-platform-store');
 window.location.reload();
 }
 };

 return (
 <div className="max-w-3xl mx-auto relative text-left">
 
 {/* Save Notification Alert Popup */}
 <>
 {showSaveAlert && (
 <div
 className="absolute top-0 left-1/2 -translate-x-1/2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-600 text-neutral-800 dark:text-neutral-200 text-xxs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xl z-50 pointer-events-none"
 >
 <FiCheckCircle className="w-4 h-4" />
 <span>Developer settings synced successfully!</span>
 </div>
 )}
 </>

 <form onSubmit={handleSave} className="space-y-6">
 
 {/* Form Body Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 {/* Card 1: User Profile Settings */}
  <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-4">
    <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
      <FiUser className="w-4.5 h-4.5" />
      <span>Developer Details</span>
    </div>

    {/* Avatar preview and upload */}
    <div className="flex items-center gap-4 border-b border-neutral-850 pb-4">
      <img 
        src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || 'Developer')}`} 
        className="w-14 h-14 rounded-xl border border-neutral-800 object-cover bg-neutral-900"
        alt="Profile Avatar"
      />
      <div className="flex-1 flex flex-col gap-2">
        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">Avatar Photo</label>
        <div className="flex gap-2">
          {/* File selector input */}
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const base64 = ev.target?.result as string;
                  if (base64) setAvatarUrl(base64);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden" 
            id="profile-avatar-upload"
          />
          <label 
            htmlFor="profile-avatar-upload"
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-[10px] font-bold rounded-lg border border-neutral-700 text-neutral-300 cursor-pointer transition-colors"
          >
            Upload Photo
          </label>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl('')}
              className="px-3 py-1.5 bg-transparent hover:bg-red-950/20 text-[10px] font-bold rounded-lg border border-red-900/30 text-red-400 cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Dev Name */}
    <div>
      <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Display Name</label>
      <input 
        type="text" 
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 text-neutral-800 dark:text-neutral-200 placeholder-neutral-650 focus:outline-none focus:border-neutral-500"
        required
      />
    </div>

    {/* Bio */}
    <div>
      <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Developer Bio</label>
      <textarea 
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Software Engineer, designer, problem solver..."
        rows={2}
        className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 text-neutral-800 dark:text-neutral-200 placeholder-neutral-650 focus:outline-none focus:border-neutral-500 resize-none"
      />
    </div>

    {/* Git Handle */}
    <div>
      <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">GitHub Account username</label>
      <div className="relative">
        <GithubIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
          className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 text-neutral-800 dark:text-neutral-200 placeholder-neutral-650 focus:outline-none focus:border-neutral-500"
          required
        />
      </div>
      <span className="text-[9px] text-neutral-500 mt-1 block">Updating this syncs username across commit graphs automatically.</span>
    </div>
  </div>

 {/* Card 2: Pomodoro Custom durations */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-4">
 <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
 <FiClock className="w-4.5 h-4.5" />
 <span>Pomodoro Clock Intervals</span>
 </div>

 <div className="grid grid-cols-3 gap-3">
 {/* Work Session */}
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

 {/* Short Break */}
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

 {/* Long Break */}
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

 {/* Card 3: Theme Panel preferences */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-4">
 <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
 <FiSliders className="w-4.5 h-4.5" />
 <span>Theme Aesthetics</span>
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

 {/* Card 4: Wiping state database */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-4">
 <div className="text-left">
 <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
 <FiRotateCcw className="w-4.5 h-4.5" />
 <span>Destructive Options</span>
 </div>
 <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
 Resetting your workspace will wipe local storage variables, restoring setup templates for Kanban tasks, scheduled calendar events, markdown guides, and Pomodoro ticks.
 </p>
 </div>

 <button
 type="button"
 onClick={handleResetWorkspace}
 className="py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-500 text-xs font-bold rounded-xl cursor-pointer text-center"
 >
 Reset All Data
 </button>
 </div>

 </div>

 {/* Footer Sync Button */}
 <div className="flex justify-end pt-2">
 <button
 type="submit"
 className="flex items-center gap-1.5 px-6 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 text-xs font-bold text-black dark:text-white rounded-xl cursor-pointer shadow-lg shadow-neutral-900/10"
 >
 <FiSave className="w-4 h-4" />
 <span>Apply Configurations</span>
 </button>
 </div>

 </form>
 </div>
 );
};
export default SettingsPanel;
