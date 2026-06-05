import React, { useState } from 'react';
import { auth } from '../../lib/firebase';
import { linkGitHub, linkGoogle, unlinkProvider, updateDisplayName } from '../../lib/auth';
import { useStore } from '../../store/useStore';
import {
  FiMail, FiLogOut, FiLink, FiLink2,
  FiCheck, FiAlertTriangle, FiEdit2, FiX, FiTrash2
} from 'react-icons/fi';
import { GithubIcon } from '../BrandIcons';

// Inline Google "G" icon — no extra dep
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export const UserProfilePanel: React.FC = () => {
  const { currentUser, linkedProviders, setLinkedProviders, githubToken, setGithubToken } = useStore();
  const storeSignOut = useStore(s => s.signOut);
  const firebaseUser = auth.currentUser;

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.displayName || '');
  const [toast, setToast] = useState<Toast | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasGitHub = linkedProviders.includes('github.com');
  const hasGoogle = linkedProviders.includes('google.com');

  function showToast(type: Toast['type'], message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleUpdateName() {
    if (!firebaseUser || !nameInput.trim()) return;
    setLoadingAction('name');
    const result = await updateDisplayName(firebaseUser, nameInput.trim());
    setLoadingAction(null);
    if (result.ok) {
      showToast('success', 'Display name updated.');
      setEditingName(false);
    } else {
      showToast('error', result.message || 'Failed to update name.');
    }
  }

  async function handleLinkGitHub() {
    if (!firebaseUser) return;
    setLoadingAction('link-github');
    const result = await linkGitHub(firebaseUser);
    setLoadingAction(null);
    if (result.ok) {
      setLinkedProviders(result.providerIds);
      if (result.githubToken) setGithubToken(result.githubToken);
      showToast('success', 'GitHub account linked successfully.');
    } else {
      showToast('error', result.message);
    }
  }

  async function handleLinkGoogle() {
    if (!firebaseUser) return;
    setLoadingAction('link-google');
    const result = await linkGoogle(firebaseUser);
    setLoadingAction(null);
    if (result.ok) {
      setLinkedProviders(result.providerIds);
      showToast('success', 'Google account linked successfully.');
    } else {
      showToast('error', result.message);
    }
  }

  async function handleUnlink(provider: 'github.com' | 'google.com') {
    if (!firebaseUser) return;
    if (linkedProviders.length <= 1) {
      showToast('error', 'Cannot unlink your only sign-in method.');
      return;
    }
    setLoadingAction(`unlink-${provider}`);
    const result = await unlinkProvider(firebaseUser, provider);
    setLoadingAction(null);
    if (result.ok) {
      const updated = linkedProviders.filter(p => p !== provider);
      setLinkedProviders(updated);
      if (provider === 'github.com') setGithubToken(null);
      showToast('success', `${provider === 'github.com' ? 'GitHub' : 'Google'} unlinked.`);
    } else {
      showToast('error', result.message || 'Failed to unlink.');
    }
  }

  async function handleSignOut() {
    await storeSignOut();
  }

  const avatarUrl = currentUser?.photoURL
    || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.displayName || 'User')}`;

  return (
    <div className="space-y-4 relative">
      {/* Toast notification */}
      {toast && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {toast.type === 'success'
            ? <FiCheck className="w-3.5 h-3.5 shrink-0" />
            : <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
          }
          {toast.message}
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/20">
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-14 h-14 rounded-xl border border-neutral-200 dark:border-neutral-700 object-cover bg-neutral-100 dark:bg-neutral-800"
        />
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleUpdateName(); if (e.key === 'Escape') setEditingName(false); }}
                className="flex-1 text-sm font-bold bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-500"
              />
              <button
                onClick={handleUpdateName}
                disabled={loadingAction === 'name'}
                className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors cursor-pointer"
              >
                <FiCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setEditingName(false); setNameInput(currentUser?.displayName || ''); }}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {currentUser?.displayName || 'Anonymous User'}
              </h3>
              <button
                onClick={() => setEditingName(true)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Edit display name"
              >
                <FiEdit2 className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <FiMail className="w-3 h-3 text-neutral-400" />
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
              {currentUser?.email || 'No email'}
            </span>
          </div>
          {/* Provider badges */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {hasGitHub && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
                <GithubIcon className="w-2.5 h-2.5" />
                GitHub
              </span>
            )}
            {hasGoogle && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <GoogleIcon className="w-2.5 h-2.5" />
                Google
              </span>
            )}
            {linkedProviders.length === 0 && (
              <span className="text-[9px] text-neutral-400">No providers linked</span>
            )}
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="space-y-2">
        <h4 className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
          <FiLink className="w-3 h-3" />
          Connected Accounts
        </h4>

        {/* GitHub row */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <GithubIcon className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">GitHub</p>
              <p className="text-[9px] text-neutral-400">{hasGitHub ? (githubToken ? 'Connected · API access active' : 'Linked · no API token') : 'Not connected'}</p>
            </div>
          </div>
          {hasGitHub ? (
            <button
              onClick={() => handleUnlink('github.com')}
              disabled={loadingAction === 'unlink-github.com' || linkedProviders.length <= 1}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-red-300 dark:hover:border-red-800 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiLink2 className="w-3 h-3" />
              {loadingAction === 'unlink-github.com' ? 'Unlinking...' : 'Unlink'}
            </button>
          ) : (
            <button
              onClick={handleLinkGitHub}
              disabled={loadingAction === 'link-github'}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FiLink className="w-3 h-3" />
              {loadingAction === 'link-github' ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>

        {/* Google row */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
              <GoogleIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Google</p>
              <p className="text-[9px] text-neutral-400">{hasGoogle ? 'Connected' : 'Not connected'}</p>
            </div>
          </div>
          {hasGoogle ? (
            <button
              onClick={() => handleUnlink('google.com')}
              disabled={loadingAction === 'unlink-google.com' || linkedProviders.length <= 1}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-red-300 dark:hover:border-red-800 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiLink2 className="w-3 h-3" />
              {loadingAction === 'unlink-google.com' ? 'Unlinking...' : 'Unlink'}
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              disabled={loadingAction === 'link-google'}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FiLink className="w-3 h-3" />
              {loadingAction === 'link-google' ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>

        {linkedProviders.length > 1 && (
          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 px-1">
            You can sign in with any connected provider. Unlinking requires at least one remaining.
          </p>
        )}
      </div>

      {/* Sign out + Danger Zone */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-pointer"
        >
          <FiLogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>

        {/* Danger zone */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-semibold text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <FiTrash2 className="w-3 h-3" />
            Delete Account
          </button>
        ) : (
          <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 space-y-2.5">
            <p className="text-[10px] text-red-600 dark:text-red-400 font-medium leading-relaxed">
              This will permanently delete your account and all workspace data. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1.5 text-[10px] font-bold border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Re-auth required for deletion — direct user to sign back in
                  alert('Please sign out and sign in again, then you can delete your account from Profile settings. (Requires recent authentication)');
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-1.5 text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePanel;
