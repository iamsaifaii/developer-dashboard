import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiX, 
  FiFileText, 
  FiCalendar,
  FiArrowRight,
  FiClock,
  FiSettings
} from 'react-icons/fi';
import { TrelloIcon, GithubIcon } from '../BrandIcons';

export const GlobalSearch: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { tasks, notes, events, githubRepos, settings, updateSettings, timerStatus, setTimerStatus } = useStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        // Add slight delay to allow rendering before focus
        setTimeout(() => document.getElementById('global-search-input')?.focus(), 10);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter results
  const q = debouncedQuery.toLowerCase().trim();
  
  const matchedTasks = q ? tasks.filter(t => 
    t.title.toLowerCase().includes(q) || 
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q))
  ).slice(0, 5) : [];

  const matchedNotes = q ? notes.filter(n => 
    n.title.toLowerCase().includes(q) || 
    n.content.toLowerCase().includes(q) ||
    n.tags.some(tag => tag.toLowerCase().includes(q))
  ).slice(0, 5) : [];

  const matchedEvents = q ? events.filter(e => 
    e.title.toLowerCase().includes(q) || 
    e.description.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedRepos = q ? githubRepos.filter(r => 
    r.name.toLowerCase().includes(q) || 
    (r.description && r.description.toLowerCase().includes(q))
  ).slice(0, 3) : [];

  const hasResults = q && (matchedTasks.length > 0 || matchedNotes.length > 0 || matchedEvents.length > 0 || matchedRepos.length > 0);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  const executeAction = (action: string) => {
    setIsOpen(false);
    setQuery('');
    switch (action) {
      case 'create_task':
        // Dispatching a custom event to open the Quick Task Modal
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
        break;
      case 'create_note':
        navigate('/notes');
        break;
      case 'create_event':
        navigate('/calendar');
        break;
      case 'toggle_pomodoro':
        setTimerStatus(timerStatus === 'running' ? 'paused' : 'running');
        break;
      case 'toggle_theme':
        updateSettings({ themeMode: settings.themeMode === 'dark' ? 'glass' : 'dark' });
        break;
      case 'open_goals':
        navigate('/goals');
        break;
    }
  };

  const actionResults = [
    { id: 'create_task', label: 'Create New Task', icon: FiFileText, keywords: ['create', 'new', 'task', 'todo'] },
    { id: 'create_note', label: 'Create New Note', icon: FiFileText, keywords: ['create', 'new', 'note', 'document'] },
    { id: 'create_event', label: 'Create Event', icon: FiCalendar, keywords: ['create', 'new', 'event', 'calendar', 'meeting'] },
    { id: 'toggle_pomodoro', label: timerStatus === 'running' ? 'Pause Pomodoro' : 'Start Pomodoro', icon: FiClock, keywords: ['pomodoro', 'timer', 'focus', 'start', 'pause'] },
    { id: 'toggle_theme', label: 'Toggle Dark Theme', icon: FiSettings, keywords: ['theme', 'dark', 'light', 'mode', 'toggle'] },
    { id: 'open_goals', label: 'View Goals & Habits', icon: FiArrowRight, keywords: ['goals', 'habits', 'streak', 'progress'] }
  ].filter(a => q.startsWith('>') || a.keywords.some(k => k.includes(q.replace('>', '').trim()) || q.replace('>', '').trim().includes(k)));

  const isCommandMode = q.startsWith('>');

  return (
    <>
      {/* Desktop / Mobile trigger */}
      {isMobile ? (
        <>
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <FiSearch className="w-5 h-5" />
          </button>
          {isOpen && (
            <div className="fixed inset-0 pt-16 px-4 pb-4 bg-neutral-900/95 backdrop-blur-sm z-50 flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 flex items-center">
                  <FiSearch className="w-4 h-4 text-zinc-400 absolute left-3" />
                  <input 
                    type="text" 
                    placeholder="Search workspace..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full text-sm pl-9 pr-3 py-3 rounded-xl bg-black border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors shadow-lg"
                    autoFocus
                  />
                  {query && (
                    <button 
                      onClick={() => setQuery('')}
                      className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-300"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-200 font-bold text-xs bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
              </div>

              {q ? (
                <div className="overflow-y-auto flex-1 p-2 space-y-4 bg-black rounded-xl border border-zinc-800 shadow-xl">
                  {!hasResults ? (
                    <div className="p-6 text-center text-zinc-400 text-xs">
                      No results found for "{debouncedQuery}"
                    </div>
                  ) : (
                    <>
                      {/* Tasks */}
                      {!isCommandMode && matchedTasks.length > 0 && (
                        <div>
                          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <TrelloIcon className="w-3 h-3" />
                            <span>Tasks</span>
                          </div>
                          <div className="space-y-0.5">
                            {matchedTasks.map(t => (
                              <button
                                key={t.id}
                                onClick={() => handleNavigate('/kanban')}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 flex items-center justify-between group transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-zinc-200 font-medium truncate">{t.title}</div>
                                  <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                                    <span className="uppercase">{t.priority}</span>
                                    <span>·</span>
                                    <span>{t.tags.slice(0,2).join(', ')}</span>
                                  </div>
                                </div>
                                <FiArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {!isCommandMode && matchedNotes.length > 0 && (
                        <div>
                          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <FiFileText className="w-3 h-3" />
                            <span>Notes</span>
                          </div>
                          <div className="space-y-0.5">
                            {matchedNotes.map(n => (
                              <button
                                key={n.id}
                                onClick={() => handleNavigate('/notes')}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 flex items-center justify-between group transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-zinc-200 font-medium truncate">{n.title || 'Untitled Note'}</div>
                                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                    {n.folder} folder
                                  </div>
                                </div>
                                <FiArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Events */}
                      {!isCommandMode && matchedEvents.length > 0 && (
                        <div>
                          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <FiCalendar className="w-3 h-3" />
                            <span>Events</span>
                          </div>
                          <div className="space-y-0.5">
                            {matchedEvents.map(e => (
                              <button
                                key={e.id}
                                onClick={() => handleNavigate('/calendar')}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 flex items-center justify-between group transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-zinc-200 font-medium truncate">{e.title}</div>
                                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                    {e.start}
                                  </div>
                                </div>
                                <FiArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Repos */}
                      {!isCommandMode && matchedRepos.length > 0 && (
                        <div>
                          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <GithubIcon className="w-3 h-3" />
                            <span>GitHub</span>
                          </div>
                          <div className="space-y-0.5">
                            {matchedRepos.map(r => (
                              <button
                                key={r.name}
                                onClick={() => handleNavigate('/github')}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 flex items-center justify-between group transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-zinc-200 font-medium truncate">{r.name}</div>
                                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                    {r.stars} stars · {r.forks} forks
                                  </div>
                                </div>
                                <FiArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-black rounded-xl border border-zinc-800 shadow-xl flex-1">
                  <div className="text-xs font-semibold text-zinc-400 mb-3 px-2">Suggestions</div>
                  <div className="flex flex-wrap gap-2 px-2">
                    <button onClick={() => setQuery('urgent')} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium hover:bg-zinc-700">#urgent</button>
                    <button onClick={() => setQuery('bug')} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium hover:bg-zinc-700">bug</button>
                    <button onClick={() => setQuery('meeting')} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium hover:bg-zinc-700">meeting</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="relative w-full max-w-sm hidden md:block" ref={dropdownRef}>
          <div 
            className="relative flex items-center"
            onClick={() => setIsOpen(true)}
          >
            <FiSearch className="w-4 h-4 text-zinc-400 absolute left-3" />
            <input 
              id="global-search-input"
              type="text" 
              placeholder="Search workspace... (Cmd+K)" 
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg bg-black border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            {query && (
              <button 
                onClick={(e) => { e.stopPropagation(); setQuery(''); }}
                className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-300"
              >
                <FiX className="w-3 h-3" />
              </button>
            )}
          </div>
          
          {isOpen && (
            <div className="absolute top-full mt-2 w-full w-[400px] right-0 md:left-0 bg-neutral-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[70vh]">
              {q ? (
                <div className="overflow-y-auto flex-1 p-2 space-y-4">
                  {!hasResults && actionResults.length === 0 ? (
                    <div className="p-6 text-center text-zinc-400 text-xs">
                      No results found for "{debouncedQuery}"
                    </div>
                  ) : (
                    <>
                      {/* Actions */}
                      {actionResults.length > 0 && (
                        <div>
                          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <span>Actions</span>
                          </div>
                          <div className="space-y-0.5">
                            {actionResults.map(a => {
                              const Icon = a.icon;
                              return (
                                <button
                                  key={a.id}
                                  onClick={() => executeAction(a.id)}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 flex items-center justify-between group transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-zinc-400" />
                                    <div className="text-xs text-zinc-200 font-medium">{a.label}</div>
                                  </div>
                                  <span className="text-[9px] text-zinc-600 uppercase border border-zinc-700 px-1.5 py-0.5 rounded">Action</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tasks */}
                      {!isCommandMode && matchedTasks.length > 0 && (
                        <div>
                          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <TrelloIcon className="w-3 h-3" />
                            <span>Tasks</span>
                          </div>
                          <div className="space-y-0.5">
                            {matchedTasks.map(t => (
                              <button
                                key={t.id}
                                onClick={() => handleNavigate('/kanban')}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 flex items-center justify-between group transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-zinc-200 font-medium truncate">{t.title}</div>
                                  <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                                    <span className="uppercase">{t.priority}</span>
                                    <span>·</span>
                                    <span>{t.tags.slice(0,2).join(', ')}</span>
                                  </div>
                                </div>
                                <FiArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {!isCommandMode && matchedNotes.length > 0 && (
                        <div>
                          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <FiFileText className="w-3 h-3" />
                            <span>Notes</span>
                          </div>
                          <div className="space-y-0.5">
                            {matchedNotes.map(n => (
                              <button
                                key={n.id}
                                onClick={() => handleNavigate('/notes')}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 flex items-center justify-between group transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-zinc-200 font-medium truncate">{n.title || 'Untitled Note'}</div>
                                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                    {n.folder} folder
                                  </div>
                                </div>
                                <FiArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Events */}
                      {!isCommandMode && matchedEvents.length > 0 && (
                        <div>
                          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <FiCalendar className="w-3 h-3" />
                            <span>Events</span>
                          </div>
                          <div className="space-y-0.5">
                            {matchedEvents.map(e => (
                              <button
                                key={e.id}
                                onClick={() => handleNavigate('/calendar')}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 flex items-center justify-between group transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-zinc-200 font-medium truncate">{e.title}</div>
                                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                    {e.start}
                                  </div>
                                </div>
                                <FiArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Repos */}
                      {!isCommandMode && matchedRepos.length > 0 && (
                        <div>
                          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <GithubIcon className="w-3 h-3" />
                            <span>GitHub</span>
                          </div>
                          <div className="space-y-0.5">
                            {matchedRepos.map(r => (
                              <button
                                key={r.name}
                                onClick={() => handleNavigate('/github')}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 flex items-center justify-between group transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-zinc-200 font-medium truncate">{r.name}</div>
                                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                                    {r.stars} stars · {r.forks} forks
                                  </div>
                                </div>
                                <FiArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <div className="text-xs font-semibold text-zinc-400 mb-3 px-2">Suggestions</div>
                  <div className="flex flex-wrap gap-2 px-2">
                    <button onClick={() => setQuery('urgent')} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium hover:bg-zinc-700">#urgent</button>
                    <button onClick={() => setQuery('bug')} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium hover:bg-zinc-700">bug</button>
                    <button onClick={() => setQuery('meeting')} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium hover:bg-zinc-700">meeting</button>
                  </div>
                </div>
              )}
              
              {/* Footer */}
              <div className="bg-black border-t border-zinc-800 p-2 text-[10px] text-zinc-400 flex items-center justify-between">
                <span>Press <kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">Esc</kbd> to close</span>
                <span>Search everywhere</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
