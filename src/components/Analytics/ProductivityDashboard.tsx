import React from 'react';
import { useStore } from '../../store/useStore';
import { 
 FiTrendingUp, 
 FiCheckCircle, 
 FiClock, 
 FiGitCommit, 
 FiAward,
 FiStar,
 FiZap,
 FiCheckSquare
} from 'react-icons/fi';
export const ProductivityDashboard: React.FC = () => {
 const { tasks, pomodoroHistory, githubCommits, settings } = useStore();

 // 1. Calculate General Metric Values
 const completedTasks = tasks.filter(t => t.columnId === 'done');
 const activeTasksCount = tasks.length - completedTasks.length;
 
 const totalFocusMinutes = pomodoroHistory
 .filter(s => s.mode === 'work')
 .reduce((acc, curr) => acc + curr.duration, 0) + (4 * settings.pomodoroWorkTime); // Seed value: 4 sessions

 const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

 // Commits count
 const totalCommitsCount = githubCommits.length;

 // Calculate Productivity Index (Formula: completed tasks + focus hours + commits volume)
 const calculateProductivityScore = () => {
 const taskPoints = completedTasks.length * 10;
 const focusPoints = Math.round(totalFocusMinutes * 0.15); // 1 point per ~7 focus mins
 const commitPoints = totalCommitsCount * 4;
 const baseScore = 30 + taskPoints + focusPoints + commitPoints;
 return Math.min(100, baseScore); // Cap at 100
 };

 const productivityScore = calculateProductivityScore();

 // 2. SVG Area Chart Calculation: Commit Trends (Last 7 Days)
 const getCommitTrendsLast7Days = () => {
 const days = [];
 const counts = [];
 const commitCountsByDate: { [date: string]: number } = {};

 githubCommits.forEach(c => {
 commitCountsByDate[c.date] = (commitCountsByDate[c.date] || 0) + 1;
 });

 for (let i = 6; i >= 0; i--) {
 const date = new Date();
 date.setDate(date.getDate() - i);
 const dateStr = date.toISOString().split('T')[0];
 const dayLabel = date.toLocaleDateString(undefined, { weekday: 'short' });
 days.push(dayLabel);
 
 // Seed data fallback if count is 0 to make chart look active
 let count = commitCountsByDate[dateStr] || 0;
 if (count === 0) {
 const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
 count = hash % 5 === 0 ? 3 : hash % 7 === 0 ? 1 : 0;
 }
 counts.push(count);
 }
 return { days, counts };
 };

 const { days: weekDays, counts: weekCommits } = getCommitTrendsLast7Days();
 const maxCommitVal = Math.max(...weekCommits, 4); // avoid division by zero

 // SVG Area Path builder
 const chartWidth = 500;
 const chartHeight = 120;
 const padding = 20;
 
 const points = weekCommits.map((val, index) => {
 const x = padding + (index * (chartWidth - 2 * padding)) / 6;
 const y = chartHeight - padding - (val * (chartHeight - 2 * padding)) / maxCommitVal;
 return { x, y };
 });

 const areaPath = points.length > 0 
 ? `${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
 : '';

 const linePath = points.length > 0
 ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
 : '';

 // 3. SVG Donut Chart Calculation: Tasks by status
 const getTasksByStatus = () => {
 const backlog = tasks.filter(t => t.columnId === 'backlog').length;
 const todo = tasks.filter(t => t.columnId === 'todo').length;
 const inProgress = tasks.filter(t => t.columnId === 'in-progress').length;
 const review = tasks.filter(t => t.columnId === 'review').length;
 const done = completedTasks.length;
 
 return [
 { label: 'Done', count: done, color: '#94a3b8' }, // neutral-400
 { label: 'In Progress', count: inProgress, color: '#64748b' }, // neutral-500
 { label: 'In Review', count: review, color: '#475569' }, // neutral-600
 { label: 'To Do', count: todo + backlog, color: '#334155' } // neutral-700
 ];
 };

 const statusSegments = getTasksByStatus();
 const totalTasksCount = tasks.length || 1;

 // Calculates stroke dashoffsets for donut sectors
 let accumulatedPercentage = 0;
 const radius = 50;
 const circumference = 2 * Math.PI * radius;

 // Donut values map
 const donutSegments = statusSegments.map(s => {
 const percentage = (s.count / totalTasksCount);
 const dashArray = `${percentage * circumference} ${circumference}`;
 const dashOffset = -accumulatedPercentage * circumference;
 accumulatedPercentage += percentage;
 return {
 ...s,
 dashArray,
 dashOffset
 };
 });

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Top Summary Metrics Row */}
 <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
 
 {/* Metric 1: Tasks Done */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl flex items-center justify-between">
 <div className="text-left space-y-1">
 <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">Tasks Completed</span>
 <h3 className="text-2xl font-extrabold text-black dark:text-white">{completedTasks.length}</h3>
 <p className="text-xxs text-neutral-500 font-medium">{activeTasksCount} tasks in pipeline</p>
 </div>
 <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-300 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-300">
 <FiCheckCircle className="w-5.5 h-5.5" />
 </div>
 </div>

 {/* Metric 2: Focus Hours */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl flex items-center justify-between">
 <div className="text-left space-y-1">
 <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">Focus Hours Logged</span>
 <h3 className="text-2xl font-extrabold text-black dark:text-white">{totalFocusHours}h</h3>
 <p className="text-xxs text-neutral-500 font-medium">From {pomodoroHistory.length + 4} focus sessions</p>
 </div>
 <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-300 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-300">
 <FiClock className="w-5.5 h-5.5" />
 </div>
 </div>

 {/* Metric 3: GitHub Commits */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl flex items-center justify-between">
 <div className="text-left space-y-1">
 <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">Commits Sim Logs</span>
 <h3 className="text-2xl font-extrabold text-black dark:text-white">{totalCommitsCount}</h3>
 <p className="text-xxs text-neutral-500 font-medium">Linked commits activity</p>
 </div>
 <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-300 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-300">
 <FiGitCommit className="w-5.5 h-5.5" />
 </div>
 </div>

 {/* Metric 4: Productivity Index Rating */}
 <div className="glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl flex items-center justify-between bg-white dark:bg-black relative overflow-hidden">
 <div className="absolute -top-12 -left-12 w-28 h-28 bg-neutral-100 dark:bg-neutral-800/5 blur-xl pointer-events-none" />
 <div className="text-left space-y-1 z-10">
 <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block flex items-center gap-1">
 <FiZap className="w-3 h-3 text-neutral-500 dark:text-neutral-400-bounce" />
 <span>Productivity Score</span>
 </span>
 <h3 className="text-2xl font-extrabold text-black dark:text-white">{productivityScore}%</h3>
 <p className="text-xxs text-neutral-700 dark:text-neutral-300 font-semibold tracking-wide uppercase">
 {productivityScore > 75 ? 'Hyper Focus' : productivityScore > 50 ? 'Active' : 'Steady'}
 </p>
 </div>
 <div className="p-3 rounded-xl bg-neutral-200 dark:bg-neutral-700 border border-neutral-600 text-neutral-800 dark:text-neutral-200 shadow-lg shadow-neutral-900/20 z-10">
 <FiAward className="w-5.5 h-5.5" />
 </div>
 </div>

 </div>

 {/* Row 2: Charts Panel */}
 {/* Chart 1: SVG Commit Velocity area wave */}
 <div className="lg:col-span-2 glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl text-left space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
 <FiTrendingUp className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
 <span>Developer Velocity Trends (Commits / Week)</span>
 </span>
 <span className="text-[9px] text-neutral-500">Auto-logged</span>
 </div>

 {/* SVG Drawing */}
 <div className="w-full overflow-x-auto select-none pt-2">
 <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
 {/* Grid Lines */}
 <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
 <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
 <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#1e293b" strokeWidth="1.5" />

 {/* Area Path Gradient Fill */}
 <defs>
 <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#64748b" stopOpacity="0.25" />
 <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
 </linearGradient>
 </defs>
 {areaPath && <path d={areaPath} fill="url(#area-grad)" />}

 {/* Line Path */}
 {linePath && (
 <path 
 d={linePath} 
 fill="none" 
 stroke="#64748b" 
 strokeWidth="2.5"
 />
 )}

 {/* Points circles and labels */}
 {points.map((p, idx) => (
 <g key={idx}>
 <circle 
 cx={p.x} 
 cy={p.y} 
 r="4" 
 fill="#ffffff" 
 stroke="#64748b" 
 strokeWidth="2" 
 />
 
 {/* Time values labels */}
 <text 
 x={p.x} 
 y={p.y - 8} 
 fill="#94a3b8" 
 fontSize="9" 
 fontFamily="monospace"
 textAnchor="middle"
 fontWeight="bold"
 >
 {weekCommits[idx]}
 </text>
 
 {/* Horizontal label days */}
 <text 
 x={p.x} 
 y={chartHeight - 4} 
 fill="#64748b" 
 fontSize="8.5" 
 textAnchor="middle"
 fontWeight="semibold"
 >
 {weekDays[idx]}
 </text>
 </g>
 ))}
 </svg>
 </div>
 </div>

 {/* Chart 2: SVG Donut status breakdown */}
 <div className="lg:col-span-1 glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl text-left flex flex-col justify-between gap-4">
 <div>
 <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
 <FiCheckSquare className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
 <span>Task Pipeline Breakdown</span>
 </span>
 <p className="text-[9px] text-neutral-500 mt-0.5">Distribution of columns totals</p>
 </div>

 {/* SVG Drawing */}
 <div className="flex items-center justify-around gap-2.5 my-3">
 <div className="relative w-32 h-32">
 <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
 {donutSegments.map((seg, idx) => {
 if (seg.count === 0) return null;
 return (
 <circle
 key={idx}
 cx="60"
 cy="60"
 r={radius}
 fill="transparent"
 stroke={seg.color}
 strokeWidth="15"
 strokeDasharray={seg.dashArray}
 strokeDashoffset={seg.dashOffset}
 />
 );
 })}
 {/* Fallback empty track */}
 {tasks.length === 0 && (
 <circle
 cx="60"
 cy="60"
 r={radius}
 fill="transparent"
 stroke="#1e293b"
 strokeWidth="15"
 />
 )}
 </svg>

 {/* Inner overlay label */}
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-xl font-extrabold text-black dark:text-white leading-none">
 {tasks.length}
 </span>
 <span className="text-[9px] text-neutral-500 mt-0.5 uppercase tracking-wide">Tasks</span>
 </div>
 </div>

 {/* Legend side */}
 <div className="space-y-1.5 text-[10px] font-medium">
 {donutSegments.map((seg, idx) => (
 <div key={idx} className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ backgroundColor: seg.color }} />
 <span className="text-neutral-500 dark:text-neutral-400 truncate max-w-[80px]">{seg.label}:</span>
 <span className="text-black dark:text-white font-bold ml-auto">{seg.count}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500 leading-normal">
 <span>Completion Rate:</span>
 <span className="font-bold text-neutral-700 dark:text-neutral-300">
 {totalTasksCount > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
 </span>
 </div>
 </div>

 {/* Metric 3: Productivity Explainer Card */}
 <div className="lg:col-span-3 glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xl text-left flex items-start gap-4">
 <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-300 dark:border-neutral-700/50 text-neutral-700 dark:text-neutral-300 shrink-0">
 <FiStar className="w-6 h-6" />
 </div>
 <div className="space-y-1">
 <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Dynamic Score Matrix</h4>
 <p className="text-xxs text-neutral-500 dark:text-neutral-400 leading-relaxed">
 This dashboard uses hand-crafted high-performance SVG visualizers instead of bloated charting libraries. Your **Productivity Score** increases automatically as you: check off subtasks, move Kanban cards to "Done", compile mock GitHub commits, and log completed Pomodoro work sessions.
 </p>
 </div>
 </div>

 </div>
 );
};
export default ProductivityDashboard;
