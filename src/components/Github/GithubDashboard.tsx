import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
 FiGitBranch, 
 FiGitPullRequest, 
 FiAlertCircle, 
 FiStar, 
 FiCopy, 
 FiLink,
 FiLogOut,
 FiCalendar
} from 'react-icons/fi';
import { GithubIcon } from '../BrandIcons';

export const GithubDashboard: React.FC = () => {
 const { 
 githubUsername, 
 githubRepos, 
 githubIssues, 
 githubPRs, 
 githubCommits, 
 disconnectGithub,
 currentUser,
 githubToken,
 githubIsLoading,
 fetchRealGithubData
 } = useStore();

 const [activeTab, setActiveTab] = useState<'repos' | 'commits' | 'prs' | 'issues'>('repos');
 
  useEffect(() => {
    if (githubToken) {
      fetchRealGithubData();
    }
  }, [githubToken]);

 // Generate 52-week contribution dataset (365 days aligned Sunday-to-Saturday)
 const generateContributionData = () => {
 const commitCounts: { [date: string]: number } = {};
 githubCommits.forEach(c => {
 commitCounts[c.date] = (commitCounts[c.date] || 0) + 1;
 });

 const data = [];
 const today = new Date();
 
 // Begin 364 days ago
 const startDate = new Date();
 startDate.setDate(today.getDate() - 364);
 const startDay = startDate.getDay();
 startDate.setDate(startDate.getDate() - startDay); // Align to Sunday

 const currentDate = new Date(startDate);
 
 while (currentDate <= today) {
 const dateStr = currentDate.toISOString().split('T')[0];
 let count = commitCounts[dateStr] || 0;
 
    // We no longer inject mock data; we only show real commits from githubCommits
    
    data.push({
      date: dateStr,
      count
    });

 currentDate.setDate(currentDate.getDate() + 1);
 }

 return data;
 };

 const contributionDays = generateContributionData();

 // Helper to color grid block based on commits count (GitHub Green)
 const getContributionColor = (count: number) => {
   if (count === 0) return 'bg-[#ebedf0] dark:bg-[#161b22] border border-black/5 dark:border-white/5'; 
   if (count <= 1) return 'bg-[#9be9a8] dark:bg-[#0e4429]'; 
   if (count <= 2) return 'bg-[#40c463] dark:bg-[#006d32]'; 
   if (count <= 4) return 'bg-[#30a14e] dark:bg-[#26a641]'; 
   return 'bg-[#216e39] dark:bg-[#39d353]'; 
 };

 if (!githubToken) {
    return (
      <div className="max-w-md mx-auto my-12 glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-8 shadow-2xl text-center flex flex-col items-center">
        <div className="p-4 rounded-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800/60 text-neutral-500 dark:text-neutral-400 mb-5 relative">
          <GithubIcon className="w-10 h-10" />
        </div>

        <h3 className="text-md font-bold text-black dark:text-white">GitHub API Disconnected</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[280px] leading-relaxed mt-2 mb-6">
          To view your real GitHub repositories, issues, and pull requests, please log out and sign in using the <strong>Continue with GitHub</strong> option.
        </p>
      </div>
    );
  }

  if (githubIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-800 border-t-neutral-500 dark:border-t-neutral-400 rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Fetching real live data from GitHub API...</p>
        </div>
      </div>
    );
  }

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Column 1 & 2: Main info panel & Grid */}
 <div className="lg:col-span-2 space-y-6">
 
 {/* Profile Card & Contribution Grid */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-6">
 <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-neutral-100 dark:bg-neutral-800/10 blur-3xl pointer-events-none" />

 {/* User Profile Info */}
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div className="flex items-center gap-3.5">
 <div className="w-12 h-12 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
 <GithubIcon className="w-6 h-6" />
 </div>
 <div className="text-left">
 <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
 <span>@{githubUsername || currentUser?.displayName || 'User'}</span>
 <span className="w-2 h-2 rounded-full bg-neutral-400" />
 </h3>
 <p className="text-xxs text-neutral-500 dark:text-neutral-400">Authenticated profile</p>
 </div>
 </div>

 <button
 onClick={disconnectGithub}
 className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 hover:bg-white dark:bg-black hover:border-neutral-300 dark:border-neutral-700 hover:text-neutral-700 dark:text-neutral-300 rounded-lg text-xxs font-bold text-neutral-500 dark:text-neutral-400 cursor-pointer"
 >
 <FiLogOut className="w-3.5 h-3.5" />
 <span>Disconnect</span>
 </button>
 </div>

 {/* 52 Week Commit Calendar Heat-map */}
 <div className="text-left space-y-2">
 <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
 <FiCalendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
 <span>Contribution Heatmap (Past 365 Days)</span>
 </span>

 {/* Scrolling grid */}
 <div className="p-3 bg-white dark:bg-black/40 border border-neutral-300 dark:border-black rounded-xl overflow-x-auto select-none scrollbar-thin">
 <div className="grid grid-flow-col grid-rows-7 gap-[2px] w-[720px] mx-auto">
 {contributionDays.map((day, idx) => (
 <div
 key={idx}
 className={`w-[11px] h-[11px] rounded-[2px] ${getContributionColor(day.count)}-colors `}
 title={`${day.date}: ${day.count} commit${day.count === 1 ? '' : 's'}`}
 />
 ))}
 </div>
 </div>

 <div className="flex items-center justify-between text-[10px] text-neutral-500">
 <span>365 days contribution summary</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#ebedf0] dark:bg-[#161b22] border border-black/5 dark:border-white/5" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#9be9a8] dark:bg-[#0e4429]" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#40c463] dark:bg-[#006d32]" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#30a14e] dark:bg-[#26a641]" />
          <div className="w-2.5 h-2.5 rounded-[1px] bg-[#216e39] dark:bg-[#39d353]" />
          <span>More</span>
        </div>
 </div>
 </div>
 </div>

 {/* Tab Lists: Repos / commits / Pull Requests */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
 
 {/* Tabs header */}
 <div className="flex flex-wrap md:flex-nowrap gap-2.5 bg-white dark:bg-black/60 p-1 rounded-xl border border-neutral-300 dark:border-black">
 {(['repos', 'commits', 'prs', 'issues'] as const).map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`flex-1 px-3 py-2 text-xxs font-bold rounded-lg uppercase tracking-wider  cursor-pointer ${
 activeTab === tab
 ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white'
 : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200'
 }`}
 >
 {tab === 'repos' ? 'Repositories' : tab === 'commits' ? 'Commits' : tab === 'prs' ? 'PRs' : 'Bugs'}
 </button>
 ))}
 </div>

 {/* List items rendering */}
 <div className="overflow-y-auto max-h-[300px] text-left space-y-2">
 
 {/* Repos list */}
 {activeTab === 'repos' && (
 githubRepos.length === 0 ? (
 <p className="text-xs text-neutral-500 italic p-4 text-center">No repositories connected.</p>
 ) : (
 githubRepos.map(repo => (
 <div key={repo.name} className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-black/20 hover:border-neutral-200 dark:border-neutral-800 hover:bg-white dark:bg-black/40 flex justify-between items-center gap-4">
 <div className="space-y-1">
 <h4 className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
 <FiGitBranch className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
 <span>{repo.name}</span>
 </h4>
 <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal max-w-sm">{repo.description}</p>
 </div>

 <div className="flex items-center gap-3.5 text-[10px] text-neutral-500">
 <span className="flex items-center gap-1 hover:text-neutral-700 dark:text-neutral-300">
 <FiStar className="w-3.5 h-3.5" />
 <span>{repo.stars}</span>
 </span>
 <span className="flex items-center gap-1 hover:text-neutral-700 dark:text-neutral-300">
 <FiCopy className="w-3.5 h-3.5" />
 <span>{repo.forks}</span>
 </span>
 </div>
 </div>
 ))
 )
 )}

 {/* Commits list */}
 {activeTab === 'commits' && (
 githubCommits.length === 0 ? (
 <p className="text-xs text-neutral-500 italic p-4 text-center">No commits logged.</p>
 ) : (
 githubCommits.map(c => (
 <div key={c.id} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-850/80 bg-white dark:bg-black/10 flex items-center justify-between gap-3 text-xs">
 <div className="space-y-0.5 truncate flex-1">
 <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{c.message}</p>
 <div className="flex items-center gap-1.5 text-[9px] text-neutral-500">
 <span className="text-neutral-500 dark:text-neutral-400">{c.repoName}</span>
 <span>•</span>
 <span>commit by @{c.author}</span>
 </div>
 </div>
 <span className="text-[9px] text-neutral-500 shrink-0 font-bold bg-white dark:bg-black px-2 py-0.5 rounded border border-neutral-300 dark:border-black">
 {c.date}
 </span>
 </div>
 ))
 )
 )}

 {/* PRs list */}
 {activeTab === 'prs' && (
 githubPRs.length === 0 ? (
 <p className="text-xs text-neutral-500 italic p-4 text-center">No Pull Requests found.</p>
 ) : (
 githubPRs.map(pr => (
 <div key={pr.id} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-850/80 bg-white dark:bg-black/10 flex items-center justify-between gap-4">
 <div className="space-y-0.5 truncate flex-1">
 <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate flex items-center gap-1.5">
 <FiGitPullRequest className={`w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400`} />
 <span>{pr.title}</span>
 </h4>
 <p className="text-[9px] text-neutral-500">{pr.repoName} • #{pr.number}</p>
 </div>

 <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
 pr.merged 
 ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700' 
 : 'bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
 }`}>
 {pr.merged ? 'Merged' : 'Open'}
 </span>
 </div>
 ))
 )
 )}

 {/* Issues list */}
 {activeTab === 'issues' && (
 githubIssues.length === 0 ? (
 <div className="p-6 text-center text-neutral-500 flex flex-col items-center">
 <FiAlertCircle className="w-8 h-8 opacity-20 mb-2" />
 <p className="text-xs italic">All bugs are squashed! 0 open issues.</p>
 </div>
 ) : (
 githubIssues.map(issue => (
 <div key={issue.id} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-850/80 bg-white dark:bg-black/10 flex items-center justify-between gap-4">
 <div className="space-y-0.5 truncate flex-1">
 <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate flex items-center gap-1.5">
 <FiAlertCircle className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
 <span>{issue.title}</span>
 </h4>
 <p className="text-[9px] text-neutral-500">{issue.repoName} • #{issue.number}</p>
 </div>

 <a
 href={issue.url}
 target="_blank"
 rel="noopener noreferrer"
 className="p-1.5 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:border-neutral-700 text-neutral-450 hover:text-black dark:text-white rounded-lg"
 title="View simulated link"
 >
 <FiLink className="w-3 h-3" />
 </a>
 </div>
 ))
 )
 )}

 </div>
 </div>

 </div>

 {/* Column 3: Mock Commits Generator Control */}
 <div className="lg:col-span-1 space-y-6">
 
        {/* Live Sync Status Panel */}
        <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl text-left relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-neutral-500" />
            <span>API Live Sync Active</span>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-5">
            This dashboard is directly connected to the official GitHub REST API using your secure OAuth token.
          </p>

          <div className="h-px bg-neutral-200 dark:bg-neutral-800/60 my-3.5" />
          
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
              <span>Repositories Found</span>
              <span className="text-black dark:text-white">{githubRepos.length}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
              <span>Open Pull Requests</span>
              <span className="text-black dark:text-white">{githubPRs.length}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
              <span>Recent Commits</span>
              <span className="text-black dark:text-white">{githubCommits.length}</span>
            </div>
          </div>
        </div>

 </div>

 </div>
 );
};
export default GithubDashboard;
