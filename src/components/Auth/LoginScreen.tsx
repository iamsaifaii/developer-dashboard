import React, { useState } from 'react';
import { signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import { auth, githubProvider } from '../../lib/firebase';
import { useStore } from '../../store/useStore';
import { FiGithub, FiAlertCircle } from 'react-icons/fi';
import { GithubIcon } from '../BrandIcons';

export const LoginScreen: React.FC = () => {
 const { setCurrentUser, setGithubToken } = useStore();
 const [error, setError] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(false);

 const handleLogin = async (provider: any) => {
 setIsLoading(true);
 setError(null);
 try {
 const result = await signInWithPopup(auth, provider);
 // Format the user object to avoid storing non-serializable data in Zustand
 const user = {
 uid: result.user.uid,
 displayName: result.user.displayName,
 email: result.user.email,
 photoURL: result.user.photoURL,
 };

 if (provider === githubProvider) {
 const credential = GithubAuthProvider.credentialFromResult(result);
 if (credential && credential.accessToken) {
 setGithubToken(credential.accessToken);
 }
 }

 setCurrentUser(user);
 } catch (err: any) {
 console.error(err);
 if (err.code === 'auth/invalid-api-key') {
 setError('Firebase API Key is missing or invalid. Please update src/lib/firebase.ts with your actual config.');
 } else {
 setError(err.message || 'An error occurred during sign in.');
 }
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col items-center justify-center p-6 text-neutral-800 dark:text-neutral-200 relative overflow-hidden">

 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full z-10 relative flex flex-col items-center">
 
 <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl flex items-center justify-center mb-6">
 <GithubIcon className="w-8 h-8 text-neutral-700 dark:text-neutral-300" />
 </div>

 <h1 className="text-2xl font-black text-black dark:text-white mb-2 text-center tracking-tight">
 Developer Workspace
 </h1>
 <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-8 font-light">
 Sign in to sync your kanban boards, pomodoro sessions, and GitHub repositories.
 </p>

 {error && (
 <div className="w-full bg-black/40 border border-black/50 rounded-xl p-4 mb-6 flex gap-3 text-left">
 <FiAlertCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
 <p className="text-xs text-neutral-300 leading-relaxed">{error}</p>
 </div>
 )}

 <div className="w-full flex flex-col gap-3">
  <button
  onClick={() => handleLogin(githubProvider)}
  disabled={isLoading}
  className="w-full py-3.5 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 disabled:opacity-50 active:scale-[0.98] rounded-xl border border-neutral-300 dark:border-neutral-700 flex items-center justify-center gap-3 font-semibold text-sm shadow-lg shadow-neutral-900/20 cursor-pointer"
  >
  <FiGithub className="w-5 h-5" />
  <span>Continue with GitHub</span>
  </button>
  </div>

 <p className="text-xs text-neutral-500 mt-8 text-center max-w-[280px]">
 By continuing, you agree to the terms of service and privacy policy.
 </p>

 </div>
 </div>
 );
};
