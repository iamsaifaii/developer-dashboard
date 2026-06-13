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
  FiGitBranch,
  FiArrowRight,
  FiAlertTriangle
} from 'react-icons/fi';

const STAGE_ADVANCE_MAP: Record<string, { target: string; label: string; styles: string }> = {
  'todo': {
    target: 'in-progress',
    label: 'In Progress',
    styles: 'border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
  },
  'in-progress': {
    target: 'review',
    label: 'Review',
    styles: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20'
  },
  'review': {
    target: 'done',
    label: 'Complete',
    styles: 'border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20'
  }
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask, currentUser, moveTask, settings, currentTime } = useStore();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getDeadlineStatus = (task: Task): 'overdue' | 'due-today' | 'upcoming' | 'none' => {
    if (!task.dueDate || task.columnId === 'done') return 'none';
    const now = new Date(currentTime);
    const due = new Date(task.dueDate);
    if (due < now) return 'overdue';
    if (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    ) {
      return 'due-today';
    }
    return 'upcoming';
  };

  const renderCalendarPill = () => {
    const status = getDeadlineStatus(task);
    if (task.dueDate) {
      if (status === 'overdue') {
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-red-500/40 bg-red-950/40 text-[9px] font-bold text-red-400 shadow-sm shrink-0 animate-pulse">
            <FiAlertTriangle className="w-3 h-3 text-red-400" />
            <span>Overdue</span>
          </div>
        );
      }
      if (status === 'due-today') {
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/30 text-[9px] font-bold text-amber-400 shadow-sm shrink-0">
            <FiCalendar className="w-3 h-3 text-amber-400" />
            <span>Today</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/20 bg-white dark:bg-zinc-900 text-[9px] font-bold text-emerald-400 shadow-sm shrink-0">
          <FiCalendar className="w-3 h-3 text-emerald-400" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      );
    }
    return (
      <div className="p-1.5 rounded border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-500 dark:text-zinc-500 shadow-sm shrink-0 flex items-center justify-center">
        <FiCalendar className="w-3 h-3" />
      </div>
    );
  };

  const renderPriorityPill = () => {
    if (task.priority === 'urgent' || task.priority === 'high') {
      const isUrgent = task.priority === 'urgent';
      return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border bg-white dark:bg-zinc-900 text-[9px] font-bold shadow-sm shrink-0 ${isUrgent ? 'text-red-400 border-red-500/30' : 'text-yellow-400 border-yellow-500/30'
          }`}>
          <FiFlag className={`w-3 h-3 ${isUrgent ? 'text-red-400 fill-red-400/20' : 'text-yellow-400 fill-yellow-400/20'}`} />
          <span>{isUrgent ? 'Urgent' : 'High'}</span>
        </div>
      );
    }

    // Medium / Low priority (just a flag in a box)
    return (
      <div className="p-1.5 rounded border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-500 dark:text-zinc-500 shadow-sm shrink-0 flex items-center justify-center">
        <FiFlag className="w-3 h-3 text-neutral-500 dark:text-zinc-500" />
      </div>
    );
  };

  // Safe fallback avatar using Dicebear initials API
  const avatarUrl = settings.avatarUrl || currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(settings.userName || currentUser?.displayName || 'Developer')}`;

  // Use the cover image URL if set, or auto-detect the first attached image to display as cover
  const coverImageSrc = task.coverImage || task.attachments?.find(a => a.type.startsWith('image/'))?.url;

  const deadlineStatus = getDeadlineStatus(task);
  const isOverdue = deadlineStatus === 'overdue';

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart as any}
      onClick={() => onEdit(task)}
      className={`group rounded-xl border bg-neutral-50 dark:bg-[#080809] transition-all duration-200 cursor-grab active:cursor-grabbing text-left select-none relative overflow-hidden flex flex-col w-full card-lift ${
        isOverdue
          ? 'border-red-500/50 hover:border-red-400/70 shadow-[0_4px_16px_rgba(239,68,68,0.1)]'
          : 'border-neutral-200 dark:border-zinc-800 hover:border-neutral-300 dark:border-zinc-700 shadow-sm'
      }`}
    >
      {/* Overdue Banner Strip */}
      {isOverdue && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 border-b border-red-500/30">
          <FiAlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
          <span className="text-[9px] font-extrabold text-red-400 uppercase tracking-widest">Overdue</span>
        </div>
      )}
      {/* Cover Image */}
      {coverImageSrc && (
        <div className="w-full h-32 overflow-hidden border-b border-neutral-200 dark:border-zinc-800">
          <img
            src={coverImageSrc}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt={task.title}
          />
        </div>
      )}

      {/* Content area */}
      <div className="p-3.5 flex flex-col gap-3">
        {/* Title */}
        <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white leading-snug tracking-wide transition-colors">
          {task.title}
        </h4>

        {/* Attachment & Description Indicators */}
        {(() => {
          const finalAttachmentCount = task.attachments?.length || task.attachmentCount || 0;
          const hasAttachments = finalAttachmentCount > 0;
          const hasDescription = task.description && task.description.trim().length > 0;

          if (!hasAttachments && !hasDescription) return null;

          return (
            <div className="flex items-center gap-3 text-neutral-500 dark:text-zinc-500 text-[10px] font-medium">
              {hasAttachments && (
                <span className="flex items-center gap-1.5">
                  <FiPaperclip className="w-3 h-3" />
                  <span>{finalAttachmentCount}</span>
                </span>
              )}
              {hasDescription && (
                <span className="flex items-center text-zinc-600">
                  <FiAlignLeft className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          );
        })()}

        {/* Subtask Status */}
        {task.subtasks.length > 0 && (
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-500 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
            <FiGitBranch className="w-3 h-3 text-zinc-600" />
            <span>{task.subtasks.filter(st => st.isCompleted).length} / {task.subtasks.length} Subtasks</span>
          </div>
        )}

        {/* Bottom row: user, due, priority, tags */}
        <div className="flex items-center gap-2 mt-1">
          {/* User Profile Avatar */}
          <img
            src={avatarUrl}
            className="w-6 h-6 rounded-md border border-neutral-300 dark:border-zinc-700 object-cover shrink-0 shadow-sm"
            alt="Assignee"
          />

          {/* Calendar Pill */}
          {renderCalendarPill()}

          {/* Priority Pill */}
          {renderPriorityPill()}

          {/* Tag Pill */}
          <div className="p-1.5 rounded border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-500 dark:text-zinc-500 hover:text-neutral-600 dark:text-zinc-400 transition-colors shadow-sm cursor-pointer shrink-0 flex items-center justify-center">
            <FiTag className="w-3 h-3" />
          </div>

          {/* Delete Action (visible on hover) */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
              className="p-1.5 text-neutral-500 dark:text-zinc-500 hover:text-red-400 hover:bg-white dark:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
              title="Delete Task"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Move to Next Stage Button (Mobile Phone view only) */}
        {STAGE_ADVANCE_MAP[task.columnId] && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveTask(task.id, STAGE_ADVANCE_MAP[task.columnId].target);
            }}
            className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[9px] font-bold uppercase tracking-widest cursor-pointer md:hidden transition-all shadow-sm ${STAGE_ADVANCE_MAP[task.columnId].styles}`}
            title={`Move to ${STAGE_ADVANCE_MAP[task.columnId].label}`}
          >
            <span>Move to {STAGE_ADVANCE_MAP[task.columnId].label}</span>
            <FiArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
