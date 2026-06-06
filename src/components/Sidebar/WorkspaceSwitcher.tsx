import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiPlus, FiUsers, FiUser, FiCheck, FiX, FiMail } from 'react-icons/fi';
import type { Workspace } from '../../types';
import { useStore } from '../../store/useStore';
import { workspaceService } from '../../services/workspaceService';

export const WorkspaceSwitcher: React.FC = () => {
  const { 
    currentUser, 
    activeWorkspaceId, 
    setActiveWorkspaceId, 
    workspaces, 
    setWorkspaces,
    addNotification
  } = useStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [pendingInvites, setPendingInvites] = useState<Workspace[]>([]);

  const fetchAllWorkspaces = async () => {
    if (currentUser?.uid && currentUser?.email) {
      const wss = await workspaceService.fetchUserWorkspaces(currentUser.uid);
      setWorkspaces(wss);
      const invites = await workspaceService.fetchPendingInvites(currentUser.email);
      setPendingInvites(invites);
    }
  };

  // Fetch workspaces on mount
  useEffect(() => {
    fetchAllWorkspaces();
  }, [currentUser, setWorkspaces]);

  const handleCreate = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newWorkspaceName.trim()) return;
    if (!currentUser) {
      addNotification({ title: 'Error', message: 'You must be logged in to create a workspace.', category: 'system' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await workspaceService.createWorkspace(newWorkspaceName, currentUser.uid, currentUser.email!);
      setNewWorkspaceName('');
      setIsCreating(false);
      // Refresh list
      await fetchAllWorkspaces();
      addNotification({ title: 'Success', message: 'Workspace created', category: 'system' });
    } catch (e: any) {
      console.error('Error creating workspace:', e);
      addNotification({ title: 'Error', message: e.message || String(e), category: 'system' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInvite = async (e: React.MouseEvent, wsId: string) => {
    e.stopPropagation();
    if (!currentUser?.email) return;
    try {
      await workspaceService.acceptInvite(wsId, currentUser.uid, currentUser.email);
      addNotification({ title: 'Joined Workspace', message: 'You have joined the workspace.', category: 'system' });
      await fetchAllWorkspaces();
    } catch (err: any) {
      addNotification({ title: 'Error', message: err.message, category: 'system' });
    }
  };

  const handleDeclineInvite = async (e: React.MouseEvent, wsId: string) => {
    e.stopPropagation();
    if (!currentUser?.email) return;
    try {
      await workspaceService.declineInvite(wsId, currentUser.email);
      addNotification({ title: 'Invite Declined', message: 'You declined the invitation.', category: 'system' });
      await fetchAllWorkspaces();
    } catch (err: any) {
      addNotification({ title: 'Error', message: err.message, category: 'system' });
    }
  };

  const activeName = activeWorkspaceId === 'personal' 
    ? 'Personal Workspace' 
    : workspaces.find(w => w.id === activeWorkspaceId)?.name || 'Unknown Workspace';

  return (
    <div className="relative mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {activeWorkspaceId === 'personal' ? (
            <FiUser className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <FiUsers className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span className="text-sm font-medium text-zinc-200 truncate">{activeName}</span>
        </div>
        <FiChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-1">
            <button
              onClick={() => { setActiveWorkspaceId('personal'); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${activeWorkspaceId === 'personal' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300 hover:bg-zinc-800'}`}
            >
              <FiUser className="w-4 h-4" />
              Personal Workspace
            </button>
            
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => { setActiveWorkspaceId(ws.id); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${activeWorkspaceId === ws.id ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-300 hover:bg-zinc-800'}`}
              >
                <FiUsers className="w-4 h-4" />
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
          </div>

          {pendingInvites.length > 0 && (
            <div className="border-t border-zinc-800 p-1">
              <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Pending Invites
              </div>
              {pendingInvites.map(ws => (
                <div key={`invite-${ws.id}`} className="px-3 py-2 flex items-center justify-between text-sm hover:bg-zinc-800 rounded">
                  <div className="flex items-center gap-2 text-zinc-300 truncate">
                    <FiMail className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleAcceptInvite(e, ws.id)}
                      className="p-1 text-emerald-400 hover:bg-emerald-400/20 rounded"
                      title="Accept"
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeclineInvite(e, ws.id)}
                      className="p-1 text-rose-400 hover:bg-rose-400/20 rounded"
                      title="Decline"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t border-zinc-800 p-2">
            {isCreating ? (
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={newWorkspaceName}
                  onChange={e => setNewWorkspaceName(e.target.value)}
                  placeholder="Team Name..."
                  className="w-full text-xs px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 outline-none"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleCreate(e)}
                />
                <div className="flex gap-2">
                  <button onClick={handleCreate} disabled={isSubmitting} className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-bold py-1 rounded transition-colors">
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                  <button onClick={() => setIsCreating(false)} disabled={isSubmitting} className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs py-1 rounded transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              >
                <FiPlus className="w-3 h-3" />
                New Team
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
