import React, { useState } from 'react';
import { FiUsers, FiPlus, FiUserCheck } from 'react-icons/fi';
import { useStore } from '../../store/useStore';
import { CreateTeamModal } from './CreateTeamModal';
import { TeamCard } from './TeamCard';

export const TeamsPage: React.FC = () => {
  const { teams, activeWorkspace, setActiveWorkspace } = useStore();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Teams</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your collaborative workspaces</p>
        </div>
        <button
          id="create-team-btn"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl cursor-pointer transition-colors shadow-lg shadow-black/30"
        >
          <FiPlus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        /* Empty state — mirrors the screenshot style */
        <div className="flex flex-col items-center justify-center text-center py-20">
          {/* Hero illustration */}
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl shadow-black/50">
              <FiUsers className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm shadow-lg text-white">
              ⚡
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Align teams and visualize their work!
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mb-8">
            Use Teams to coordinate work, organize priorities, and understand the details. Create a team and start collaborating in real-time.
          </p>

          <div className="flex items-center gap-3">
            <button
              id="create-team-hero-btn"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl cursor-pointer transition-colors shadow-lg shadow-black/40 text-sm"
            >
              <FiPlus className="w-4 h-4" />
              Create Team
            </button>
          </div>

          {/* Feature cards (decorative, like screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-2xl">
            {[
              { icon: '👥', title: 'Teams Hub', desc: 'A central hub providing an overview of all activity and your team workspace.' },
              { icon: '📩', title: 'Email Invites', desc: 'Invite members by email. They click a magic link and join instantly.' },
              { icon: '🤝', title: 'Real-time Collab', desc: 'Work together simultaneously on tasks, notes, and calendars.' },
            ].map((f) => (
              <div key={f.title} className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-5 text-left">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Active workspace strip */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
            <FiUserCheck className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-zinc-400">Active workspace: </span>
              <span className="text-xs font-bold text-white">
                {activeWorkspace === 'personal'
                  ? 'Personal'
                  : teams.find(t => t.id === activeWorkspace)?.name || 'Unknown'}
              </span>
            </div>
            {activeWorkspace !== 'personal' && (
              <button
                onClick={() => setActiveWorkspace('personal')}
                className="text-[11px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                Switch to Personal
              </button>
            )}
          </div>

          {/* Teams grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isActive={activeWorkspace === team.id}
                onActivate={() => setActiveWorkspace(team.id)}
              />
            ))}
          </div>
        </div>
      )}

      <CreateTeamModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
};
