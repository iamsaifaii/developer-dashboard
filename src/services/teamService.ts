import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Team, TeamMember, TeamInvite } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a cryptographically random invite token */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Team CRUD ───────────────────────────────────────────────────────────────

export async function createTeam(
  name: string,
  description: string,
  currentUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }
): Promise<Team> {
  const teamRef = doc(collection(db, 'teams'));
  const adminMember: TeamMember = {
    uid: currentUser.uid,
    email: currentUser.email || '',
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    role: 'admin',
    joinedAt: new Date().toISOString(),
  };

  const team: Team = {
    id: teamRef.id,
    name,
    description,
    createdAt: new Date().toISOString(),
    createdBy: currentUser.uid,
    members: [adminMember],
    invites: [],
  };

  await setDoc(teamRef, team);
  return team;
}

export async function deleteTeam(teamId: string): Promise<void> {
  await deleteDoc(doc(db, 'teams', teamId));
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const snap = await getDoc(doc(db, 'teams', teamId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Team;
}

// ─── Invite ──────────────────────────────────────────────────────────────────

/**
 * Sends an invite to an email address:
 * 1. Generates a secure token
 * 2. Stores the invite in Firestore under the team doc
 * 3. Calls the Express backend to dispatch the actual email
 */
export async function inviteMember(
  teamId: string,
  teamName: string,
  inviteeEmail: string,
  inviter: { uid: string; displayName: string | null; email: string | null }
): Promise<void> {
  const token = generateToken();
  const invite: TeamInvite = {
    email: inviteeEmail.toLowerCase().trim(),
    status: 'pending',
    invitedAt: new Date().toISOString(),
    invitedBy: inviter.uid,
    invitedByName: inviter.displayName || inviter.email || 'A teammate',
    token,
  };

  // 1. Always save invite to Firestore first
  await updateDoc(doc(db, 'teams', teamId), {
    invites: arrayUnion(invite),
  });

  // 2. Build the magic link
  const clientUrl = window.location.origin;
  const inviteLink = `${clientUrl}/join?token=${token}&teamId=${teamId}`;

  // 3. Call the Vercel serverless function /api/invite
  //    - In production: runs on Vercel automatically
  //    - Locally: run `vercel dev` or just use the copy-link fallback
  try {
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: inviteeEmail.toLowerCase().trim(),
        inviterName: inviter.displayName || inviter.email || 'A teammate',
        teamName,
        inviteLink,
      }),
    });

    if (!res.ok) {
      // Surface invite link for manual sharing
      throw new Error(`__LINK__${inviteLink}`);
    }
  } catch (fetchErr: any) {
    // Network error (localhost without vercel dev) — show copy-link fallback
    if (fetchErr.message?.startsWith('__LINK__')) throw fetchErr;
    throw new Error(`__LINK__${inviteLink}`);
  }
}

// ─── Accept / Decline ────────────────────────────────────────────────────────

/**
 * Validates the invite token and returns the team if valid.
 * Used on the /join page to show team details before accepting.
 */
export async function validateInviteToken(
  teamId: string,
  token: string
): Promise<{ team: Team; invite: TeamInvite } | null> {
  const team = await getTeam(teamId);
  if (!team) return null;

  const invite = team.invites.find(
    (inv) => inv.token === token && inv.status === 'pending'
  );
  if (!invite) return null;

  return { team, invite };
}

/**
 * Accepts the invite: adds the user to members[], updates invite status to 'accepted'
 */
export async function acceptInvite(
  teamId: string,
  token: string,
  user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }
): Promise<Team | null> {
  const result = await validateInviteToken(teamId, token);
  if (!result) return null;

  const { team, invite } = result;

  // Guard: don't add if already a member
  if (team.members.some((m) => m.uid === user.uid)) {
    return team; // already a member
  }

  const newMember: TeamMember = {
    uid: user.uid,
    email: user.email || invite.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'member',
    joinedAt: new Date().toISOString(),
  };

  // Remove old invite, add updated one
  const updatedInvites = team.invites.map((inv) =>
    inv.token === token ? { ...inv, status: 'accepted' as const } : inv
  );

  await updateDoc(doc(db, 'teams', teamId), {
    members: arrayUnion(newMember),
    invites: updatedInvites,
  });

  return { ...team, members: [...team.members, newMember], invites: updatedInvites };
}

/**
 * Declines the invite — updates status only, user is NOT added to members
 */
export async function declineInvite(
  teamId: string,
  token: string
): Promise<void> {
  const result = await validateInviteToken(teamId, token);
  if (!result) return;

  const { team } = result;
  const updatedInvites = team.invites.map((inv) =>
    inv.token === token ? { ...inv, status: 'declined' as const } : inv
  );

  await updateDoc(doc(db, 'teams', teamId), {
    invites: updatedInvites,
  });
}

// ─── Remove Member ───────────────────────────────────────────────────────────

export async function removeMember(teamId: string, member: TeamMember): Promise<void> {
  await updateDoc(doc(db, 'teams', teamId), {
    members: arrayRemove(member),
  });
}

// ─── Real-time subscription ──────────────────────────────────────────────────

/**
 * Subscribes to all teams where the user is a member.
 * Returns unsubscribe function.
 */
export function subscribeToMyTeams(
  uid: string,
  callback: (teams: Team[]) => void
): () => void {
  // Firestore array-contains on objects requires exact match of ALL fields,
  // which is not possible here. Instead, we subscribe to ALL teams and filter client-side.
  // The security rules ensure we only get teams we're a member of.
  const allTeamsRef = collection(db, 'teams');

  return onSnapshot(allTeamsRef, (snap) => {
    const teams: Team[] = [];
    snap.forEach((d) => {
      const data = d.data() as Team;
      const isMember = data.members?.some((m) => m.uid === uid);
      if (isMember) {
        teams.push({ ...data, id: d.id });
      }
    });
    callback(teams);
  });
}

/**
 * Subscribes to teams where the user has a pending invite (matched by email).
 * Returns unsubscribe function.
 */
export function subscribeToPendingInvites(
  email: string,
  callback: (invites: { team: Team; invite: TeamInvite }[]) => void
): () => void {
  const allTeamsRef = collection(db, 'teams');

  return onSnapshot(allTeamsRef, (snap) => {
    const pending: { team: Team; invite: TeamInvite }[] = [];
    snap.forEach((d) => {
      const data = d.data() as Team;
      const invite = data.invites?.find(
        (inv) => inv.email === email.toLowerCase() && inv.status === 'pending'
      );
      if (invite) {
        pending.push({ team: { ...data, id: d.id }, invite });
      }
    });
    callback(pending);
  });
}
