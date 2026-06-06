import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const GlobalShortcuts: React.FC<{ onQuickTask: () => void }> = ({ onQuickTask }) => {
  const navigate = useNavigate();
  const { timerStatus, setTimerStatus, updateSettings, settings } = useStore();
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contenteditable
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Ignore if modifier keys are pressed (except Shift for ? )
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case 'c':
        case 't':
          e.preventDefault();
          onQuickTask();
          break;
        case 'n':
          e.preventDefault();
          navigate('/notes');
          break;
        case 'e':
          e.preventDefault();
          navigate('/calendar');
          break;
        case 'p':
          e.preventDefault();
          if (timerStatus === 'running') {
            setTimerStatus('paused');
          } else {
            setTimerStatus('running');
          }
          break;
        case 'd':
          e.preventDefault();
          updateSettings({ themeMode: settings.themeMode === 'dark' ? 'glass' : 'dark' });
          break;
        case '?':
          e.preventDefault();
          setShowCheatSheet(true);
          break;
        case 'Escape':
          setShowCheatSheet(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onQuickTask, timerStatus, setTimerStatus, settings.themeMode, updateSettings]);

  if (!showCheatSheet) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheatSheet(false)} />
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 relative z-10 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-white mb-4">Keyboard Shortcuts</h2>
        
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Navigation & Actions</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Quick Task</span>
                <kbd className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-neutral-300 text-xs">c</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Open Notes</span>
                <kbd className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-neutral-300 text-xs">n</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Open Calendar</span>
                <kbd className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-neutral-300 text-xs">e</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Toggle Pomodoro</span>
                <kbd className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-neutral-300 text-xs">p</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Toggle Dark Theme</span>
                <kbd className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-neutral-300 text-xs">d</kbd>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Global</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Command Palette</span>
                <kbd className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-neutral-300 text-xs">Cmd/Ctrl + K</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Cheat Sheet</span>
                <kbd className="bg-neutral-800 border border-neutral-700 px-2 py-1 rounded text-neutral-300 text-xs">?</kbd>
              </div>
            </div>
          </section>
        </div>
        
        <button 
          onClick={() => setShowCheatSheet(false)}
          className="mt-6 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
