import React, { useState } from 'react';
import { FiX, FiMail, FiLoader, FiSend, FiAlertTriangle } from 'react-icons/fi';
import { inviteMember } from '../../services/teamService';
import { useStore } from '../../store/useStore';
import type { Team } from '../../types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, team }) => {
  const { currentUser } = useStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) { setError('Please enter a valid email address.'); return; }
    if (team.members.some((m) => m.email === trimmed)) {
      setError('This person is already a member of this team.'); return;
    }
    if (team.invites.some((inv) => inv.email === trimmed && inv.status === 'pending')) {
      setError('An invite has already been sent to this address.'); return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await inviteMember(team.id, team.name, trimmed, {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
      });
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl p-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <FiMail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Invite to {team.name}</h2>
              <p className="text-[11px] text-zinc-500">They'll receive a magic link by email</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            id="invite-modal-close"
            className="w-8 h-8 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 cursor-pointer transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-center mx-auto mb-4">
              <FiSend className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-bold text-sm mb-2">Invitation Sent!</h3>
            <p className="text-zinc-500 text-xs leading-relaxed mb-6">
              A magic link email has been sent. When they click it, they'll be taken directly to DevFlow to log in and join <strong className="text-zinc-300">{team.name}</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSuccess(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-medium cursor-pointer transition-colors"
              >
                Invite Another
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  id="invite-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="colleague@company.com"
                  autoComplete="off"
                  className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors"
                />
              </div>
            </div>

            {/* How it works */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 flex gap-3">
              <FiSend className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                They'll receive an email with a magic link. Clicking it takes them directly to DevFlow — they log in and are instantly added to <strong>{team.name}</strong>.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-950/30 border border-red-900/50 rounded-lg">
                <FiAlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-red-400 text-xs">{error}</span>
              </div>
            )}

            {/* Current pending invites */}
            {team.invites.filter(i => i.status === 'pending').length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Pending Invites</p>
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {team.invites.filter(i => i.status === 'pending').map(inv => (
                    <div key={inv.email} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-400">
                        {inv.email[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-zinc-400 flex-1 truncate">{inv.email}</span>
                      <span className="text-[10px] text-amber-500 font-medium">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                id="invite-submit-btn"
                type="submit"
                disabled={isLoading || !email.trim()}
                className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
                {isLoading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
