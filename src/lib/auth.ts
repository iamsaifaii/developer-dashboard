import {
  signInWithPopup,
  signOut as firebaseSignOut,
  linkWithPopup,
  unlink,
  updateProfile,
  GithubAuthProvider,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth, githubProvider, googleProvider } from './firebase';
import { getAuthErrorMessage } from './authErrors';

// ─── Result types ────────────────────────────────────────────────────────────

export interface AuthSuccess {
  ok: true;
  user: User;
  githubToken?: string | null;
  providerIds: string[];
}

export interface AuthFailure {
  ok: false;
  code: string;
  message: string;
  /** Set when Firebase can recover by linking providers */
  pendingCredential?: any;
  existingEmail?: string;
}

export type AuthResult = AuthSuccess | AuthFailure;

// ─── Persistence ─────────────────────────────────────────────────────────────

export async function setAuthPersistence(remember: boolean): Promise<void> {
  const mode = remember ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, mode);
}

// ─── Helper: extract provider IDs from a User ────────────────────────────────

export function getProviderIds(user: User): string[] {
  return user.providerData.map((p) => p.providerId);
}

// ─── Helper: map a successful credential result to AuthSuccess ────────────────

function buildSuccess(result: UserCredential, githubToken?: string | null): AuthSuccess {
  return {
    ok: true,
    user: result.user,
    githubToken: githubToken ?? null,
    providerIds: getProviderIds(result.user),
  };
}

// ─── Sign in with GitHub ─────────────────────────────────────────────────────

export async function signInWithGitHub(): Promise<AuthResult> {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    return buildSuccess(result, credential?.accessToken);
  } catch (err: any) {
    // Account exists with different credential — offer linking
    if (err.code === 'auth/account-exists-with-different-credential') {
      return {
        ok: false,
        code: err.code,
        message: getAuthErrorMessage(err.code),
        pendingCredential: GithubAuthProvider.credentialFromError(err),
        existingEmail: err.customData?.email,
      };
    }
    return {
      ok: false,
      code: err.code ?? 'unknown',
      message: getAuthErrorMessage(err.code, err.message),
    };
  }
}

// ─── Sign in with Google ─────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return buildSuccess(result);
  } catch (err: any) {
    if (err.code === 'auth/account-exists-with-different-credential') {
      return {
        ok: false,
        code: err.code,
        message: getAuthErrorMessage(err.code),
        pendingCredential: GoogleAuthProvider.credentialFromError(err),
        existingEmail: err.customData?.email,
      };
    }
    return {
      ok: false,
      code: err.code ?? 'unknown',
      message: getAuthErrorMessage(err.code, err.message),
    };
  }
}

// ─── Sign out ────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ─── Link GitHub to current account ─────────────────────────────────────────

export async function linkGitHub(user: User): Promise<AuthResult> {
  try {
    const result = await linkWithPopup(user, githubProvider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    return buildSuccess(result, credential?.accessToken);
  } catch (err: any) {
    return {
      ok: false,
      code: err.code ?? 'unknown',
      message: getAuthErrorMessage(err.code, err.message),
    };
  }
}

// ─── Link Google to current account ─────────────────────────────────────────

export async function linkGoogle(user: User): Promise<AuthResult> {
  try {
    const result = await linkWithPopup(user, googleProvider);
    return buildSuccess(result);
  } catch (err: any) {
    return {
      ok: false,
      code: err.code ?? 'unknown',
      message: getAuthErrorMessage(err.code, err.message),
    };
  }
}

// ─── Unlink a provider ───────────────────────────────────────────────────────

export async function unlinkProvider(
  user: User,
  providerId: 'github.com' | 'google.com'
): Promise<{ ok: boolean; message?: string }> {
  try {
    await unlink(user, providerId);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: getAuthErrorMessage(err.code, err.message) };
  }
}

// ─── Update display name ─────────────────────────────────────────────────────

export async function updateDisplayName(
  user: User,
  displayName: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    await updateProfile(user, { displayName });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: getAuthErrorMessage(err.code, err.message) };
  }
}

// ─── Validate GitHub token (detect staleness) ────────────────────────────────

export async function validateGithubToken(token: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
