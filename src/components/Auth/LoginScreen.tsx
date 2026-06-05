import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { signInWithGitHub, signInWithGoogle, setAuthPersistence } from '../../lib/auth';
import { FiGithub, FiAlertCircle, FiX, FiShield, FiZap, FiGitBranch, FiClock } from 'react-icons/fi';

// Inline Google "G" SVG — zero deps
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FEATURES = [
  { icon: <FiGitBranch className="w-4 h-4" />, title: 'GitHub Analytics', desc: 'Real contribution graphs, PR tracking, and commit history' },
  { icon: <FiZap className="w-4 h-4" />, title: 'Kanban Board', desc: 'Drag-and-drop task management with priority levels' },
  { icon: <FiClock className="w-4 h-4" />, title: 'Pomodoro Timer', desc: 'Focus sessions with automatic break scheduling' },
  { icon: <FiShield className="w-4 h-4" />, title: 'Cloud Sync', desc: 'All your data synced securely across devices' },
];

type LoadingProvider = 'github' | 'google' | null;

interface LinkingState {
  message: string;
  pendingCredential: any;
  existingEmail: string;
}

export const LoginScreen: React.FC = () => {
  const { setCurrentUser, setGithubToken, setLinkedProviders } = useStore();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingProvider>(null);
  const [remember, setRemember] = useState(true);
  const [linkingState, setLinkingState] = useState<LinkingState | null>(null);

  async function handleGitHub() {
    setLoading('github');
    setError(null);
    setLinkingState(null);
    await setAuthPersistence(remember);

    const result = await signInWithGitHub();

    if (result.ok) {
      if (result.githubToken) setGithubToken(result.githubToken);
      setLinkedProviders(result.providerIds);
      setCurrentUser({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
    } else {
      if (result.code === 'auth/account-exists-with-different-credential') {
        setLinkingState({
          message: result.message,
          pendingCredential: result.pendingCredential,
          existingEmail: result.existingEmail || '',
        });
      } else {
        setError(result.message);
      }
    }
    setLoading(null);
  }

  async function handleGoogle() {
    setLoading('google');
    setError(null);
    setLinkingState(null);
    await setAuthPersistence(remember);

    const result = await signInWithGoogle();

    if (result.ok) {
      setLinkedProviders(result.providerIds);
      setCurrentUser({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
    } else {
      if (result.code === 'auth/account-exists-with-different-credential') {
        setLinkingState({
          message: result.message,
          pendingCredential: result.pendingCredential,
          existingEmail: result.existingEmail || '',
        });
      } else {
        setError(result.message);
      }
    }
    setLoading(null);
  }

  const isLoading = loading !== null;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex overflow-hidden">

      {/* ── LEFT PANEL: Branding ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white border-r border-neutral-200 dark:border-neutral-900 relative overflow-hidden">
        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-green-500/5 dark:bg-green-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] pointer-events-none" />

        {/* Logo / wordmark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/10 flex items-center justify-center">
              <FiGitBranch className="w-5 h-5 text-neutral-800 dark:text-white" />
            </div>
            <span className="text-neutral-900 dark:text-white font-black text-lg tracking-tight">DevSpace</span>
          </div>
          <p className="text-neutral-500 text-xs">Your developer productivity platform</p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-5">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight">
            Everything a developer<br />
            needs in one place.
          </h2>
          <div className="space-y-3.5">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-850 dark:text-white">{f.title}</p>
                  <p className="text-[11px] text-neutral-505 dark:text-neutral-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[10px] text-neutral-400 dark:text-neutral-600">
          © 2026 DevSpace · Secure · Synced · Private
        </p>
      </div>

      {/* ── RIGHT PANEL: Sign in form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 bg-white dark:bg-neutral-950">
        <div className="w-full max-w-sm space-y-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <FiGitBranch className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            </div>
            <span className="font-black text-neutral-800 dark:text-white text-base">DevSpace</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Sign in to access your developer workspace.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-900/10">
              <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 shrink-0 cursor-pointer"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Account conflict / linking prompt */}
          {linkingState && (
            <div className="px-4 py-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-900/10 space-y-3">
              <div className="flex items-start gap-2.5">
                <FiAlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  <strong className="block mb-0.5">Account already exists</strong>
                  {linkingState.message}
                  {linkingState.existingEmail && (
                    <span className="block mt-1 font-mono text-[10px] opacity-70">{linkingState.existingEmail}</span>
                  )}
                </p>
              </div>
              <p className="text-[10px] text-amber-600 dark:text-amber-500">
                Sign in with your existing provider first, then link the other account from Profile Settings.
              </p>
              <button
                onClick={() => setLinkingState(null)}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Sign-in buttons */}
          <div className="space-y-3">
            {/* GitHub */}
            <button
              id="btn-signin-github"
              onClick={handleGitHub}
              disabled={isLoading}
              className="w-full relative flex items-center gap-3.5 px-5 py-3.5 bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-sm rounded-xl border border-neutral-800 dark:border-white/20 disabled:opacity-60 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              {loading === 'github' ? (
                <div className="w-5 h-5 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin" />
              ) : (
                <FiGithub className="w-5 h-5" />
              )}
              <span>{loading === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
              {loading === 'github' && (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="h-full bg-white/5 animate-pulse" />
                </div>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-600">or</span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Google */}
            <button
              id="btn-signin-google"
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 disabled:opacity-60 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              {loading === 'google' ? (
                <div className="w-5 h-5 border-2 border-neutral-300 border-t-blue-500 rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              <span>{loading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => setRemember(!remember)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                remember
                  ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white'
                  : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900'
              }`}
            >
              {remember && (
                <svg className="w-2.5 h-2.5 text-white dark:text-neutral-900" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
              Keep me signed in on this device
            </span>
          </label>

          {/* Legal */}
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 leading-relaxed text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your data is encrypted and never shared.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
