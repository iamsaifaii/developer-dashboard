import React, { useEffect, useRef } from 'react';
import { FiActivity } from 'react-icons/fi';
import type { GithubWeeklyActivity } from '../../types';

interface Props {
  weeklyActivity: GithubWeeklyActivity[];
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart);
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export const CommitActivityChart: React.FC<Props> = ({ weeklyActivity }) => {
  const barsRef = useRef<SVGGElement>(null);

  const maxVal = Math.max(...weeklyActivity.map(w => w.total), 1);
  const totalCommits = weeklyActivity.reduce((s, w) => s + w.total, 0);
  const thisWeek = weeklyActivity[weeklyActivity.length - 1]?.total ?? 0;

  // SVG dimensions
  const CHART_H = 100;
  const CHART_W = 520;
  const BAR_GAP = 4;
  const numBars = weeklyActivity.length;
  const barW = Math.floor((CHART_W - (numBars - 1) * BAR_GAP) / numBars);
  const LABEL_H = 18;
  const YAXIS_W = 28;
  const totalSvgH = CHART_H + LABEL_H;
  const totalSvgW = YAXIS_W + CHART_W;

  // Y-axis ticks
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  // Animate bars on mount
  useEffect(() => {
    if (!barsRef.current) return;
    const bars = barsRef.current.querySelectorAll<SVGRectElement>('rect[data-bar]');
    bars.forEach((bar, i) => {
      const targetH = parseFloat(bar.getAttribute('data-target-h') || '0');
      const targetY = parseFloat(bar.getAttribute('data-target-y') || '0');
      bar.setAttribute('height', '0');
      bar.setAttribute('y', String(CHART_H));
      const delay = i * 40;
      setTimeout(() => {
        bar.style.transition = 'height 0.4s cubic-bezier(0.34,1.56,0.64,1), y 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        bar.setAttribute('height', String(targetH));
        bar.setAttribute('y', String(targetY));
      }, delay);
    });
  }, [weeklyActivity]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <FiActivity className="w-3.5 h-3.5" />
          <span>Weekly Commit Activity · Last 12 Weeks</span>
        </span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-zinc-500">
            This week: <span className="font-bold text-zinc-300">{thisWeek}</span>
          </span>
          <span className="text-zinc-500">
            Total: <span className="font-bold text-zinc-300">{totalCommits}</span>
          </span>
        </div>
      </div>

      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        <svg
          width={totalSvgW}
          height={totalSvgH}
          style={{ display: 'block', minWidth: totalSvgW }}
        >
          {/* Y-axis grid lines + labels */}
          {yTicks.map((tick) => {
            const y = CHART_H - (tick / maxVal) * CHART_H;
            return (
              <g key={tick}>
                <line
                  x1={YAXIS_W}
                  x2={totalSvgW}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.06}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  className="text-zinc-700"
                />
                <text
                  x={YAXIS_W - 4}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={8}
                  fontFamily="inherit"
                  className="fill-zinc-500"
                  fill="currentColor"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          <g ref={barsRef}>
            {weeklyActivity.map((week, i) => {
              const isCurrentWeek = i === weeklyActivity.length - 1;
              const barH = maxVal > 0 ? Math.max((week.total / maxVal) * CHART_H, week.total > 0 ? 3 : 0) : 0;
              const barX = YAXIS_W + i * (barW + BAR_GAP);
              const barY = CHART_H - barH;

              return (
                <g key={week.weekStart}>
                  <rect
                    data-bar="true"
                    data-target-h={String(barH)}
                    data-target-y={String(barY)}
                    x={barX}
                    y={barY}
                    width={barW}
                    height={barH}
                    rx={3}
                    fill={isCurrentWeek ? '#26a641' : '#40c463'}
                    opacity={isCurrentWeek ? 1 : 0.7}
                    className="dark:[&[data-bar]]:opacity-80"
                  />
                  {/* X label */}
                  {i % 3 === 0 && (
                    <text
                      x={barX + barW / 2}
                      y={CHART_H + LABEL_H - 2}
                      textAnchor="middle"
                      fontSize={8}
                      fontFamily="inherit"
                      className="fill-zinc-500"
                      fill="currentColor"
                    >
                      {formatWeekLabel(week.weekStart)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* X Axis baseline */}
          <line
            x1={YAXIS_W}
            x2={totalSvgW}
            y1={CHART_H}
            y2={CHART_H}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
            className="text-zinc-700"
          />
        </svg>
      </div>
    </div>
  );
};

export default CommitActivityChart;
