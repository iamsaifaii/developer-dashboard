import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Workspace, WorkspaceRole } from '../types';

export const workspaceService = {
  async createWorkspace(name: string, userId: string, userEmail: string): Promise<string> {
    const workspaceId = `ws-${Date.now()}`;
    const workspace: Workspace = {
      id: workspaceId,
      name,
      ownerId: userId,
      memberIds: [userId],
      members: {
        [userId]: {
          uid: userId,
          email: userEmail || '',
          role: 'admin',
          joinedAt: new Date().toISOString()
        }
      },
      pendingInvites: {},
      metrics: { totalTasksCompleted: 0 }
    };
    
    // Create the workspace doc
    await setDoc(doc(db, 'workspaces', workspaceId), workspace);
    // Initialize its state payload
    await setDoc(doc(db, 'workspaces', workspaceId), { state: {} }, { merge: true });
    
    return workspaceId;
  },

  async inviteUser(workspaceId: string, email: string, role: WorkspaceRole): Promise<void> {
    const wsRef = doc(db, 'workspaces', workspaceId);
    const snap = await getDoc(wsRef);
    if (!snap.exists()) throw new Error('Workspace not found');
    
    const data = snap.data() as Workspace;
    const pendingInvites = data.pendingInvites || {};
    pendingInvites[email] = role;
    
    await updateDoc(wsRef, { pendingInvites });
  },

  async acceptInvite(workspaceId: string, userId: string, userEmail: string): Promise<void> {
    const wsRef = doc(db, 'workspaces', workspaceId);
    const snap = await getDoc(wsRef);
    if (!snap.exists()) throw new Error('Workspace not found');
    
    const data = snap.data() as Workspace;
    const role = data.pendingInvites?.[userEmail];
    
    if (!role) throw new Error('No invite found for this email');
    
    const members = data.members || {};
    members[userId] = {
      uid: userId,
      email: userEmail,
      role: role,
      joinedAt: new Date().toISOString()
    };
    
    const pendingInvites = { ...data.pendingInvites };
    delete pendingInvites[userEmail];
    
    await updateDoc(wsRef, { 
      members, 
      pendingInvites,
      memberIds: arrayUnion(userId)
    });
  },

  async declineInvite(workspaceId: string, userEmail: string): Promise<void> {
    const wsRef = doc(db, 'workspaces', workspaceId);
    const snap = await getDoc(wsRef);
    if (!snap.exists()) throw new Error('Workspace not found');
    
    const data = snap.data() as Workspace;
    const pendingInvites = { ...data.pendingInvites };
    
    if (pendingInvites[userEmail]) {
      delete pendingInvites[userEmail];
      await updateDoc(wsRef, { pendingInvites });
    }
  },

  async fetchUserWorkspaces(userId: string): Promise<Workspace[]> {
    const q = query(collection(db, 'workspaces'), where('memberIds', 'array-contains', userId));
    const snapshot = await getDocs(q);
    const workspaces: Workspace[] = [];
    snapshot.forEach(doc => {
      // Exclude state from this basic array
      const { state, ...wsData } = doc.data();
      workspaces.push(wsData as Workspace);
    });
    return workspaces;
  },

  async fetchPendingInvites(userEmail: string): Promise<Workspace[]> {
    // Note: In a production app, we would query a specific 'invites' collection to avoid a full table scan.
    // Given the constraints, we will query all workspaces for demonstration.
    // For large scale, we should create a top-level collection or cloud function.
    const snapshot = await getDocs(collection(db, 'workspaces'));
    const invites: Workspace[] = [];
    snapshot.forEach(doc => {
      const wsData = doc.data() as Workspace;
      if (wsData.pendingInvites && wsData.pendingInvites[userEmail]) {
        invites.push(wsData);
      }
    });
    return invites;
  }
};
