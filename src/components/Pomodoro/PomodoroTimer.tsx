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
  const radius = 120;
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
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-left">
      
      {/* Timer Display Panel */}
      <div className="md:col-span-2 glass-panel rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        
        {/* Chime sound test shortcut */}
        <button 
          onClick={handleTestChime}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs transition-colors"
          title="Test audio chime"
        >
          <FiVolume2 className="w-3.5 h-3.5" />
          <span>Test Sound</span>
        </button>

        {/* Mode Selector Header */}
        <div className="flex gap-2.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 mb-8 z-10">
          {(['work', 'shortBreak', 'longBreak'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimerMode(mode)}
              className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                timerMode === mode
                  ? 'bg-zinc-850 text-white shadow-sm'
                  : 'text-zinc-550 hover:text-zinc-250'
              }`}
            >
              {mode === 'work' ? 'Focus Mode' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </button>
          ))}
        </div>

        {/* Circular SVG Timer */}
        <div className="relative w-72 h-72 flex items-center justify-center z-10 mb-8 select-none">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              className="stroke-zinc-900 fill-none"
              strokeWidth="8"
            />
            {/* Progress track */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              className="fill-none transition-all duration-300"
              stroke={currentModeInfo.color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits & icon overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              key={timerMode}
              className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase mb-1"
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

            <span className="text-5xl font-extrabold tracking-tight text-white tabular-nums">
              {formatTime(secondsLeft)}
            </span>

            <span className="text-[10px] text-zinc-550 mt-1 tracking-wider uppercase">
              {timerStatus === 'running' ? 'Focusing' : timerStatus === 'paused' ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Timer Control Panel */}
        <div className="flex items-center gap-5 z-10">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-full glass-panel-interactive text-zinc-400 hover:text-white cursor-pointer shadow-lg"
            title="Reset timer"
          >
            <FiRotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTimerStatus(timerStatus === 'running' ? 'paused' : 'running')}
            className="p-5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer shadow-xl transition-colors"
            title={timerStatus === 'running' ? 'Pause focus session' : 'Start focus session'}
          >
            {timerStatus === 'running' ? (
              <FiPause className="w-7 h-7 fill-zinc-950 stroke-none" />
            ) : (
              <FiPlay className="w-7 h-7 fill-zinc-950 stroke-none translate-x-0.5" />
            )}
          </button>

          <button
            onClick={handleSkip}
            className="p-3.5 rounded-full glass-panel-interactive text-zinc-400 hover:text-white cursor-pointer shadow-lg"
            title="Skip current session"
          >
            <FiSkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Productivity Stats Sidebar */}
      <div className="space-y-6 md:col-span-1">
        {/* Completed Cards */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Focus Sessions</p>
              <h3 className="text-3xl font-extrabold text-white mt-1.5">{totalSessionsCompleted}</h3>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <FiAward className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
            You completed <span className="text-zinc-200 font-bold">{totalSessionsCompleted}</span> sessions of focus today. That equals <span className="text-zinc-200 font-bold">{totalSessionsCompleted * settings.pomodoroWorkTime} minutes</span> of deep work.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl relative">
          <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
            <FiStar className="w-4 h-4" />
            <span>Developer Tip</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-light">
            "Studies show that developers work best in focused sprints. Use the Pomodoro timer to block out email, Slack, and pull request reviews, letting your brain dive deep into complex state logic and algorithms."
          </p>
          <div className="h-px bg-zinc-800 my-4" />
          <div className="space-y-2 text-xxs text-zinc-500">
            <div className="flex justify-between">
              <span>WORK STATE:</span>
              <span className="text-zinc-300">{settings.pomodoroWorkTime}m</span>
            </div>
            <div className="flex justify-between">
              <span>SHORT BREAK:</span>
              <span className="text-zinc-300">{settings.pomodoroShortBreak}m</span>
            </div>
            <div className="flex justify-between">
              <span>LONG BREAK:</span>
              <span className="text-zinc-300">{settings.pomodoroLongBreak}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
