import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  FiPlay, 
  FiPause, 
  FiRotateCcw, 
  FiSkipForward, 
  FiCoffee, 
  FiAward,
  FiStar,
  FiVolume2,
  FiZap
} from 'react-icons/fi';
import { playChime } from './SoundPlayer';

export const PomodoroTimer: React.FC = () => {
  const { 
    timerMode, 
    timerStatus, 
    secondsLeft, 
    totalSessionsCompleted, 
    setTimerMode, 
    setTimerStatus, 
    resetTimer, 
    settings
  } = useStore();

  const getModeSettings = () => {
    switch (timerMode) {
      case 'work': return { name: 'Focus Period', duration: settings.pomodoroWorkTime, color: '#ffffff' };
      case 'shortBreak': return { name: 'Short Break', duration: settings.pomodoroShortBreak, color: '#a1a1aa' };
      case 'longBreak': return { name: 'Long Break', duration: settings.pomodoroLongBreak, color: '#71717a' };
    }
  };

  const currentModeInfo = getModeSettings();
  const totalSeconds = currentModeInfo.duration * 60;
  const progress = secondsLeft / totalSeconds;
  
  // SVG Ring Calculations
  const radius = 130;
  const circumference = 2 * Math.PI * radius;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleTestChime = () => {
    playChime();
  };

  const handleSkip = () => {
    if (timerMode === 'work') {
      setTimerMode('shortBreak');
    } else {
      setTimerMode('work');
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-left animate-fade-in-up">
      
      {/* Timer Display Panel */}
      <div className="md:col-span-2 glass-panel p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        
        {/* Chime sound test shortcut */}
        <button 
          onClick={handleTestChime}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white bg-transparent border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-200"
          title="Test audio chime"
        >
          <FiVolume2 className="w-3.5 h-3.5" />
          <span>Test Sound</span>
        </button>

        {/* Mode Selector Header */}
        <div className="flex gap-2 bg-[#0a0a0a] p-1.5 rounded-xl border border-zinc-800/80 mb-10 z-10 shadow-inner">
          {(['work', 'shortBreak', 'longBreak'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimerMode(mode)}
              className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 ${
                timerMode === mode
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-black'
              }`}
            >
              {mode === 'work' ? 'Focus Mode' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </button>
          ))}
        </div>

        {/* Circular SVG Timer */}
        <div className="relative w-80 h-80 flex items-center justify-center z-10 mb-10 select-none group">
          {/* Subtle glow effect behind timer */}
          <div className="absolute inset-0 bg-white opacity-[0.02] rounded-full blur-3xl group-hover:opacity-[0.04] transition-opacity duration-500" />
          
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              className="stroke-zinc-900 fill-none"
              strokeWidth="6"
            />
            {/* Progress track */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              className="fill-none transition-all duration-1000 ease-linear"
              stroke={currentModeInfo.color}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits & icon overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              key={timerMode}
              className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase mb-2"
              style={{ color: currentModeInfo.color }}
            >
              {timerMode === 'work' ? (
                <>
                  <FiZap className="w-3.5 h-3.5" />
                  <span>Time to Focus</span>
                </>
              ) : (
                <>
                  <FiCoffee className="w-3.5 h-3.5" />
                  <span>Take a Rest</span>
                </>
              )}
            </div>

            <span className="text-7xl font-black tracking-tighter text-white tabular-nums drop-shadow-lg">
              {formatTime(secondsLeft)}
            </span>

            <span className="text-[10px] text-zinc-400 mt-3 tracking-widest uppercase font-bold flex items-center gap-1.5 bg-black border border-zinc-800 px-3 py-1 rounded-full">
              {timerStatus === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-dot-online" />}
              {timerStatus === 'running' ? 'Focusing' : timerStatus === 'paused' ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Timer Control Panel */}
        <div className="flex items-center gap-6 z-10">
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-[#0a0a0a] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer shadow-lg transition-all duration-200 btn-press"
            title="Reset timer"
          >
            <FiRotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTimerStatus(timerStatus === 'running' ? 'paused' : 'running')}
            className="p-6 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all duration-300 btn-press transform hover:scale-105"
            title={timerStatus === 'running' ? 'Pause focus session' : 'Start focus session'}
          >
            {timerStatus === 'running' ? (
              <FiPause className="w-8 h-8 fill-zinc-950 stroke-none" />
            ) : (
              <FiPlay className="w-8 h-8 fill-zinc-950 stroke-none translate-x-1" />
            )}
          </button>

          <button
            onClick={handleSkip}
            className="p-4 rounded-full bg-[#0a0a0a] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer shadow-lg transition-all duration-200 btn-press"
            title="Skip current session"
          >
            <FiSkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Productivity Stats Sidebar */}
      <div className="space-y-6 md:col-span-1">
        {/* Completed Cards */}
        <div className="glass-panel p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Focus Sessions</p>
              <h3 className="text-4xl font-black text-white mt-1 tracking-tighter">{totalSessionsCompleted}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080809] border border-zinc-800 text-zinc-300 shadow-sm">
              <FiAward className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-5 leading-relaxed font-medium relative z-10">
            You completed <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded">{totalSessionsCompleted}</span> sessions of focus today. That equals <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded">{totalSessionsCompleted * settings.pomodoroWorkTime} minutes</span> of deep work.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="glass-panel p-6 shadow-xl relative">
          <div className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
            <FiStar className="w-3.5 h-3.5" />
            <span>Developer Tip</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed font-medium italic">
            "Studies show that developers work best in focused sprints. Use the Pomodoro timer to block out email, Slack, and pull request reviews, letting your brain dive deep into complex state logic and algorithms."
          </p>
          <div className="h-px bg-zinc-800 my-5" />
          <div className="space-y-3 text-[10px] text-zinc-400 font-bold tracking-widest">
            <div className="flex justify-between items-center bg-[#080809] border border-zinc-800/50 px-3 py-2 rounded-lg">
              <span>WORK STATE</span>
              <span className="text-white">{settings.pomodoroWorkTime}m</span>
            </div>
            <div className="flex justify-between items-center bg-[#080809] border border-zinc-800/50 px-3 py-2 rounded-lg">
              <span>SHORT BREAK</span>
              <span className="text-zinc-300">{settings.pomodoroShortBreak}m</span>
            </div>
            <div className="flex justify-between items-center bg-[#080809] border border-zinc-800/50 px-3 py-2 rounded-lg">
              <span>LONG BREAK</span>
              <span className="text-zinc-300">{settings.pomodoroLongBreak}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
