import React from 'react';
import type { Task } from '../../types';
import { useStore } from '../../store/useStore';
import { 
 FiCalendar, 
 FiCheckSquare, 
 FiTrash2, 
 FiEdit2, 
 FiAlertCircle,
 FiArrowRight 
} from 'react-icons/fi';
import { GithubIcon } from '../BrandIcons';

interface TaskCardProps {
 task: Task;
 onEdit: (task: Task) => void;
}

// Pipeline order for stage progression
const PIPELINE_ORDER = ['backlog', 'todo', 'in-progress', 'review', 'done'];

const nextStageConfig: Record<string, { label: string; color: string; bg: string }> = {
  'backlog': { label: 'To Do', color: 'text-neutral-400', bg: 'hover:bg-neutral-200 dark:hover:bg-neutral-700' },
  'todo': { label: 'In Progress', color: 'text-blue-500', bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/30' },
  'in-progress': { label: 'Review', color: 'text-yellow-500', bg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30' },
  'review': { label: 'Done', color: 'text-green-500', bg: 'hover:bg-green-50 dark:hover:bg-green-900/30' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
 const { deleteTask, moveTask } = useStore();

 const getNextColumn = () => {
    const currentIndex = PIPELINE_ORDER.indexOf(task.columnId);
    if (currentIndex < 0 || currentIndex >= PIPELINE_ORDER.length - 1) return null;
    return PIPELINE_ORDER[currentIndex + 1];
  };

  const handleMoveToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCol = getNextColumn();
    if (nextCol) moveTask(task.id, nextCol);
  };

  const nextColumn = getNextColumn();
  const nextConfig = task.columnId !== 'done' ? nextStageConfig[task.columnId] : null;

 const getPriorityColorClass = () => {
 switch (task.priority) {
 case 'high': return 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700';
 case 'medium': return 'bg-neutral-100 dark:bg-neutral-800/30 text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700';
 case 'low': return 'bg-white dark:bg-black text-neutral-500 border-neutral-200 dark:border-neutral-800';
 }
 };

 const getSubtaskStats = () => {
 const total = task.subtasks.length;
 const completed = task.subtasks.filter(s => s.isCompleted).length;
 const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
 return { total, completed, percentage };
 };

 const { total: subTotal, completed: subCompleted, percentage: subPct } = getSubtaskStats();

 const isOverdue = () => {
 if (!task.dueDate || task.columnId === 'done') return false;
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const due = new Date(task.dueDate);
 due.setHours(0, 0, 0, 0);
 return due < today;
 };

 const formatDate = (dateStr?: string) => {
 if (!dateStr) return '';
 const date = new Date(dateStr);
 return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
 };

 const handleDragStart = (e: React.DragEvent) => {
 e.dataTransfer.setData('text/plain', task.id);
 e.dataTransfer.effectAllowed = 'move';
 };

 return (
 <div
 draggable="true"
 onDragStart={handleDragStart as any}
 className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/50 hover:bg-white dark:bg-black hover:border-neutral-300 dark:border-neutral-700/80 shadow-md cursor-grab active:cursor-grabbing text-left group select-none relative"
 title="Drag to rearrange columns"
 >
 {/* Top section: Priority and actions */}
 <div className="flex items-center justify-between gap-2 mb-2.5">
 <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColorClass()}`}>
 {task.priority}
 </span>
 
 {/* Action icons (show on hover) */}
 <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100">
 <button
 onClick={() => onEdit(task)}
 className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 rounded hover:bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
 title="Edit Task"
 >
 <FiEdit2 className="w-3 h-3" />
 </button>
 <button
 onClick={() => deleteTask(task.id)}
 className="p-1 text-neutral-500 hover:text-neutral-400 rounded hover:bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
 title="Delete Task"
 >
 <FiTrash2 className="w-3 h-3" />
 </button>
 </div>
 </div>

 {/* Task Title */}
 <h4 className="text-xs font-semibold text-black dark:text-neutral-100 group-hover:text-black dark:text-white leading-snug">
 {task.title}
 </h4>

 {/* Task Description */}
 {task.description && (
 <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed font-light">
 {task.description.replace(/[#*`\-]/g, '')}
 </p>
 )}

 {/* Progress checklist bar (if any subtasks exist) */}
 {subTotal > 0 && (
 <div className="mt-3.5 space-y-1">
 <div className="flex items-center justify-between text-[9px] text-neutral-500">
 <span className="flex items-center gap-1">
 <FiCheckSquare className="w-3 h-3 text-neutral-500" />
 <span>Checklist</span>
 </span>
 <span>{subCompleted}/{subTotal} ({subPct}%)</span>
 </div>
 <div className="w-full h-1 bg-white dark:bg-black rounded-full overflow-hidden">
 <div 
 className="h-full bg-neutral-500 rounded-full"
 style={{ width: `${subPct}%` }}
 />
 </div>
 </div>
 )}

 {/* Bottom Metadata Panel */}
 <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800/50 flex flex-wrap items-center justify-between gap-2.5">
 {/* Tags */}
 <div className="flex items-center gap-1.5 overflow-x-hidden flex-1">
 {task.tags.slice(0, 2).map((tag) => (
 <span 
 key={tag}
 className="text-[9px] px-1.5 py-0.5 rounded text-neutral-500 dark:text-neutral-400 bg-white dark:bg-black border border-neutral-300 dark:border-black truncate"
 >
 {tag}
 </span>
 ))}
 {task.tags.length > 2 && (
 <span className="text-[8px] text-neutral-500 font-bold">
 +{task.tags.length - 2}
 </span>
 )}
 </div>

 {/* Due date / GitHub indicators */}
 <div className="flex items-center gap-2 shrink-0">
 {/* GitHub Issue link */}
 {task.githubIssueNumber && (
 <a
 href={task.githubIssueUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="p-1 rounded text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 hover:bg-white dark:bg-black/80"
 title={`Simulated GitHub Issue #${task.githubIssueNumber}`}
 onClick={(e) => e.stopPropagation()} // Prevent trigger edit
 >
 <GithubIcon className="w-3.5 h-3.5" />
 </a>
 )}

 {/* Due date */}
 {task.dueDate && (
 <div 
 className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
 isOverdue()
 ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-600'
 : 'bg-white dark:bg-black text-neutral-500 border-neutral-300 dark:border-black'
 }`}
 >
 {isOverdue() ? (
 <FiAlertCircle className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
 ) : (
 <FiCalendar className="w-3.5 h-3.5" />
 )}
 <span>{formatDate(task.dueDate)}</span>
 </div>
 )}
 </div>
 </div>

 {/* Move to Next Stage Button */}
 {nextColumn && nextConfig && (
 <button
 onClick={handleMoveToNext}
 className={`mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${nextConfig.color} ${nextConfig.bg} bg-transparent`}
 title={`Move to ${nextConfig.label}`}
 >
 <span>Move to {nextConfig.label}</span>
 <FiArrowRight className="w-3 h-3" />
 </button>
 )}
 </div>
 );
};
export default TaskCard;
