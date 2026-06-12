import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { signInWithGitHub, signInWithGoogle, setAuthPersistence, type AuthFailure } from '../../lib/auth';
import { FiGithub, FiAlertCircle, FiX, FiShield, FiZap, FiGitBranch, FiClock } from 'react-icons/fi';

// Inline Google "G" SVG — zero deps
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
  pendingCredential: import('firebase/auth').AuthCredential | null | undefined;
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
        const failureResult = result as AuthFailure;
        setLinkingState({
          message: failureResult.message,
          pendingCredential: failureResult.pendingCredential,
          existingEmail: failureResult.existingEmail || '',
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
        const failureResult = result as AuthFailure;
        setLinkingState({
          message: failureResult.message,
          pendingCredential: failureResult.pendingCredential,
          existingEmail: failureResult.existingEmail || '',
        });
      } else {
        setError(result.message);
      }
    }
    setLoading(null);
  }

  const isLoading = loading !== null;

  return (
    <div className="min-h-screen bg-[#080809] flex overflow-hidden font-sans">

      {/* ── LEFT PANEL: Branding ── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-24 bg-[#080809] text-white border-r border-zinc-900 relative overflow-hidden">
        {/* Decorative background grid & glow */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-zinc-600 rounded-full blur-[120px] opacity-[0.15]" />

        {/* Logo / wordmark */}
        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <FiGitBranch className="w-6 h-6 text-black" />
            </div>
            <span className="text-white font-black text-2xl tracking-tighter">DevFlow</span>
          </div>
          <p className="text-zinc-500 text-[11px] font-bold tracking-widest uppercase ml-1">Your developer productivity platform</p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-4xl font-black text-white leading-[1.1] tracking-tighter">
            Everything a developer<br />
            needs in one place.
          </h2>
          <div className="space-y-5">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5 shadow-sm">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-200">{f.title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[10px] text-zinc-600 font-medium tracking-wider uppercase">
          © 2026 DevFlow · Secure · Synced · Private
        </p>
      </div>

      {/* ── RIGHT PANEL: Sign in form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 bg-[#080809] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent opacity-50" />
        
        <div className="w-full max-w-sm space-y-8 relative z-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <FiGitBranch className="w-5 h-5 text-black" />
            </div>
            <span className="font-black text-white text-xl tracking-tighter">DevFlow</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-400 font-medium">
              Sign in to access your developer workspace.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-red-900/50 bg-red-950/20 panel-in">
              <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed flex-1 font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-400 shrink-0 cursor-pointer p-0.5 rounded-md hover:bg-red-900/40 transition-colors"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Account conflict / linking prompt */}
          {linkingState && (
            <div className="px-5 py-4 rounded-xl border border-yellow-900/50 bg-yellow-950/20 space-y-3 panel-in">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300 leading-relaxed font-medium">
                  <strong className="block mb-1 text-yellow-400">Account already exists</strong>
                  {linkingState.message}
                  {linkingState.existingEmail && (
                    <span className="block mt-1.5 font-mono text-[10px] opacity-80 bg-yellow-900/40 px-2 py-1 rounded inline-block">{linkingState.existingEmail}</span>
                  )}
                </p>
              </div>
              <p className="text-[10px] text-yellow-500/80 font-medium">
                Sign in with your existing provider first, then link the other account from Profile Settings.
              </p>
              <button
                onClick={() => setLinkingState(null)}
                className="text-[10px] font-bold text-yellow-400 hover:text-yellow-300 underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Sign-in buttons */}
          <div className="space-y-4">
            {/* GitHub */}
            <button
              id="btn-signin-github"
              onClick={handleGitHub}
              disabled={isLoading}
              className="w-full relative flex items-center justify-center gap-3.5 px-6 py-4 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl disabled:opacity-60 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-pointer btn-press"
            >
              {loading === 'github' ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <FiGithub className="w-5 h-5" />
              )}
              <span>{loading === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
              {loading === 'github' && (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="h-full bg-black/5 animate-pulse" />
                </div>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Google */}
            <button
              id="btn-signin-google"
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3.5 px-6 py-4 bg-[#0a0a0a] hover:bg-zinc-900 text-white font-bold text-sm rounded-xl border border-zinc-800 disabled:opacity-60 transition-all shadow-sm cursor-pointer btn-press"
            >
              {loading === 'google' ? (
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              <span>{loading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div
              onClick={() => setRemember(!remember)}
              className={`w-4.5 h-4.5 rounded md border flex items-center justify-center transition-colors cursor-pointer ${remember
                ? 'bg-white border-white'
                : 'border-zinc-700 bg-[#0a0a0a] group-hover:border-zinc-500'
                }`}
            >
              {remember && (
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
              Keep me signed in on this device
            </span>
          </label>

          {/* Legal */}
          <p className="text-[10px] text-zinc-600 leading-relaxed text-center font-medium">
            By signing in, you agree to our <a href="#" className="underline hover:text-zinc-400">Terms of Service</a> and <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.<br/>
            Your data is encrypted and never shared.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
