import React from 'react';
import { FiStar, FiCopy, FiGitCommit, FiZap, FiAward, FiTrendingUp, FiCode } from 'react-icons/fi';
import type { GithubAnalytics } from '../../types';

interface Props {
  analytics: GithubAnalytics | null;
  githubUsername: string;
  repoCount: number;
  commitCount: number;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}> = ({ icon, label, value, sub, color = 'text-neutral-700 dark:text-neutral-300' }) => (
  <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/20">
    <div className="flex items-center gap-2 mb-1.5">
      <div className={`${color} opacity-80`}>{icon}</div>
      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">{label}</span>
    </div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    {sub && <div className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5">{sub}</div>}
  </div>
);

export const ActivitySummaryPanel: React.FC<Props> = ({ analytics, githubUsername, repoCount, commitCount }) => {
  if (!analytics) return null;

  const {
    totalStars,
    totalForks,
    totalOpenPRs,
    totalMergedPRs,
    weeklyActivity,
    languageBreakdown,
    currentStreak,
    longestStreak,
  } = analytics;

  // Sparkline for weekly activity (last 7 weeks)
  const sparkData = weeklyActivity.slice(-7);
  const sparkMax = Math.max(...sparkData.map(w => w.total), 1);
  const SPARK_H = 28;
  const SPARK_W = 120;
  const barW = Math.floor((SPARK_W - (sparkData.length - 1) * 2) / sparkData.length);

  // Language breakdown sorted
  const langs = Object.entries(languageBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const langTotal = langs.reduce((s, [, v]) => s + v, 0);

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
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
          <FiTrendingUp className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">@{githubUsername}</h3>
          <p className="text-[9px] text-neutral-400 dark:text-neutral-500">Activity summary</p>
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<FiStar className="w-3.5 h-3.5" />}
          label="Total Stars"
          value={totalStars.toLocaleString()}
          color="text-amber-500"
        />
        <StatCard
          icon={<FiCopy className="w-3.5 h-3.5" />}
          label="Total Forks"
          value={totalForks.toLocaleString()}
          color="text-blue-500"
        />
        <StatCard
          icon={<FiGitCommit className="w-3.5 h-3.5" />}
          label="Commits"
          value={commitCount}
          sub="visible events"
          color="text-green-500"
        />
        <StatCard
          icon={<FiZap className="w-3.5 h-3.5" />}
          label="Open PRs"
          value={totalOpenPRs}
          sub={`${totalMergedPRs} merged`}
          color="text-purple-500"
        />
      </div>

      {/* Streak section */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/20 space-y-2">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          <FiAward className="w-3 h-3" />
          <span>Commit Streak</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{currentStreak}</div>
            <div className="text-[9px] text-neutral-400">Current</div>
          </div>
          <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">{longestStreak}</div>
            <div className="text-[9px] text-neutral-400">Longest</div>
          </div>
          <div className="flex-1 ml-1">
            {currentStreak > 0 ? (
              <p className="text-[9px] text-green-500 font-medium leading-relaxed">
                🔥 {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak!
              </p>
            ) : (
              <p className="text-[9px] text-neutral-400 leading-relaxed">Start committing to build a streak!</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly sparkline */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            <FiTrendingUp className="w-3 h-3" />
            <span>Weekly Activity</span>
          </div>
          <span className="text-[9px] text-neutral-400">Last 7 weeks</span>
        </div>
        <svg width={SPARK_W} height={SPARK_H} className="w-full" style={{ minWidth: SPARK_W }}>
          {sparkData.map((w, i) => {
            const h = Math.max((w.total / sparkMax) * SPARK_H, w.total > 0 ? 3 : 1);
            const x = i * (barW + 2);
            const y = SPARK_H - h;
            const isLast = i === sparkData.length - 1;
            return (
              <rect
                key={w.weekStart}
                x={x} y={y}
                width={barW} height={h}
                rx={2}
                fill={isLast ? '#26a641' : '#40c463'}
                opacity={isLast ? 1 : 0.6}
              />
            );
          })}
        </svg>
      </div>

      {/* Language breakdown */}
      {langs.length > 0 && (
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/20 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            <FiCode className="w-3 h-3" />
            <span>Languages</span>
          </div>
          <div className="space-y-1.5">
            {langs.map(([lang, count]) => {
              const pct = Math.round((count / langTotal) * 100);
              const color = LANGUAGE_COLORS[lang] || '#6b7280';
              return (
                <div key={lang} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-neutral-600 dark:text-neutral-300 font-medium">{lang}</span>
                    </div>
                    <span className="text-neutral-400">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Repos count */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/20">
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Active Repositories</span>
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{repoCount}</span>
      </div>
    </div>
  );
};

export default ActivitySummaryPanel;
