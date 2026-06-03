import React, { useState, useEffect } from 'react';
import type { Task, Priority, Subtask } from '../../types';
import { 
  FiX, FiTrash2, FiCalendar, FiTag, FiFlag, 
  FiCheckSquare, FiPlus, FiChevronDown, FiChevronRight,
  FiTarget, FiLink, FiList, FiPaperclip, FiImage
} from 'react-icons/fi';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    priority: Priority;
    tags: string[];
    subtasks: Subtask[];
    dueDate?: string;
    coverImage?: string;
    attachmentCount?: number;
  }) => void;
  task?: Task | null; // If editing, pass the task
}

// Status color mapping
const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  'backlog': { label: 'BACKLOG', bg: 'bg-neutral-600', text: 'text-white' },
  'todo': { label: 'TO DO', bg: 'bg-neutral-500', text: 'text-white' },
  'in-progress': { label: 'IN PROGRESS', bg: 'bg-blue-600', text: 'text-white' },
  'review': { label: 'REVIEW', bg: 'bg-yellow-500', text: 'text-black' },
  'done': { label: 'DONE', bg: 'bg-green-600', text: 'text-white' },
};

const priorityConfig: Record<Priority, { label: string; color: string; flag: string }> = {
  'urgent': { label: 'Urgent', color: 'text-red-500', flag: 'text-red-500' },
  'high': { label: 'High', color: 'text-orange-500', flag: 'text-orange-500' },
  'medium': { label: 'Medium', color: 'text-yellow-500', flag: 'text-yellow-500' },
  'low': { label: 'Low', color: 'text-blue-400', flag: 'text-blue-400' },
};

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [attachmentCount, setAttachmentCount] = useState<number>(0);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Sync state if task changes (editing mode)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setTagsInput(task.tags.join(', '));
      setSubtasks(task.subtasks);
      setCoverImage(task.coverImage || '');
      setAttachmentCount(task.attachmentCount || 0);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setTagsInput('');
      setSubtasks([]);
      setCoverImage('');
      setAttachmentCount(0);
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      const newSub: Subtask = {
        id: `sub-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        isCompleted: false
      };
      setSubtasks([...subtasks, newSub]);
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map(sub => sub.id === id ? { ...sub, isCompleted: !sub.isCompleted } : sub)
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(sub => sub.id !== id));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      tags: tagsArray,
      subtasks,
      dueDate: dueDate || undefined,
      coverImage: coverImage.trim() || undefined,
      attachmentCount: attachmentCount > 0 ? attachmentCount : undefined
    });
    
    onClose();
  };

  // Subtask progress
  const subTotal = subtasks.length;
  const subCompleted = subtasks.filter(s => s.isCompleted).length;
  const subPct = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;
  const subOpen = subTotal - subCompleted;

  const currentStatus = task ? statusConfig[task.columnId] || statusConfig['todo'] : statusConfig['todo'];
  const currentPriority = priorityConfig[priority];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal Box — ClickUp-style dark panel */}
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700/50 rounded-xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 cursor-pointer z-20 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* === Title Section === */}
          <div className="px-8 pt-7 pb-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full text-xl font-bold bg-transparent text-white placeholder-neutral-600 border-none outline-none focus:outline-none"
            />
          </div>

          {/* === Metadata Grid (2-column) === */}
          <div className="px-8 py-4 border-b border-neutral-800">
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-8">

              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiTarget className="w-3.5 h-3.5" />
                  Status
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${currentStatus.bg} ${currentStatus.text}`}>
                  {currentStatus.label}
                </span>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-4 relative">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiFlag className="w-3.5 h-3.5" />
                  Priority
                </span>
                <button
                  type="button"
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer hover:opacity-80 ${currentPriority.color}`}
                >
                  <FiFlag className={`w-3.5 h-3.5 ${currentPriority.flag}`} />
                  {currentPriority.label}
                  <FiChevronDown className="w-3 h-3" />
                </button>
                {showPriorityDropdown && (
                  <div className="absolute top-7 left-32 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-30 py-1 min-w-[120px]">
                    {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => { setPriority(p); setShowPriorityDropdown(false); }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-neutral-700 cursor-pointer ${priorityConfig[p].color}`}
                      >
                        <FiFlag className="w-3 h-3" />
                        {priorityConfig[p].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiCalendar className="w-3.5 h-3.5" />
                  Dates
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-xs bg-transparent text-neutral-300 border-none outline-none cursor-pointer [color-scheme:dark]"
                  />
                  {dueDate && (
                    <span className="text-[10px] text-neutral-500">Due</span>
                  )}
                  {!dueDate && (
                    <span className="text-xs text-neutral-600">Empty</span>
                  )}
                </div>
              </div>

              {/* Attachment Count */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiPaperclip className="w-3.5 h-3.5" />
                  Attachments
                </span>
                <input
                  type="number"
                  min="0"
                  value={attachmentCount || ''}
                  onChange={(e) => setAttachmentCount(parseInt(e.target.value) || 0)}
                  placeholder="Count..."
                  className="w-20 text-xs bg-transparent text-neutral-300 border-none outline-none focus:outline-none"
                />
              </div>

              {/* Cover Image URL */}
              <div className="flex items-center gap-4 col-span-2 border-t border-neutral-800/40 pt-3">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiImage className="w-3.5 h-3.5" />
                  Cover Image URL
                </span>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="flex-1 text-xs bg-transparent text-neutral-350 placeholder-neutral-600 border-none outline-none focus:outline-none"
                />
              </div>

              {/* Tags */}
              <div className="flex items-center gap-4 col-span-2">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiTag className="w-3.5 h-3.5" />
                  Tags
                </span>
                <input
                  type="text"
                  placeholder="Add tags (comma separated)..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="flex-1 text-xs bg-transparent text-neutral-300 placeholder-neutral-600 border-none outline-none focus:outline-none"
                />
              </div>

            </div>
          </div>

          {/* === Description Section === */}
          <div className="px-8 py-5 border-b border-neutral-800">
            <textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full text-sm bg-transparent text-neutral-300 placeholder-neutral-600 border-none outline-none resize-none leading-relaxed focus:outline-none"
            />
          </div>

          {/* === Fields Section (Progress) === */}
          {subTotal > 0 && (
            <div className="px-8 py-5 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <FiChevronDown className="w-3.5 h-3.5" />
                  Fields
                </h4>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiCheckSquare className="w-3.5 h-3.5" />
                  Progress
                </span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${subPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-400 font-medium w-10 text-right">{subPct}%</span>
                </div>
              </div>
            </div>
          )}

          {/* === Subtasks Section === */}
          <div className="px-8 py-5 border-b border-neutral-800">
            <button
              type="button"
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center gap-2 mb-3 cursor-pointer group"
            >
              {showSubtasks ? (
                <FiChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              ) : (
                <FiChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <h4 className="text-xs font-bold text-neutral-300">Subtasks</h4>
              {subTotal > 0 && (
                <>
                  <span className="text-[10px] text-neutral-500">{subOpen} open</span>
                  <span className="inline-block w-6 h-0.5 bg-neutral-700 rounded-full"></span>
                  {subCompleted > 0 && (
                    <span className="text-[10px] font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                      {subCompleted} done
                    </span>
                  )}
                </>
              )}
            </button>

            {showSubtasks && (
              <div className="space-y-1.5 ml-5">
                {/* Existing subtasks */}
                {subtasks.map(sub => (
                  <div 
                    key={sub.id} 
                    className="flex items-center justify-between group/item py-1.5 px-2 -mx-2 rounded-lg hover:bg-neutral-800/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(sub.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                          sub.isCompleted 
                            ? 'bg-green-600 border-green-600' 
                            : 'border-neutral-600 hover:border-neutral-400'
                        }`}
                      >
                        {sub.isCompleted && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-xs ${sub.isCompleted ? 'line-through text-neutral-600' : 'text-neutral-300'}`}>
                        {sub.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 cursor-pointer transition-all"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add subtask input */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="w-4 h-4 rounded border-2 border-dashed border-neutral-700 flex items-center justify-center hover:border-neutral-500 cursor-pointer"
                  >
                    <FiPlus className="w-2.5 h-2.5 text-neutral-600" />
                  </button>
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask(e);
                      }
                    }}
                    className="flex-1 text-xs bg-transparent text-neutral-400 placeholder-neutral-600 border-none outline-none focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* === Quick Action Links === */}
          <div className="px-8 py-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">
              <FiLink className="w-3.5 h-3.5" />
              <span>Relate items or add dependencies</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">
              <FiList className="w-3.5 h-3.5" />
              <span>Create checklist</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">
              <FiPaperclip className="w-3.5 h-3.5" />
              <span>Attach file</span>
            </div>
          </div>

        </div>

        {/* === Footer Actions === */}
        <div className="px-8 py-4 border-t border-neutral-800 bg-neutral-900/80 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-700 hover:bg-neutral-800 text-xs font-semibold rounded-lg text-neutral-400 hover:text-white cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg text-white cursor-pointer transition-colors shadow-lg shadow-blue-900/30"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
