import React from 'react';
import { useStore } from '../store/useStore';
import { FiSun, FiMoon } from 'react-icons/fi';

export const ThemeToggle: React.FC = () => {
  const { settings, updateSettings } = useStore();

  const toggleTheme = () => {
    updateSettings({
      colorScheme: settings.colorScheme === 'dark' ? 'light' : 'dark'
    });
  };

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${settings.colorScheme === 'dark' ? 'Light' : 'Dark'} Mode`}
      className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-200 bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-800 rounded-lg cursor-pointer"
    >
      {settings.colorScheme === 'dark' ? (
        <FiSun className="w-4.5 h-4.5" />
      ) : (
        <FiMoon className="w-4.5 h-4.5" />
      )}
    </button>
  );
};
