import React from 'react';
import type { Task } from '../../types';
import { useStore } from '../../store/useStore';
import { 
  FiCheckCircle, 
  FiCalendar, 
  FiFlag,
  FiTrash2,
  FiUser
} from 'react-icons/fi';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask, currentUser, settings } = useStore();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    
    // Quick check if it's yesterday, today, tomorrow to match ClickUp style
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (d1: Date, d2: Date) => 
      d1.getFullYear() === d2.getFullYear() && 
      d1.getMonth() === d2.getMonth() && 
      d1.getDate() === d2.getDate();

    if (isSameDay(date, yesterday)) return <span className="text-red-400 font-medium">Yesterday</span>;
    if (isSameDay(date, today)) return <span className="text-green-400 font-medium">Today</span>;
    if (isSameDay(date, tomorrow)) return <span className="text-yellow-400 font-medium">Tomorrow</span>;

    return <span className="text-zinc-400">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>;
  };

  const renderPriority = () => {
    if (!task.priority) return '-';
    const isUrgent = task.priority === 'urgent';
    const isHigh = task.priority === 'high';
    const isNormal = task.priority === 'medium';
    
    let colorClass = 'text-zinc-500';
    if (isUrgent) colorClass = 'text-red-500 fill-red-500/20';
    else if (isHigh) colorClass = 'text-yellow-500 fill-yellow-500/20';
    else if (isNormal) colorClass = 'text-blue-500 fill-blue-500/20';

    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 capitalize">
        <FiFlag className={`w-3.5 h-3.5 ${colorClass}`} />
        <span>{task.priority === 'medium' ? 'Normal' : task.priority}</span>
      </div>
    );
  };

  const avatarUrl = settings.avatarUrl || currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(settings.userName || currentUser?.displayName || 'Developer')}`;

  return (
    <div
      onClick={() => onEdit(task)}
      className="group grid grid-cols-[minmax(250px,1fr)_120px_120px_100px_40px] items-center border-b border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition-colors cursor-pointer"
    >
      {/* Name Column */}
      <div className="py-2.5 px-4 flex items-center gap-3 border-r border-zinc-800/50">
        <button 
          className="text-zinc-500 hover:text-green-500 transition-colors shrink-0"
          title="Mark complete"
          onClick={(e) => {
            // Note: Completing task logic can be added later
            e.stopPropagation(); 
          }}
        >
          <FiCheckCircle className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
          {task.title}
        </span>
      </div>

      {/* Assignee Column */}
      <div className="py-2.5 px-4 border-r border-zinc-800/50 flex items-center">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            className="w-5 h-5 rounded-full object-cover ring-2 ring-zinc-900" 
            alt="Assignee"
          />
        ) : (
          <div className="w-5 h-5 rounded-full border border-dashed border-zinc-600 flex items-center justify-center text-zinc-500">
            <FiUser className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Due Date Column */}
      <div className="py-2.5 px-4 border-r border-zinc-800/50 flex items-center text-[11px]">
        {task.dueDate ? (
          formatDate(task.dueDate)
        ) : (
          <FiCalendar className="w-3.5 h-3.5 text-zinc-600" />
        )}
      </div>

      {/* Priority Column */}
      <div className="py-2.5 px-4 border-r border-zinc-800/50 flex items-center">
        {renderPriority()}
      </div>

      {/* Actions / + Column */}
      <div className="py-2.5 px-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
          title="Delete Task"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
