import React from 'react';
import { useStore } from '../../store/useStore';
import { FiUsers, FiCheckCircle, FiActivity } from 'react-icons/fi';

export const TeamMetrics: React.FC = () => {
  const { tasks, currentRole, activeWorkspaceId, workspaces } = useStore();

  if (activeWorkspaceId === 'personal') return null;

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  if (!activeWorkspace) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.columnId === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const memberCount = Object.keys(activeWorkspace.members || {}).length;

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-300 uppercase tracking-wider">
          <FiUsers className="w-5 h-5 text-blue-400" />
          <span>Team Workspace Metrics</span>
        </div>
        <div className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded uppercase tracking-wider font-semibold">
          Role: {currentRole}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center">
          <FiCheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-white">{completedTasks}/{totalTasks}</div>
          <div className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Tasks Completed</div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center">
          <FiActivity className="w-6 h-6 text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-white">{completionRate}%</div>
          <div className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Completion Rate</div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center">
          <FiUsers className="w-6 h-6 text-purple-400 mb-2" />
          <div className="text-2xl font-bold text-white">{memberCount}</div>
          <div className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Active Members</div>
        </div>
      </div>
    </div>
  );
};
