/**
 * Firebase Auth Error Code → User-Friendly Message Map
 * All messages are safe to display directly in the UI.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Popup / flow errors
  'auth/popup-closed-by-user':
    'Sign-in window was closed. Please try again.',
  'auth/cancelled-popup-request':
    'Another sign-in is already in progress. Please wait.',
  'auth/popup-blocked':
    'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.',

  // Credential / account errors
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method. You can link both providers in your profile settings.',
  'auth/credential-already-in-use':
    'This sign-in method is already linked to another account.',
  'auth/email-already-in-use':
    'This email is already associated with an account.',
  'auth/provider-already-linked':
    'This sign-in provider is already linked to your account.',
  'auth/no-such-provider':
    'This sign-in provider is not linked to your account.',

  // Token / session errors
  'auth/user-token-expired':
    'Your session has expired. Please sign in again.',
  'auth/invalid-user-token':
    'Your session is invalid. Please sign in again.',
  'auth/user-disabled':
    'This account has been disabled. Please contact support.',
  'auth/requires-recent-login':
    'This action requires a recent sign-in. Please sign out and sign in again.',

  // Network errors
  'auth/network-request-failed':
    'A network error occurred. Please check your connection and try again.',
  'auth/too-many-requests':
    'Too many sign-in attempts. Please wait a moment before trying again.',
  'auth/quota-exceeded':
    'Service temporarily unavailable. Please try again later.',

  // Configuration errors
  'auth/invalid-api-key':
    'Authentication is misconfigured. Please contact the developer.',
  'auth/app-deleted':
    'Authentication service is unavailable. Please contact the developer.',
  'auth/operation-not-allowed':
    'This sign-in method is not enabled. Please contact the developer.',
  'auth/unauthorized-domain':
    'This domain is not authorized for sign-in. Please contact the developer.',

  // GitHub-specific
  'auth/invalid-credential':
    'Your sign-in credentials are invalid or have expired. Please try again.',
};

/**
 * Returns a friendly error message for a Firebase auth error code.
 * Falls back to the raw message if the code is not mapped.
 */
export function getAuthErrorMessage(errorCode: string, fallback?: string): string {
  return AUTH_ERROR_MESSAGES[errorCode]
    ?? fallback
    ?? 'An unexpected error occurred. Please try again.';
}
