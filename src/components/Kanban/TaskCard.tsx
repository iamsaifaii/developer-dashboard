import React from 'react';
import type { Task } from '../../types';
import { useStore } from '../../store/useStore';
import { 
  FiCalendar, 
  FiTrash2, 
  FiPaperclip,
  FiAlignLeft,
  FiFlag,
  FiTag,
  FiGitBranch
} from 'react-icons/fi';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask, currentUser } = useStore();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const renderCalendarPill = () => {
    if (task.dueDate) {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/20 bg-neutral-900/60 text-[9px] font-bold text-emerald-400 shadow-sm shrink-0">
          <FiCalendar className="w-3 h-3 text-emerald-400" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      );
    }
    return (
      <div className="p-1 rounded border border-neutral-800 bg-neutral-900/60 text-neutral-500 shadow-sm shrink-0">
        <FiCalendar className="w-3 h-3" />
      </div>
    );
  };

  const renderPriorityPill = () => {
    if (task.priority === 'urgent' || task.priority === 'high') {
      const isUrgent = task.priority === 'urgent';
      return (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded border bg-neutral-900/60 text-[9px] font-bold shadow-sm shrink-0 ${
          isUrgent ? 'text-red-400 border-red-500/20' : 'text-yellow-400 border-yellow-500/20'
        }`}>
          <FiFlag className={`w-3 h-3 ${isUrgent ? 'text-red-400 fill-red-400' : 'text-yellow-400 fill-yellow-400'}`} />
          <span>{isUrgent ? 'Urgent' : 'High'}</span>
        </div>
      );
    }
    
    // Medium / Low priority (just a flag in a box)
    return (
      <div className="p-1.5 rounded border border-neutral-800 bg-neutral-900/60 text-neutral-500 shadow-sm shrink-0">
        <FiFlag className="w-3 h-3 text-neutral-500" />
      </div>
    );
  };

  // Safe fallback avatar using Dicebear initials API
  const avatarUrl = currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.displayName || 'Developer')}`;

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart as any}
      onClick={() => onEdit(task)}
      className="group rounded-xl border border-neutral-800 bg-[#161618] hover:border-neutral-700 transition-all duration-200 shadow-lg cursor-grab active:cursor-grabbing text-left select-none relative overflow-hidden flex flex-col w-full"
    >
      {/* Cover Image */}
      {task.coverImage && (
        <div className="w-full h-32 overflow-hidden border-b border-neutral-800">
          <img 
            src={task.coverImage} 
            className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-103" 
            alt={task.title}
          />
        </div>
      )}

      {/* Content area */}
      <div className="p-3.5 flex flex-col gap-2.5">
        {/* Title */}
        <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-white leading-snug tracking-wide">
          {task.title}
        </h4>

        {/* Attachment & Description Indicators */}
        {((task.attachmentCount !== undefined && task.attachmentCount > 0) || (task.description && task.description.trim().length > 0)) && (
          <div className="flex items-center gap-3 text-neutral-500 text-[10px] font-medium mt-0.5">
            {task.attachmentCount !== undefined && task.attachmentCount > 0 && (
              <span className="flex items-center gap-1">
                <FiPaperclip className="w-3.5 h-3.5" />
                <span>{task.attachmentCount}</span>
              </span>
            )}
            {task.description && task.description.trim().length > 0 && (
              <span className="flex items-center">
                <FiAlignLeft className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        )}

        {/* Bottom row: user, due, priority, tags */}
        <div className="flex items-center gap-2 mt-1">
          {/* User Profile Avatar */}
          <img 
            src={avatarUrl} 
            className="w-5 h-5 rounded-full border border-neutral-700 object-cover shrink-0" 
            alt="Assignee"
          />

          {/* Calendar Pill */}
          {renderCalendarPill()}

          {/* Priority Pill */}
          {renderPriorityPill()}

          {/* Tag Pill */}
          <div className="p-1 rounded border border-neutral-800 bg-neutral-900/60 text-neutral-500 hover:text-neutral-400 transition-colors shadow-sm cursor-pointer shrink-0">
            <FiTag className="w-3 h-3" />
          </div>

          {/* Delete Action (visible on hover) */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
              className="p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded cursor-pointer transition-colors"
              title="Delete Task"
            >
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Subtask Status */}
        {task.subtasks.length > 0 && (
          <div className="flex items-center gap-1.5 text-[9px] font-semibold text-neutral-500 mt-0.5 tracking-wide">
            <FiGitBranch className="w-3.5 h-3.5 text-neutral-600" />
            <span>{task.subtasks.length} subtasks</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
