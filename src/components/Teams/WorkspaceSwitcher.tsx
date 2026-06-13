import React, { useState } from 'react';
import { FiChevronDown, FiUser, FiUsers, FiCheck } from 'react-icons/fi';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

interface WorkspaceSwitcherProps {
  isCollapsed?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ isCollapsed }) => {
  const { teams, activeWorkspace, setActiveWorkspace } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const activeTeam = teams.find(t => t.id === activeWorkspace);
  const label = activeWorkspace === 'personal' ? 'Personal' : (activeTeam?.name ?? 'Team');

  if (isCollapsed) {
    return (
      <button
        id="workspace-switcher-collapsed"
        onClick={() => { setIsOpen(!isOpen); }}
        title={`Workspace: ${label}`}
        className="w-10 h-10 rounded-xl border border-zinc-800 bg-black flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer transition-colors relative"
      >
        {activeWorkspace === 'personal' ? (
          <FiUser className="w-4 h-4" />
        ) : (
          <FiUsers className="w-4 h-4 text-white" />
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        id="workspace-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-black hover:bg-zinc-900/50 cursor-pointer transition-all group"
      >
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
          activeWorkspace === 'personal'
            ? 'bg-zinc-800'
            : 'bg-zinc-900 border border-zinc-800'
        }`}>
          {activeWorkspace === 'personal'
            ? <FiUser className="w-3.5 h-3.5 text-zinc-400" />
            : <FiUsers className="w-3.5 h-3.5 text-white" />
          }
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-0.5">Workspace</p>
          <p className="text-xs font-bold text-white truncate">{label}</p>
        </div>
        <FiChevronDown className={`w-3.5 h-3.5 text-zinc-600 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Personal */}
            <button
              id="workspace-personal-btn"
              onClick={() => { setActiveWorkspace('personal'); setIsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                <FiUser className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold text-white">Personal</p>
                <p className="text-[10px] text-zinc-500">Your private workspace</p>
              </div>
              {activeWorkspace === 'personal' && <FiCheck className="w-3.5 h-3.5 text-white shrink-0" />}
            </button>

            {teams.length > 0 && (
              <div className="border-t border-zinc-800">
                <p className="px-3 py-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Teams</p>
                {teams.map(team => (
                  <button
                    key={team.id}
                    id={`workspace-team-${team.id}`}
                    onClick={() => { setActiveWorkspace(team.id); setIsOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-zinc-800 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <FiUsers className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-bold text-white truncate">{team.name}</p>
                      <p className="text-[10px] text-zinc-500">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</p>
                    </div>
                    {activeWorkspace === team.id && <FiCheck className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-zinc-800 p-2">
              <button
                id="manage-teams-btn"
                onClick={() => { navigate('/teams'); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <FiUsers className="w-3 h-3" />
                Manage Teams
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
