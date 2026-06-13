import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiLoader, FiCheckCircle, FiXCircle, FiLogIn } from 'react-icons/fi';
import { validateInviteToken, acceptInvite, declineInvite } from '../../services/teamService';
import { useStore } from '../../store/useStore';
import { LoginScreen } from '../Auth/LoginScreen';
import type { Team, TeamInvite } from '../../types';

/**
 * JoinTeamPage — rendered at /join?token=xxx&teamId=yyy
 *
 * Flow:
 *  1. Parse token + teamId from URL
 *  2. Validate token from Firestore (show team info)
 *  3. If user is NOT logged in → show LoginScreen (which redirects back here after auth)
 *  4. If logged in → show Accept / Decline buttons
 *  5. On Accept → add to members, redirect to /teams
 *  6. On Decline → update status, redirect to /
 */
export const JoinTeamPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const token = params.get('token') || '';
  const teamId = params.get('teamId') || '';

  type PageState = 'loading' | 'valid' | 'invalid' | 'already_member' | 'accepting' | 'accepted' | 'declined' | 'error';
  const [pageState, setPageState] = useState<PageState>('loading');
  const [team, setTeam] = useState<Team | null>(null);
  const [invite, setInvite] = useState<TeamInvite | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: validate token
  useEffect(() => {
    if (!token || !teamId) { setPageState('invalid'); return; }

    validateInviteToken(teamId, token)
      .then((result) => {
        if (!result) {
          setPageState('invalid');
          return;
        }
        const { team: t, invite: inv } = result;
        setTeam(t);
        setInvite(inv);

        // Check if current user is already a member
        if (currentUser && t.members.some((m) => m.uid === currentUser.uid)) {
          setPageState('already_member');
          return;
        }

        setPageState('valid');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Failed to load invite.');
        setPageState('error');
      });
  }, [token, teamId, currentUser]);

  // If user is not logged in and we have a valid invite → prompt login
  const needsLogin = pageState === 'valid' && !currentUser;

  const handleAccept = async () => {
    if (!currentUser || !team || !invite) return;
    setPageState('accepting');
    try {
      await acceptInvite(team.id, token, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      });
      setPageState('accepted');
      // Redirect to teams page after short delay
      setTimeout(() => navigate('/teams'), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invite.');
      setPageState('error');
    }
  };

  const handleDecline = async () => {
    if (!team) return;
    try {
      await declineInvite(team.id, token);
      setPageState('declined');
      setTimeout(() => navigate('/'), 2000);
    } catch {
      setPageState('declined');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  // Show login screen if user not authenticated
  if (needsLogin) {
    return (
      <div>
        {/* Banner above login screen */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800/60 px-4 py-3 flex items-center gap-3 justify-center shadow-lg">
          <FiUsers className="w-4 h-4 text-white" />
          <p className="text-sm text-zinc-300">
            <strong className="text-white">{team?.name || 'A team'}</strong> has invited you to collaborate.{' '}
            <span className="text-zinc-400">Log in to accept your invitation.</span>
          </p>
        </div>
        <div className="pt-14">
          <LoginScreen />
        </div>
      </div>
    );
  }

  // Main join page layout
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-zinc-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* DevFlow branding */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-black border border-zinc-800 flex items-center justify-center">
            <img src="/icon.svg" alt="DevFlow" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">DevFlow</span>
        </div>

        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* ─── Loading ─────────────────────────────────────────────── */}
          {pageState === 'loading' && (
            <div className="p-10 text-center">
              <FiLoader className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Validating your invitation…</p>
            </div>
          )}

          {/* ─── Valid invite ─────────────────────────────────────────── */}
          {pageState === 'valid' && team && invite && currentUser && (
            <>
              {/* Header */}
              <div className="px-8 pt-8 pb-6 border-b border-zinc-800/60 text-center bg-gradient-to-b from-zinc-900/20 to-transparent">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-white font-bold text-xl mb-1">You're invited!</h1>
                <p className="text-zinc-400 text-sm">
                  <strong className="text-zinc-200">{invite.invitedByName}</strong> has invited you to join
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <FiUsers className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-200 font-bold text-sm">{team.name}</span>
                </div>
                {team.description && (
                  <p className="text-zinc-500 text-xs mt-3 leading-relaxed">{team.description}</p>
                )}
              </div>

              {/* Team info */}
              <div className="px-8 py-5">
                <div className="flex items-center gap-4 p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/50 mb-6">
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 4).map((m, i) => (
                      <div
                        key={m.uid}
                        title={m.displayName || m.email}
                        className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300"
                        style={{ zIndex: 4 - i }}
                      >
                        {m.photoURL
                          ? <img src={m.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                          : (m.displayName || m.email || '?')[0].toUpperCase()
                        }
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</p>
                    <p className="text-[11px] text-zinc-500">already in this workspace</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    id="decline-invite-btn"
                    onClick={handleDecline}
                    className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-medium cursor-pointer transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    id="accept-invite-btn"
                    onClick={handleAccept}
                    className="flex-1 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold cursor-pointer transition-colors shadow-lg shadow-black/40 flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Join Team
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ─── Accepting ────────────────────────────────────────────── */}
          {pageState === 'accepting' && (
            <div className="p-10 text-center">
              <FiLoader className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
              <p className="text-white font-bold text-sm mb-1">Joining team…</p>
              <p className="text-zinc-500 text-xs">Setting up your workspace access</p>
            </div>
          )}

          {/* ─── Accepted ─────────────────────────────────────────────── */}
          {pageState === 'accepted' && team && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">You're in! 🎉</h2>
              <p className="text-zinc-400 text-sm mb-1">Successfully joined <strong className="text-white">{team.name}</strong></p>
              <p className="text-zinc-600 text-xs">Redirecting to your teams…</p>
            </div>
          )}

          {/* ─── Declined ─────────────────────────────────────────────── */}
          {pageState === 'declined' && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <FiXCircle className="w-8 h-8 text-zinc-500" />
              </div>
              <h2 className="text-white font-bold text-sm mb-2">Invitation Declined</h2>
              <p className="text-zinc-500 text-xs">Redirecting you to the home page…</p>
            </div>
          )}

          {/* ─── Already member ───────────────────────────────────────── */}
          {pageState === 'already_member' && team && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-white font-bold text-sm mb-2">You're already a member!</h2>
              <p className="text-zinc-500 text-xs mb-6">You already have access to <strong className="text-zinc-300">{team.name}</strong>.</p>
              <button
                onClick={() => navigate('/teams')}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold cursor-pointer transition-colors"
              >
                Go to Teams
              </button>
            </div>
          )}

          {/* ─── Invalid token ────────────────────────────────────────── */}
          {(pageState === 'invalid' || pageState === 'error') && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-950/30 border border-red-900/40 flex items-center justify-center mx-auto mb-4">
                <FiXCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-white font-bold text-sm mb-2">
                {pageState === 'invalid' ? 'Invalid or Expired Invite' : 'Something went wrong'}
              </h2>
              <p className="text-zinc-500 text-xs mb-6 leading-relaxed">
                {pageState === 'invalid'
                  ? 'This invite link is invalid, has already been used, or has expired. Ask your team admin to send a new invite.'
                  : errorMsg || 'An unexpected error occurred. Please try again.'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-medium cursor-pointer transition-colors"
              >
                <FiLogIn className="w-4 h-4" /> Go to DevFlow
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          DevFlow · Your developer productivity platform
        </p>
      </div>
    </div>
  );
};
