import React, { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiExternalLink, FiTag } from 'react-icons/fi';
import type { GithubIssue, GithubAnalytics } from '../../types';

interface Props {
  issues: GithubIssue[];
  analytics: GithubAnalytics | null;
}

const LABEL_COLORS: Record<string, string> = {
  bug: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  feature: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  enhancement: 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  documentation: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  question: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  help: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
};

function getLabelStyle(label: string): string {
  const key = Object.keys(LABEL_COLORS).find(k => label.toLowerCase().includes(k));
  return key
    ? LABEL_COLORS[key]
    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700';
}

type Tab = 'open' | 'closed' | 'bugs';

export const IssueAnalyticsCard: React.FC<Props> = ({ issues, analytics }) => {
  const [tab, setTab] = useState<Tab>('open');

  const openIssues = issues.filter(i => i.state === 'open');
  const closedIssues = issues.filter(i => i.state === 'closed');
  const bugIssues = issues.filter(i => (i.labels || []).some(l => l.toLowerCase().includes('bug')));

  const totalOpen = analytics?.totalOpenIssues ?? openIssues.length;
  const totalClosed = analytics?.totalClosedIssues ?? closedIssues.length;
  const totalBugs = bugIssues.length;

  const displayList = tab === 'open' ? openIssues : tab === 'closed' ? closedIssues : bugIssues;

  const tabs: { id: Tab; label: string; count: number; color: string }[] = [
    { id: 'open', label: 'Open', count: totalOpen, color: 'text-green-600 dark:text-green-400' },
    { id: 'closed', label: 'Closed', count: totalClosed, color: 'text-neutral-500 dark:text-neutral-400' },
    { id: 'bugs', label: 'Bugs', count: totalBugs, color: 'text-red-500 dark:text-red-400' },
  ];

  return (
    <div className="space-y-3">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
              tab === t.id
                ? 'border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/20 hover:bg-neutral-50 dark:hover:bg-black/40'
            }`}
          >
            <div className={`text-lg font-bold ${t.color}`}>{t.count}</div>
            <div className="text-[9px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t.label}</div>
          </button>
        ))}
      </div>

      {/* Issue list */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {displayList.length === 0 ? (
          <div className="p-6 text-center flex flex-col items-center gap-2 text-neutral-400">
            <FiCheckCircle className="w-6 h-6 opacity-30" />
            <p className="text-xs italic">
              {tab === 'open' ? 'No open issues! 🎉' : tab === 'bugs' ? 'No bugs tracked! 🐛' : 'No closed issues.'}
            </p>
          </div>
        ) : (
          displayList.map(issue => (
            <div
              key={issue.id}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-black/20 hover:bg-neutral-50 dark:hover:bg-black/40 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <FiAlertCircle className={`w-3 h-3 shrink-0 ${issue.state === 'open' ? 'text-green-500' : 'text-neutral-400'}`} />
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{issue.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pl-4">
                    <span className="text-[9px] text-neutral-400">{issue.repoName} · #{issue.number}</span>
                    {(issue.labels || []).slice(0, 3).map(label => (
                      <span
                        key={label}
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold border ${getLabelStyle(label)}`}
                      >
                        <FiTag className="w-2 h-2" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all shrink-0"
                >
                  <FiExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IssueAnalyticsCard;
