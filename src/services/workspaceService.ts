import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, query, getDocs } from 'firebase/firestore';
import type { Workspace, InviteToken, WorkspaceRole } from '../types';

export const workspaceService = {
  async createWorkspace(userId: string, userEmail: string, name: string): Promise<Workspace> {
    const workspaceId = `workspace-${Date.now()}`;
    const newWorkspace: Workspace = {
      id: workspaceId,
      name,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      members: [{
        uid: userId,
        email: userEmail,
        role: 'admin',
        status: 'active'
      }]
    };

    // Save to global workspaces collection
    await setDoc(doc(db, 'workspaces', workspaceId), newWorkspace);
    
    // Add to user's personal list of workspaces
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      workspaces: arrayUnion(workspaceId)
    }, { merge: true });

    return newWorkspace;
  },

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    // Query workspaces where the user is a member
    const q = query(collection(db, 'workspaces'));
    const snapshot = await getDocs(q);
    const workspaces: Workspace[] = [];
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as Workspace;
      if (data.members.some(m => m.uid === userId && m.status === 'active')) {
        workspaces.push(data);
      }
    });
    
    return workspaces;
  },

  async generateInviteToken(workspaceId: string, email: string, role: WorkspaceRole): Promise<string> {
    const tokenId = `invite-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const token: InviteToken = {
      id: tokenId,
      workspaceId,
      email,
      role,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      used: false
    };

    await setDoc(doc(db, 'invites', tokenId), token);
    
    // Also add member as "invited" to the workspace
    const wsRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(wsRef, {
      members: arrayUnion({
        uid: '', // not known yet
        email,
        role,
        status: 'invited'
      })
    });

    return tokenId;
  },

  async validateAndAcceptInvite(tokenId: string, userId: string, userEmail: string): Promise<string | null> {
    const tokenRef = doc(db, 'invites', tokenId);
    const tokenSnap = await getDoc(tokenRef);
    
    if (!tokenSnap.exists()) throw new Error('Invite not found');
    
    const tokenData = tokenSnap.data() as InviteToken;
    if (tokenData.used) throw new Error('Invite already used');
    if (new Date(tokenData.expiresAt) < new Date()) throw new Error('Invite expired');
    if (tokenData.email.toLowerCase() !== userEmail.toLowerCase()) throw new Error('Email mismatch');

    // Add user to workspace
    const wsRef = doc(db, 'workspaces', tokenData.workspaceId);
    const wsSnap = await getDoc(wsRef);
    if (!wsSnap.exists()) throw new Error('Workspace not found');
    
    const wsData = wsSnap.data() as Workspace;
    
    // Remove the "invited" placeholder and add the "active" member
    const newMembers = wsData.members.filter(m => m.email !== userEmail);
    newMembers.push({
      uid: userId,
      email: userEmail,
      role: tokenData.role,
      status: 'active'
    });
    
    await updateDoc(wsRef, { members: newMembers });
    await updateDoc(tokenRef, { used: true });

    // Add to user's list
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      workspaces: arrayUnion(tokenData.workspaceId)
    }, { merge: true });

    return tokenData.workspaceId;
  }
};
