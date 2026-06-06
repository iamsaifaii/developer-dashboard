import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { FiX, FiCheck, FiUsers, FiPlus, FiSend } from 'react-icons/fi';
import type { WorkspaceRole } from '../../types';

interface WorkspaceManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ isOpen, onClose }) => {
  const { workspaces, activeWorkspaceId, switchWorkspace, createWorkspace, inviteMember, currentRole } = useStore();
  
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('editor');
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    setIsCreating(true);
    try {
      await createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
    } catch (error) {
      console.error('Failed to create workspace', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await inviteMember(inviteEmail.trim(), inviteRole);
      setInviteSuccess(true);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to invite member', error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Box */}
      <div className="w-[calc(100%-2rem)] max-w-md mx-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-blue-500" />
            Workspaces
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Switch Workspaces */}
          <section>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Your Workspaces</h3>
            <div className="space-y-2">
              <button
                onClick={() => switchWorkspace('personal')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                  activeWorkspaceId === 'personal'
                    ? 'bg-blue-500/10 border-blue-500/50 text-white'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold">
                    P
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">Personal Workspace</span>
                    <span className="text-[10px] text-neutral-500">Only you</span>
                  </div>
                </div>
                {activeWorkspaceId === 'personal' && <FiCheck className="w-5 h-5 text-blue-400" />}
              </button>

              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => switchWorkspace(ws.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                    activeWorkspaceId === ws.id
                      ? 'bg-blue-500/10 border-blue-500/50 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold uppercase border border-indigo-500/30">
                      {ws.name.substring(0, 2)}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold">{ws.name}</span>
                      <span className="text-[10px] text-neutral-500">{ws.members.length} member(s)</span>
                    </div>
                  </div>
                  {activeWorkspaceId === ws.id && <FiCheck className="w-5 h-5 text-blue-400" />}
                </button>
              ))}
            </div>
          </section>

          {/* Create Workspace */}
          <section className="pt-4 border-t border-neutral-800/80">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Create New</h3>
            <form onSubmit={handleCreateWorkspace} className="flex gap-2">
              <input
                type="text"
                placeholder="Workspace name..."
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="flex-1 bg-neutral-800 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newWorkspaceName.trim() || isCreating}
                className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
              >
                <FiPlus className="w-4 h-4" />
                Create
              </button>
            </form>
          </section>

          {/* Invite Members (Only if active is not personal and user is admin) */}
          {activeWorkspaceId !== 'personal' && currentRole === 'admin' && (
            <section className="pt-4 border-t border-neutral-800/80">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Invite Member</h3>
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email address..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                    className="bg-neutral-800 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!inviteEmail.trim() || isInviting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <FiSend className="w-4 h-4" />
                  {isInviting ? 'Sending...' : 'Send Invite'}
                </button>
                {inviteSuccess && (
                  <p className="text-xs text-green-400 text-center">Invite sent successfully!</p>
                )}
              </form>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
