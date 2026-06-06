import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { workspaceService } from '../../services/workspaceService';
import { FiUsers, FiMail, FiUserPlus, FiCheck } from 'react-icons/fi';
import type { WorkspaceRole, Workspace } from '../../types';

export const TeamSettingsPanel: React.FC = () => {
  const { currentUser, activeWorkspaceId, currentRole, workspaces, setWorkspaces } = useStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('viewer');
  const [loading, setLoading] = useState(false);
  const [pendingInvitesForMe, setPendingInvitesForMe] = useState<Workspace[]>([]);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  useEffect(() => {
    if (currentUser?.email) {
      workspaceService.fetchPendingInvites(currentUser.email).then(setPendingInvitesForMe);
    }
  }, [currentUser]);

  const handleInvite = async () => {
    if (!inviteEmail || !activeWorkspaceId || activeWorkspaceId === 'personal') return;
    setLoading(true);
    try {
      await workspaceService.inviteUser(activeWorkspaceId, inviteEmail, inviteRole);
      setInviteEmail('');
      // Optimistically add to activeWorkspace (though we should ideally re-fetch)
      const updated = await workspaceService.fetchUserWorkspaces(currentUser!.uid);
      setWorkspaces(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (wsId: string) => {
    if (!currentUser?.uid || !currentUser?.email) return;
    setLoading(true);
    try {
      await workspaceService.acceptInvite(wsId, currentUser.uid, currentUser.email);
      setPendingInvitesForMe(prev => prev.filter(w => w.id !== wsId));
      const updated = await workspaceService.fetchUserWorkspaces(currentUser.uid);
      setWorkspaces(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pending Invites to Join Teams */}
      {pendingInvitesForMe.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
            <FiMail className="w-4 h-4 text-emerald-400" />
            Pending Team Invites
          </h3>
          <div className="space-y-2">
            {pendingInvitesForMe.map(ws => (
              <div key={ws.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-emerald-500/20 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-white">{ws.name}</div>
                  <div className="text-xs text-zinc-400">Invited to join as {ws.pendingInvites[currentUser!.email!]}</div>
                </div>
                <button
                  onClick={() => handleAcceptInvite(ws.id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-emerald-500 text-black text-xs font-semibold rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <FiCheck className="w-3 h-3" />
                  Accept Invite
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Workspace Settings */}
      <section>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-blue-400" />
          Active Team Settings
        </h3>
        
        {activeWorkspaceId === 'personal' ? (
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-sm text-zinc-400">
            You are currently in your Personal Workspace. Create or switch to a Team Workspace to invite members.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Invite New Member */}
            {currentRole === 'admin' && (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-zinc-300">Invite new member</div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email address..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail || loading}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    Invite
                  </button>
                </div>
              </div>
            )}

            {/* Current Members */}
            <div>
              <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Members</div>
              <div className="space-y-2">
                {activeWorkspace && Object.values(activeWorkspace.members).map(member => (
                  <div key={member.uid} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs uppercase">
                        {member.email.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200">{member.email}</div>
                        <div className="text-[10px] text-zinc-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded uppercase tracking-wider font-semibold">
                      {member.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invites for this Workspace */}
            {activeWorkspace?.pendingInvites && Object.keys(activeWorkspace.pendingInvites).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Pending Invites</div>
                <div className="space-y-2">
                  {Object.entries(activeWorkspace.pendingInvites).map(([email, role]) => (
                    <div key={email} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-dashed border-zinc-600 flex items-center justify-center text-zinc-500">
                          <FiMail className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-300">{email}</div>
                          <div className="text-[10px] text-zinc-500">Invited as {role}</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded uppercase tracking-wider">
                        Pending
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
