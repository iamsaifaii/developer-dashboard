import React, { useState } from 'react';
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
  FiChevronDown,
  FiCircle,
  FiCheck,
  FiCheckCircle
} from 'react-icons/fi';

const STATUS_GROUPS = [
  {
    label: 'Not started',
    items: [
      { id: 'backlog', label: 'BACKLOG', color: 'text-zinc-500', bg: 'bg-zinc-800 text-zinc-300' },
      { id: 'todo', label: 'TO DO', color: 'text-zinc-400', bg: 'bg-zinc-700 text-white' }
    ]
  },
  {
    label: 'Active',
    items: [
      { id: 'in-progress', label: 'IN PROGRESS', color: 'text-[#7B61FF]', bg: 'bg-[#5b21b6] text-white' },
      { id: 'review', label: 'RVIEW', color: 'text-[#ca8a04]', bg: 'bg-[#ca8a04] text-white' }
    ]
  },
  {
    label: 'Closed',
    items: [
      { id: 'done', label: 'COMPLETE', color: 'text-[#16a34a]', bg: 'bg-[#16a34a] text-white' }
    ]
  }
];

const getFlatColumns = () => STATUS_GROUPS.flatMap(g => g.items);

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask, currentUser, moveTask, settings } = useStore();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [statusSearch, setStatusSearch] = useState('');

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
        <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-950 text-[9px] font-bold text-zinc-300 shadow-sm shrink-0">
          <FiCalendar className="w-3 h-3 text-zinc-400" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      );
    }
    return (
      <div className="p-1 rounded border border-zinc-800 bg-zinc-950 text-zinc-550 shadow-sm shrink-0">
        <FiCalendar className="w-3 h-3" />
      </div>
    );
  };

  const renderPriorityPill = () => {
    if (task.priority === 'urgent' || task.priority === 'high') {
      const isUrgent = task.priority === 'urgent';
      return (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded border bg-zinc-950 text-[9px] font-bold shadow-sm shrink-0 ${
          isUrgent ? 'text-white border-zinc-700' : 'text-zinc-200 border-zinc-800'
        }`}>
          <FiFlag className={`w-3 h-3 ${isUrgent ? 'text-white fill-white' : 'text-zinc-300 fill-zinc-300'}`} />
          <span>{isUrgent ? 'Urgent' : 'High'}</span>
        </div>
      );
    }
    
    // Medium / Low priority (just a flag in a box)
    return (
      <div className="p-1.5 rounded border border-zinc-800 bg-zinc-950 text-zinc-550 shadow-sm shrink-0">
        <FiFlag className="w-3 h-3 text-zinc-500" />
      </div>
    );
  };

  // Safe fallback avatar using Dicebear initials API
  const avatarUrl = settings.avatarUrl || currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(settings.userName || currentUser?.displayName || 'Developer')}`;

  // Use the cover image URL if set, or auto-detect the first attached image to display as cover
  const coverImageSrc = task.coverImage || task.attachments?.find(a => a.type.startsWith('image/'))?.url;

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart as any}
      onClick={() => onEdit(task)}
      className="group rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-all duration-200 shadow-lg cursor-grab active:cursor-grabbing text-left select-none relative overflow-hidden flex flex-col w-full"
    >
      {/* Cover Image */}
      {coverImageSrc && (
        <div className="w-full h-32 overflow-hidden border-b border-zinc-850">
          <img 
            src={coverImageSrc} 
            className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-103" 
            alt={task.title}
          />
        </div>
      )}

      {/* Content area */}
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          {/* Title */}
          <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white leading-snug tracking-wide flex-1">
            {task.title}
          </h4>

          {/* Status Dropdown */}
          <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${(getFlatColumns().find(c => c.id === task.columnId) || getFlatColumns()[1]).bg} shadow-sm border border-transparent hover:brightness-110`}
            >
              {(getFlatColumns().find(c => c.id === task.columnId) || getFlatColumns()[1]).label}
              <FiChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                <div className="absolute top-full right-0 md:-right-8 mt-1.5 w-60 bg-[#1e1e1e] border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col cursor-default">
                  
                  {/* Tabs */}
                  <div className="flex items-center p-2 gap-1 border-b border-zinc-800/50">
                    <button className="flex-1 py-1 bg-zinc-800 text-zinc-200 text-[10px] font-semibold rounded transition-colors">
                      Status
                    </button>
                    <button className="flex-1 py-1 text-zinc-500 hover:text-zinc-300 text-[10px] font-semibold rounded transition-colors">
                      Task Type
                    </button>
                  </div>

                  {/* Search */}
                  <div className="p-2 border-b border-zinc-800/50">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={statusSearch}
                        onChange={e => setStatusSearch(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-zinc-700 rounded py-1 px-2.5 text-[10px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] transition-all"
                      />
                    </div>
                  </div>

                  {/* Status List */}
                  <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
                    {STATUS_GROUPS.map(group => {
                      const filteredItems = group.items.filter(item => item.label.toLowerCase().includes(statusSearch.toLowerCase()));
                      if (filteredItems.length === 0) return null;

                      return (
                        <div key={group.label} className="mb-2">
                          <div className="px-3 py-1 flex items-center justify-between text-[10px] font-semibold text-zinc-400">
                            <span>{group.label}</span>
                            <span className="text-zinc-600 tracking-widest leading-none mt-1">...</span>
                          </div>
                          <div className="flex flex-col">
                            {filteredItems.map(item => {
                              const isSelected = item.id === task.columnId;
                              return (
                                <button
                                  key={item.id}
                                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                                    isSelected ? 'bg-zinc-800/80 text-zinc-200' : 'text-zinc-300 hover:bg-zinc-800/50'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTask(task.id, item.id);
                                    setShowStatusMenu(false);
                                    setStatusSearch('');
                                  }}
                                >
                                  {item.id === 'todo' || item.id === 'backlog' ? (
                                    <FiCircle className={`w-3.5 h-3.5 ${item.color}`} style={item.id === 'todo' ? { strokeDasharray: '2,2' } : {}} />
                                  ) : item.id === 'done' ? (
                                    <FiCheckCircle className={`w-3.5 h-3.5 ${item.color}`} />
                                  ) : (
                                    <div className={`w-3.5 h-3.5 rounded-full border-[3px] flex items-center justify-center shrink-0`} style={{ borderColor: item.color.match(/\[(.*?)\]/)?.[1] || 'currentColor' }} />
                                  )}
                                  <span className="flex-1">{item.label}</span>
                                  {isSelected && <FiCheck className="w-3.5 h-3.5 text-zinc-300 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Attachment & Description Indicators */}
        {(() => {
          const finalAttachmentCount = task.attachments?.length || task.attachmentCount || 0;
          const hasAttachments = finalAttachmentCount > 0;
          const hasDescription = task.description && task.description.trim().length > 0;
          
          if (!hasAttachments && !hasDescription) return null;
          
          return (
            <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-medium mt-0.5">
              {hasAttachments && (
                <span className="flex items-center gap-1">
                  <FiPaperclip className="w-3.5 h-3.5" />
                  <span>{finalAttachmentCount}</span>
                </span>
              )}
              {hasDescription && (
                <span className="flex items-center">
                  <FiAlignLeft className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          );
        })()}

        {/* Bottom row: user, due, priority, tags */}
        <div className="flex items-center gap-2 mt-1">
          {/* User Profile Avatar */}
          <img 
            src={avatarUrl} 
            className="w-5 h-5 rounded-full border border-zinc-800 object-cover shrink-0" 
            alt="Assignee"
          />

          {/* Calendar Pill */}
          {renderCalendarPill()}

          {/* Priority Pill */}
          {renderPriorityPill()}

          {/* Tag Pill */}
          <div className="p-1 rounded border border-zinc-800 bg-zinc-950 text-zinc-550 hover:text-zinc-400 transition-colors shadow-sm cursor-pointer shrink-0">
            <FiTag className="w-3 h-3" />
          </div>

          {/* Delete Action (visible on hover) */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
              className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded cursor-pointer transition-colors"
              title="Delete Task"
            >
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Subtask Status */}
        {task.subtasks.length > 0 && (
          <div className="flex items-center gap-1.5 text-[9px] font-semibold text-zinc-550 mt-0.5 tracking-wide">
            <FiGitBranch className="w-3.5 h-3.5 text-zinc-600" />
            <span>{task.subtasks.length} subtasks</span>
          </div>
        )}


      </div>
    </div>
  );
};

export default TaskCard;
