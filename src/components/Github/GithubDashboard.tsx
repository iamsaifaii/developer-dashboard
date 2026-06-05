import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { FiRefreshCw, FiLogOut, FiGitBranch, FiGitPullRequest, FiAlertCircle, FiGitCommit, FiGrid } from 'react-icons/fi';
import { GithubIcon } from '../BrandIcons';
import { ContributionHeatmap } from './ContributionHeatmap';
import { CommitActivityChart } from './CommitActivityChart';
import { RepoAnalyticsCard } from './RepoAnalyticsCard';
import { PRAnalyticsCard } from './PRAnalyticsCard';
import { IssueAnalyticsCard } from './IssueAnalyticsCard';
import { ActivitySummaryPanel } from './ActivitySummaryPanel';

type AnalyticsTab = 'repos' | 'commits' | 'prs' | 'issues';

const TAB_CONFIG: { id: AnalyticsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'repos', label: 'Repositories', icon: <FiGitBranch className="w-3.5 h-3.5" /> },
  { id: 'commits', label: 'Commits', icon: <FiGitCommit className="w-3.5 h-3.5" /> },
  { id: 'prs', label: 'Pull Requests', icon: <FiGitPullRequest className="w-3.5 h-3.5" /> },
  { id: 'issues', label: 'Issues', icon: <FiAlertCircle className="w-3.5 h-3.5" /> },
];

// Shimmer skeleton
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-zinc-800 rounded-lg ${className}`} />
);

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <div className="p-6 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
        <Skeleton className="w-full h-[110px]" />
      </div>
      <div className="p-6 rounded-2xl border border-zinc-800 space-y-4">
        <Skeleton className="w-48 h-4" />
        <Skeleton className="w-full h-[120px]" />
      </div>
      <div className="p-5 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="flex-1 h-8" />)}
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-12" />)}
      </div>
    </div>
    <div className="lg:col-span-1 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
      <Skeleton className="w-full h-24" />
      <Skeleton className="w-full h-32" />
    </div>
  </div>
);

export const GithubDashboard: React.FC = () => {
  const {
    githubUsername,
    githubRepos,
    githubIssues,
    githubPRs,
    githubCommits,
    githubAnalytics,
    disconnectGithub,
    currentUser,
    githubToken,
    githubIsLoading,
    fetchRealGithubData
  } = useStore();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('repos');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    if (githubToken) {
      fetchRealGithubData();
    }
  }, [githubToken]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchRealGithubData();
    setLastRefreshed(new Date());
    setIsRefreshing(false);
  }, [fetchRealGithubData]);

  // Not connected
  if (!githubToken) {
    return (
      <div className="max-w-md mx-auto my-16 glass-panel rounded-2xl p-8 text-center flex flex-col items-center gap-5">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
          <GithubIcon className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-zinc-200">GitHub Not Connected</h3>
          <p className="text-xs text-zinc-500 max-w-[260px] leading-relaxed">
            Sign in with <strong className="text-zinc-300">Continue with GitHub</strong> to unlock your analytics dashboard, contribution heatmap, and coding activity reports.
          </p>
        </div>
      </div>
    );
  }

  if (githubIsLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ─── LEFT COLUMN ─── */}
      <div className="lg:col-span-2 space-y-6">

        {/* Profile header */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <GithubIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  @{githubUsername || currentUser?.displayName || 'GitHub User'}
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                </h2>
                <p className="text-[10px] text-zinc-500">Connected · Live API sync</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-zinc-400 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                title={lastRefreshed ? `Last refreshed: ${lastRefreshed.toLocaleTimeString()}` : 'Refresh data'}
              >
                <FiRefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={disconnectGithub}
                className="flex items-center gap-1 px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 rounded-lg text-[10px] font-semibold text-zinc-500 cursor-pointer transition-colors"
              >
                <FiLogOut className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>

          {/* Contribution Heatmap */}
          <ContributionHeatmap commits={githubCommits} />
        </div>

        {/* Commit Activity Chart */}
        {githubAnalytics && githubAnalytics.weeklyActivity.length > 0 && (
          <div className="glass-panel rounded-2xl p-6">
            <CommitActivityChart weeklyActivity={githubAnalytics.weeklyActivity} />
          </div>
        )}

        {/* Analytics Tabs */}
        <div className="glass-panel rounded-2xl p-5">

          {/* Tab header */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1 mb-5">
            {TAB_CONFIG.map(tab => {
              const countMap: Record<AnalyticsTab, number> = {
                repos: githubRepos.length,
                commits: githubCommits.length,
                prs: githubPRs.length,
                issues: githubIssues.length,
              };
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {countMap[tab.id] > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${
                      activeTab === tab.id
                        ? 'bg-zinc-700 text-zinc-300'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {countMap[tab.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="min-h-[200px]">
            {activeTab === 'repos' && <RepoAnalyticsCard repos={githubRepos} />}
            {activeTab === 'commits' && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {githubCommits.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic text-center py-8">No commits in the visible event window.</p>
                ) : (
                  githubCommits.map(c => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs font-medium text-zinc-200 truncate">{c.message}</p>
                        <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                          <FiGitCommit className="w-2.5 h-2.5" />
                          <span>{c.repoName}</span>
                          <span>·</span>
                          <span>@{c.author}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-zinc-500 shrink-0 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                        {c.date}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'prs' && <PRAnalyticsCard prs={githubPRs} analytics={githubAnalytics} />}
            {activeTab === 'issues' && <IssueAnalyticsCard issues={githubIssues} analytics={githubAnalytics} />}
          </div>
        </div>

      </div>

      {/* ─── RIGHT COLUMN ─── */}
      <div className="lg:col-span-1">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-4">
            <FiGrid className="w-3.5 h-3.5" />
            <span>Analytics Overview</span>
          </div>
          <ActivitySummaryPanel
            analytics={githubAnalytics}
            githubUsername={githubUsername || currentUser?.displayName || 'User'}
            repoCount={githubRepos.length}
            commitCount={githubCommits.length}
          />
        </div>
      </div>

    </div>
  );
};

export default GithubDashboard;
