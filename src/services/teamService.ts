import type { Team, TeamMember, TeamInvite } from '../types';

// Mock storage
let mockTeams: Team[] = [];

// ─── Helpers ────────────────────────────────────────────────────────────────
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
  const adminMember: TeamMember = {
    uid: currentUser.uid,
    email: currentUser.email || '',
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    role: 'admin',
    joinedAt: new Date().toISOString(),
  };

  const team: Team = {
    id: `team-${Date.now()}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    createdBy: currentUser.uid,
    members: [adminMember],
    invites: [],
  };

  mockTeams.push(team);
  return team;
}

export async function deleteTeam(teamId: string): Promise<void> {
  mockTeams = mockTeams.filter((t) => t.id !== teamId);
}

export async function getTeam(teamId: string): Promise<Team | null> {
  return mockTeams.find((t) => t.id === teamId) || null;
}

// ─── Invite ──────────────────────────────────────────────────────────────────
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

  const team = mockTeams.find((t) => t.id === teamId);
  if (team) {
    team.invites.push(invite);
  }

  const clientUrl = window.location.origin;
  const inviteLink = `${clientUrl}/join?token=${token}&teamId=${teamId}`;
  
  // Show copy-link fallback immediately since we removed backend
  throw new Error(`__LINK__${inviteLink}`);
}

// ─── Accept / Decline ────────────────────────────────────────────────────────
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

export async function acceptInvite(
  teamId: string,
  token: string,
  user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }
): Promise<Team | null> {
  const result = await validateInviteToken(teamId, token);
  if (!result) return null;

  const { team, invite } = result;

  if (team.members.some((m) => m.uid === user.uid)) {
    return team;
  }

  const newMember: TeamMember = {
    uid: user.uid,
    email: user.email || invite.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'member',
    joinedAt: new Date().toISOString(),
  };

  invite.status = 'accepted';
  team.members.push(newMember);

  return team;
}

export async function declineInvite(
  teamId: string,
  token: string
): Promise<void> {
  const result = await validateInviteToken(teamId, token);
  if (!result) return;
  result.invite.status = 'declined';
}

// ─── Remove Member ───────────────────────────────────────────────────────────
export async function removeMember(teamId: string, member: TeamMember): Promise<void> {
  const team = mockTeams.find((t) => t.id === teamId);
  if (team) {
    team.members = team.members.filter((m) => m.uid !== member.uid);
  }
}

// ─── Real-time subscription (Mocked) ──────────────────────────────────────────
export function subscribeToMyTeams(
  uid: string,
  callback: (teams: Team[]) => void
): () => void {
  // Mock immediate callback and periodic poll for simplicity
  const check = () => {
    const myTeams = mockTeams.filter((t) => t.members.some((m) => m.uid === uid));
    callback([...myTeams]);
  };
  check();
  const interval = setInterval(check, 1000);
  return () => clearInterval(interval);
}

export function subscribeToPendingInvites(
  email: string,
  callback: (invites: { team: Team; invite: TeamInvite }[]) => void
): () => void {
  const check = () => {
    const pending: { team: Team; invite: TeamInvite }[] = [];
    mockTeams.forEach((data) => {
      const invite = data.invites?.find(
        (inv) => inv.email === email.toLowerCase() && inv.status === 'pending'
      );
      if (invite) {
        pending.push({ team: data, invite });
      }
    });
    callback([...pending]);
  };
  check();
  const interval = setInterval(check, 1000);
  return () => clearInterval(interval);
}
