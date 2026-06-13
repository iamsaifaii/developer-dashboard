import React, { useState } from 'react';
import { FiUsers, FiMail, FiTrash2, FiUserMinus, FiMoreVertical } from 'react-icons/fi';
import { InviteMemberModal } from './InviteMemberModal';
import { deleteTeam, removeMember } from '../../services/teamService';
import { useStore } from '../../store/useStore';
import type { Team } from '../../types';

interface TeamCardProps {
  team: Team;
  isActive: boolean;
  onActivate: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, isActive, onActivate }) => {
  const { currentUser, setActiveWorkspace, activeWorkspace } = useStore();
  const [showInvite, setShowInvite] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isAdmin = team.createdBy === currentUser?.uid;

  const avatarColors = [
    'bg-indigo-900/60 text-indigo-300',
    'bg-violet-900/60 text-violet-300',
    'bg-blue-900/60 text-blue-300',
    'bg-emerald-900/60 text-emerald-300',
    'bg-amber-900/60 text-amber-300',
    'bg-pink-900/60 text-pink-300',
  ];

  const handleDelete = async () => {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    if (activeWorkspace === team.id) setActiveWorkspace('personal');
    await deleteTeam(team.id);
    setShowMenu(false);
  };

  const handleLeave = async () => {
    const me = team.members.find(m => m.uid === currentUser?.uid);
    if (!me) return;
    if (!confirm(`Leave team "${team.name}"?`)) return;
    await removeMember(team.id, me);
    if (activeWorkspace === team.id) setActiveWorkspace('personal');
    setShowMenu(false);
  };

  return (
    <>
      <div
        className={`group relative bg-[#0a0a0a] border rounded-2xl p-5 transition-all duration-200 cursor-pointer ${
          isActive
            ? 'border-indigo-700/70 ring-1 ring-indigo-700/20 shadow-[0_0_24px_rgba(79,70,229,0.12)]'
            : 'border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40'
        }`}
        onClick={onActivate}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-indigo-900/50 border border-indigo-700/50 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-400">Active</span>
          </div>
        )}

        {/* Menu button */}
        <button
          id={`team-menu-${team.id}`}
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg border border-transparent hover:border-zinc-700 hover:bg-zinc-900 flex items-center justify-center text-zinc-600 hover:text-zinc-300 cursor-pointer transition-colors"
          style={{ display: isActive ? 'none' : undefined }}
        >
          <FiMoreVertical className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown */}
        {showMenu && (
          <div className="absolute top-10 right-3 z-20 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
            <button
              onClick={(e) => { e.stopPropagation(); setShowInvite(true); setShowMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors"
            >
              <FiMail className="w-3.5 h-3.5" /> Invite Member
            </button>
            {isAdmin ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:bg-red-950/30 hover:text-red-300 cursor-pointer transition-colors"
              >
                <FiTrash2 className="w-3.5 h-3.5" /> Delete Team
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); handleLeave(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:bg-red-950/30 hover:text-red-300 cursor-pointer transition-colors"
              >
                <FiUserMinus className="w-3.5 h-3.5" /> Leave Team
              </button>
            )}
          </div>
        )}

        {/* Team header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/30 flex items-center justify-center shrink-0">
            <FiUsers className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{team.name}</h3>
            {team.description && (
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{team.description}</p>
            )}
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-1.5 py-0.5 rounded-full">
              {isAdmin ? '👑 Admin' : '🤝 Member'}
            </span>
          </div>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members.slice(0, 5).map((member, i) => (
              <div
                key={member.uid}
                title={member.displayName || member.email}
                className={`w-7 h-7 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold ${avatarColors[i % avatarColors.length]}`}
                style={{ zIndex: 5 - i }}
              >
                {member.photoURL ? (
                  <img src={member.photoURL} alt={member.displayName || ''} className="w-full h-full rounded-full object-cover" />
                ) : (
                  (member.displayName || member.email || '?')[0].toUpperCase()
                )}
              </div>
            ))}
            {team.members.length > 5 && (
              <div className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                +{team.members.length - 5}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-600">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
            <button
              id={`invite-btn-${team.id}`}
              onClick={(e) => { e.stopPropagation(); setShowInvite(true); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-700/30 hover:border-indigo-600/60 text-indigo-400 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
            >
              <FiMail className="w-3 h-3" /> Invite
            </button>
          </div>
        </div>

        {/* Pending invites indicator */}
        {team.invites.filter(i => i.status === 'pending').length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] text-amber-500/80">
              {team.invites.filter(i => i.status === 'pending').length} pending invite{team.invites.filter(i => i.status === 'pending').length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        team={team}
      />
    </>
  );
};
