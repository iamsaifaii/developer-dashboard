import React, { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiExternalLink, FiTag } from 'react-icons/fi';
import type { GithubIssue, GithubAnalytics } from '../../types';

interface Props {
  issues: GithubIssue[];
  analytics: GithubAnalytics | null;
}

function getLabelStyle(_label: string): string {
  return 'bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400 border-neutral-300 dark:border-zinc-700';
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

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'open', label: 'Open', count: totalOpen },
    { id: 'closed', label: 'Closed', count: totalClosed },
    { id: 'bugs', label: 'Bugs', count: totalBugs },
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
                ? 'border-zinc-600 bg-neutral-100 dark:bg-zinc-800'
                : 'border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-950 hover:bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="text-lg font-bold text-zinc-200">{t.count}</div>
            <div className="text-[9px] font-semibold text-neutral-500 dark:text-zinc-500 uppercase tracking-wider">{t.label}</div>
          </button>
        ))}
      </div>

      {/* Issue list */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {displayList.length === 0 ? (
          <div className="p-6 text-center flex flex-col items-center gap-2 text-neutral-500 dark:text-zinc-500">
            <FiCheckCircle className="w-6 h-6 opacity-30" />
            <p className="text-xs italic">
              {tab === 'open' ? 'No open issues! 🎉' : tab === 'bugs' ? 'No bugs tracked! 🐛' : 'No closed issues.'}
            </p>
          </div>
        ) : (
          displayList.map(issue => (
            <div
              key={issue.id}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-950 hover:bg-white dark:bg-zinc-900 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <FiAlertCircle className={`w-3 h-3 shrink-0 ${issue.state === 'open' ? 'text-neutral-700 dark:text-zinc-300' : 'text-zinc-600'}`} />
                    <p className="text-xs font-medium text-zinc-200 truncate">{issue.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pl-4">
                    <span className="text-[9px] text-neutral-500 dark:text-zinc-500">{issue.repoName} · #{issue.number}</span>
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
                  className="opacity-0 group-hover:opacity-100 p-1 rounded border border-neutral-300 dark:border-zinc-700 text-neutral-600 dark:text-zinc-400 hover:text-zinc-200 transition-all shrink-0"
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
