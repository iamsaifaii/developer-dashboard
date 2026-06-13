import React from 'react';
import { FiGitPullRequest, FiCheckCircle, FiXCircle, FiExternalLink } from 'react-icons/fi';
import type { GithubPR, GithubAnalytics } from '../../types';

interface Props {
  prs: GithubPR[];
  analytics: GithubAnalytics | null;
}

const StatusBadge: React.FC<{ merged: boolean; state: string }> = ({ merged, state }) => {
  if (merged) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
        <FiCheckCircle className="w-2.5 h-2.5" />
        Merged
      </span>
    );
  }
  if (state === 'closed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
        <FiXCircle className="w-2.5 h-2.5" />
        Closed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
      <FiGitPullRequest className="w-2.5 h-2.5" />
      Open
    </span>
  );
};

export const PRAnalyticsCard: React.FC<Props> = ({ prs, analytics }) => {
  const openCount = analytics?.totalOpenPRs ?? prs.filter(p => p.state === 'open').length;
  const closedCount = analytics?.totalClosedPRs ?? 0;
  const mergedCount = analytics?.totalMergedPRs ?? prs.filter(p => p.merged).length;
  const total = openCount + closedCount + mergedCount;

  // SVG Donut chart
  const RADIUS = 40;
  const CX = 50;
  const CY = 50;
  const STROKE = 10;
  const circumference = 2 * Math.PI * RADIUS;

  function getArc(value: number, offset: number) {
    if (total === 0) return { dashArray: `0 ${circumference}`, dashOffset: 0 };
    const pct = value / total;
    const len = pct * circumference;
    return { dashArray: `${len} ${circumference - len}`, dashOffset: -offset };
  }

  const openOffset = 0;
  const mergedOffset = (openCount / total) * circumference;
  const closedOffset = mergedOffset + (mergedCount / total) * circumference;

  const openArc = getArc(openCount, openOffset);
  const mergedArc = getArc(mergedCount, mergedOffset);
  const closedArc = getArc(closedCount, closedOffset);

  return (
    <div className="space-y-4">
      {/* Stats row with donut */}
      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="shrink-0">
          <svg width={100} height={100} viewBox="0 0 100 100">
            {total === 0 ? (
              <circle
                cx={CX} cy={CY} r={RADIUS}
                fill="none"
                stroke="#27272a"
                strokeWidth={STROKE}
              />
            ) : (
              <>
                {/* Open */}
                <circle
                  cx={CX} cy={CY} r={RADIUS}
                  fill="none"
                  stroke="#52525b"
                  strokeWidth={STROKE}
                  strokeDasharray={openArc.dashArray}
                  strokeDashoffset={openArc.dashOffset}
                  strokeLinecap="butt"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
                />
                {/* Merged */}
                <circle
                  cx={CX} cy={CY} r={RADIUS}
                  fill="none"
                  stroke="#71717a"
                  strokeWidth={STROKE}
                  strokeDasharray={mergedArc.dashArray}
                  strokeDashoffset={mergedArc.dashOffset}
                  strokeLinecap="butt"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
                />
                {/* Closed */}
                <circle
                  cx={CX} cy={CY} r={RADIUS}
                  fill="none"
                  stroke="#3f3f46"
                  strokeWidth={STROKE}
                  strokeDasharray={closedArc.dashArray}
                  strokeDashoffset={closedArc.dashOffset}
                  strokeLinecap="butt"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
                />
              </>
            )}
            <text x={CX} y={CY + 5} textAnchor="middle" fontSize={14} fontWeight="bold" fontFamily="inherit" fill="#e4e4e7">
              {total}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {[
            { label: 'Open', count: openCount, color: '#52525b' },
            { label: 'Merged', count: mergedCount, color: '#71717a' },
            { label: 'Closed', count: closedCount, color: '#3f3f46' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-semibold text-zinc-400">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-200">{item.count}</span>
                {total > 0 && (
                  <span className="text-[9px] text-zinc-600">
                    {Math.round((item.count / total) * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PR List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto">
        {prs.length === 0 ? (
          <p className="text-xs text-zinc-500 italic text-center py-4">No pull requests found.</p>
        ) : (
          prs.map(pr => (
            <div
              key={pr.id}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3 group hover:bg-zinc-900 transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-medium text-zinc-200 truncate">{pr.title}</p>
                <p className="text-[9px] text-zinc-500">{pr.repoName} · #{pr.number}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge merged={pr.merged} state={pr.state} />
                <a
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all"
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

export default PRAnalyticsCard;
