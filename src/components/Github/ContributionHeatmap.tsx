import React, { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';

interface ContributionDay {
  date: string;
  count: number;
}

interface Props {
  commits: { date: string }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getContributionColor(count: number): string {
  if (count === 0) return '#161b22';
  if (count <= 1) return '#0e4429';
  if (count <= 3) return '#006d32';
  if (count <= 6) return '#26a641';
  return '#39d353';
}

export const ContributionHeatmap: React.FC<Props> = ({ commits }) => {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Build commit counts map
  const commitCounts: Record<string, number> = {};
  commits.forEach(c => {
    commitCounts[c.date] = (commitCounts[c.date] || 0) + 1;
  });

  // Build 52-week grid aligned to Sunday
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  const startDay = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDay);

  const days: ContributionDay[] = [];
  const cur = new Date(startDate);
  while (cur <= today) {
    const dateStr = cur.toISOString().split('T')[0];
    days.push({ date: dateStr, count: commitCounts[dateStr] || 0 });
    cur.setDate(cur.getDate() + 1);
  }

  const totalContributions = days.reduce((s, d) => s + d.count, 0);

  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, colIdx) => {
    const firstDay = week[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTHS[month], col: colIdx });
      lastMonth = month;
    }
  });

  const CELL = 11;
  const GAP = 2;
  const CELL_STEP = CELL + GAP;
  const LEFT_LABELS_W = 28;
  const TOP_LABELS_H = 18;
  const totalW = LEFT_LABELS_W + weeks.length * CELL_STEP;
  const totalH = TOP_LABELS_H + 7 * CELL_STEP;

  return (
    <div className="text-left space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <FiCalendar className="w-3.5 h-3.5" />
          <span>Contribution Graph · Past 365 Days</span>
        </span>
        <span className="text-[10px] font-semibold text-zinc-500">
          {totalContributions.toLocaleString()} contributions
        </span>
      </div>

      {/* SVG Heatmap */}
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto select-none relative">
        <svg
          width={totalW}
          height={totalH}
          style={{ display: 'block', minWidth: totalW }}
        >
          {/* Month labels */}
          {monthLabels.map(({ label, col }) => (
            <text
              key={`${label}-${col}`}
              x={LEFT_LABELS_W + col * CELL_STEP}
              y={12}
              fontSize={9}
              fill="#52525b"
              fontFamily="inherit"
            >
              {label}
            </text>
          ))}

          {/* Day-of-week labels */}
          {DAY_LABELS.map((label, row) => (
            label ? (
              <text
                key={`dow-${row}`}
                x={0}
                y={TOP_LABELS_H + row * CELL_STEP + CELL - 1}
                fontSize={8}
                fill="#3f3f46"
                fontFamily="inherit"
              >
                {label}
              </text>
            ) : null
          ))}

          {/* Grid cells */}
          {weeks.map((week, colIdx) =>
            week.map((day, rowIdx) => {
              const x = LEFT_LABELS_W + colIdx * CELL_STEP;
              const y = TOP_LABELS_H + rowIdx * CELL_STEP;
              const color = getContributionColor(day.count);
              return (
                <rect
                  key={`${colIdx}-${rowIdx}`}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  ry={2}
                  fill={color}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          )}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-zinc-100 bg-zinc-800 shadow-xl pointer-events-none border border-zinc-700"
            style={{ left: tooltip.x - 40, top: tooltip.y - 42 }}
          >
            <span className="font-bold">{tooltip.count} commit{tooltip.count !== 1 ? 's' : ''}</span>
            <br />
            <span className="opacity-70">{tooltip.date}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>365-day contribution summary</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 1, 3, 6, 10].map((v, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-[2px]"
              style={{ backgroundColor: getContributionColor(v) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
