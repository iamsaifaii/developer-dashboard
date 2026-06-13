import React, { useState } from 'react';
import { FiGitBranch, FiStar, FiCopy, FiAlertCircle, FiLock, FiExternalLink } from 'react-icons/fi';
import type { GithubRepo } from '../../types';

interface Props {
  repos: GithubRepo[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  Swift: '#FA7343',
  Kotlin: '#A97BFF',
  PHP: '#4F5D95',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

function getLangColor(lang: string | undefined): string {
  if (!lang) return '#6b7280';
  return LANGUAGE_COLORS[lang] || '#6b7280';
}

export const RepoAnalyticsCard: React.FC<Props> = ({ repos }) => {
  const [search, setSearch] = useState('');

  const sorted = [...repos]
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.stars - a.stars);

  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks, 0);

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
          <FiStar className="w-3 h-3 text-zinc-400" />
          <span className="text-zinc-300">{totalStars.toLocaleString()}</span>
          <span>total stars</span>
        </div>
        <div className="w-px h-3 bg-zinc-800" />
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
          <FiCopy className="w-3 h-3 text-zinc-400" />
          <span className="text-zinc-300">{totalForks.toLocaleString()}</span>
          <span>total forks</span>
        </div>
        <div className="w-px h-3 bg-zinc-800" />
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
          <FiGitBranch className="w-3 h-3 text-zinc-400" />
          <span className="text-zinc-300">{repos.length}</span>
          <span>repositories</span>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Filter repositories..."
        className="w-full px-3 py-1.5 text-xs bg-black border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
      />

      {/* Repo list */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-6">No repositories found.</p>
        ) : (
          sorted.map(repo => (
            <div
              key={repo.name}
              className="p-3 rounded-xl border border-zinc-800 bg-black hover:bg-black transition-colors group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <FiGitBranch className="w-3 h-3 shrink-0 text-zinc-400" />
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {repo.name}
                    </span>
                    {repo.isPrivate && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                        <FiLock className="w-2.5 h-2.5" />
                        Private
                      </span>
                    )}
                    {repo.language && (
                      <span className="flex items-center gap-1 shrink-0">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getLangColor(repo.language) }}
                        />
                        <span className="text-[9px] text-zinc-400">{repo.language}</span>
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-1">
                      {repo.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Stats */}
                  <div className="flex items-center gap-2.5 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-0.5">
                      <FiStar className="w-3 h-3 text-zinc-400" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <FiCopy className="w-3 h-3 text-zinc-400" />
                      {repo.forks}
                    </span>
                    {repo.openIssues > 0 && (
                      <span className="flex items-center gap-0.5 text-zinc-400">
                        <FiAlertCircle className="w-3 h-3" />
                        {repo.openIssues}
                      </span>
                    )}
                  </div>

                  {repo.url && (
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md border border-zinc-700 hover:bg-zinc-900 text-zinc-400 transition-all"
                      title="Open on GitHub"
                    >
                      <FiExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RepoAnalyticsCard;
