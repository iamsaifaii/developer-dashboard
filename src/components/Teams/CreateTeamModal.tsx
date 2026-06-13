import React, { useState } from 'react';
import { FiX, FiUsers, FiLoader } from 'react-icons/fi';
import { createTeam } from '../../services/teamService';
import { useStore } from '../../store/useStore';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { currentUser } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!name.trim()) { setError('Team name is required.'); return; }

    setIsLoading(true);
    setError(null);
    try {
      await createTeam(name.trim(), description.trim(), {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      });
      setName('');
      setDescription('');
      onCreated?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create team.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl p-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <FiUsers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Create a Team</h2>
              <p className="text-[11px] text-zinc-500">Set up a new collaborative workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="create-team-modal-close"
            className="w-8 h-8 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 cursor-pointer transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
              Team Name *
            </label>
            <input
              id="create-team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frontend Squad"
              maxLength={60}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
              Description
            </label>
            <textarea
              id="create-team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this team work on?"
              rows={3}
              maxLength={200}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-950/30 border border-red-900/50 rounded-lg">
              <span className="text-red-400 text-xs">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              id="create-team-submit"
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
