import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { signInWithGitHub, signInWithGoogle, setAuthPersistence } from '../../lib/auth';
import { FiGithub, FiAlertCircle, FiX, FiShield, FiZap, FiGitBranch, FiClock } from 'react-icons/fi';

// Inline Google "G" SVG — zero deps
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
    <div className="min-h-screen bg-zinc-950 flex overflow-hidden">

      {/* ── LEFT PANEL: Branding ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 bg-zinc-900 text-white border-r border-zinc-800 relative overflow-hidden">
        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Logo / wordmark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
              <FiGitBranch className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">DevSpace</span>
          </div>
          <p className="text-zinc-500 text-xs">Your developer productivity platform</p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-5">
          <h2 className="text-2xl font-black text-white leading-tight">
            Everything a developer<br />
            needs in one place.
          </h2>
          <div className="space-y-3.5">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{f.title}</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[10px] text-zinc-500">
          © 2026 DevSpace · Secure · Synced · Private
        </p>
      </div>

      {/* ── RIGHT PANEL: Sign in form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 bg-zinc-950">
        <div className="w-full max-w-sm space-y-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <FiGitBranch className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="font-black text-white text-base">DevSpace</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-400">
              Sign in to access your developer workspace.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900">
              <FiAlertCircle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-300 leading-relaxed flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-zinc-500 hover:text-zinc-300 shrink-0 cursor-pointer"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Account conflict / linking prompt */}
          {linkingState && (
            <div className="px-4 py-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3">
              <div className="flex items-start gap-2.5">
                <FiAlertCircle className="w-4 h-4 text-zinc-350 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong className="block mb-0.5">Account already exists</strong>
                  {linkingState.message}
                  {linkingState.existingEmail && (
                    <span className="block mt-1 font-mono text-[10px] opacity-70">{linkingState.existingEmail}</span>
                  )}
                </p>
              </div>
              <p className="text-[10px] text-zinc-500">
                Sign in with your existing provider first, then link the other account from Profile Settings.
              </p>
              <button
                onClick={() => setLinkingState(null)}
                className="text-[10px] font-bold text-zinc-400 hover:text-white underline cursor-pointer"
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
              className="w-full relative flex items-center justify-center gap-3.5 px-5 py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-sm rounded-xl border border-zinc-800 disabled:opacity-60 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              {loading === 'github' ? (
                <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                <FiGithub className="w-5 h-5" />
              )}
              <span>{loading === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
              {loading === 'github' && (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="h-full bg-zinc-950/5 animate-pulse" />
                </div>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] font-medium text-zinc-500">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Google */}
            <button
              id="btn-signin-google"
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3.5 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-semibold text-sm rounded-xl border border-zinc-800 disabled:opacity-60 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              {loading === 'google' ? (
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              <span>{loading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <div
              onClick={() => setRemember(!remember)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                remember
                  ? 'bg-white border-white'
                  : 'border-zinc-800 bg-zinc-950'
              }`}
            >
              {remember && (
                <svg className="w-2.5 h-2.5 text-zinc-950" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Keep me signed in on this device
            </span>
          </label>

          {/* Legal */}
          <p className="text-[10px] text-zinc-500 leading-relaxed text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your data is encrypted and never shared.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
