import React, { useState, useEffect, useRef } from 'react';
import type { Task, Priority, Subtask, TaskAttachment } from '../../types';
import { useStore } from '../../store/useStore';
import { 
  FiX, FiTrash2, FiCalendar, FiTag, FiFlag, 
  FiCheckSquare, FiPlus, FiChevronDown, FiChevronRight,
  FiTarget, FiLink, FiList, FiPaperclip, FiImage, FiFileText, FiEye
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
    attachments?: TaskAttachment[];
    dependencies?: string[];
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
  'medium': { label: 'Medium', color: 'text-yellow-500', flag: 'text-yellow-550' },
  'low': { label: 'Low', color: 'text-blue-400', flag: 'text-blue-400' },
};

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
  const { tasks } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [attachmentCount, setAttachmentCount] = useState<number>(0);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [dependencies, setDependencies] = useState<string[]>([]);
  
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showDependenciesDropdown, setShowDependenciesDropdown] = useState(false);
  const [fileWarning, setFileWarning] = useState<string | null>(null);

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
      setAttachments(task.attachments || []);
      setDependencies(task.dependencies || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setTagsInput('');
      setSubtasks([]);
      setCoverImage('');
      setAttachmentCount(0);
      setAttachments([]);
      setDependencies([]);
    }
    setFileWarning(null);
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

  // Checklist link helper
  const handleFocusChecklist = () => {
    setShowSubtasks(true);
    setTimeout(() => {
      const checklistInput = document.getElementById('subtask-input');
      if (checklistInput) {
        checklistInput.focus();
        checklistInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Trigger File picker
  const handleTriggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Process selected file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileWarning(null);

    Array.from(files).forEach((file) => {
      // Large file warning (warn if > 800KB due to Firestore 1MB document limit)
      if (file.size > 800 * 1024) {
        setFileWarning(`"${file.name}" is large (${(file.size / 1024 / 1024).toFixed(2)} MB). Files over 800KB might fail to sync to Firestore due to doc size limits.`);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          const newAttach: TaskAttachment = {
            name: file.name,
            type: file.type,
            size: file.size,
            url: base64Url
          };
          
          setAttachments(prev => {
            const next = [...prev, newAttach];
            // Auto update attachment count
            setAttachmentCount(next.length);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Delete attachment
  const handleDeleteAttachment = (indexToDelete: number) => {
    setAttachments(prev => {
      const next = prev.filter((_, idx) => idx !== indexToDelete);
      setAttachmentCount(next.length);
      return next;
    });
  };

  // Toggle dependency
  const handleToggleDependency = (taskId: string) => {
    if (dependencies.includes(taskId)) {
      setDependencies(dependencies.filter(id => id !== taskId));
    } else {
      setDependencies([...dependencies, taskId]);
    }
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
      attachmentCount: attachmentCount > 0 ? attachmentCount : undefined,
      attachments,
      dependencies
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

  // Filter out the current editing task from target dependencies
  const potentialDependencies = (tasks || []).filter(t => !task || t.id !== task.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Hidden file input for uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
        multiple
        accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
      />

      {/* Modal Box */}
      <div className="w-[calc(100%-2rem)] max-w-2xl mx-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh]">
        
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
          <div className="px-5 sm:px-8 pt-7 pb-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full text-xl font-bold bg-transparent text-white placeholder-neutral-600 border-none outline-none focus:outline-none"
            />
          </div>

          {/* === Metadata Grid === */}
          <div className="px-5 sm:px-8 py-4 border-b border-neutral-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 sm:gap-x-8">

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

              {/* Attachment Count Indicator */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiPaperclip className="w-3.5 h-3.5" />
                  Attachments
                </span>
                <span className="text-xs text-neutral-300">
                  {attachmentCount > 0 ? `${attachmentCount} files` : 'None'}
                </span>
              </div>

              {/* Tags Input */}
              <div className="flex items-center gap-4 sm:col-span-2">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiTag className="w-3.5 h-3.5" />
                  Tags
                </span>
                <input
                  type="text"
                  placeholder="Add tags (comma separated)..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="flex-1 text-xs bg-transparent text-neutral-300 placeholder-neutral-655 border-none outline-none focus:outline-none"
                />
              </div>

              {/* Cover Image URL */}
              <div className="flex items-center gap-4 sm:col-span-2 border-t border-neutral-800/40 pt-3.5">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiImage className="w-3.5 h-3.5" />
                  Cover Image URL
                </span>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="flex-1 text-xs bg-transparent text-neutral-300 placeholder-neutral-650 border-none outline-none focus:outline-none"
                />
              </div>

            </div>
          </div>

          {/* === Description Section === */}
          <div className="px-5 sm:px-8 py-5 border-b border-neutral-800/80">
            <textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full text-sm bg-transparent text-neutral-300 placeholder-neutral-655 border-none outline-none resize-none leading-relaxed focus:outline-none"
            />
          </div>

          {/* === Dependencies Selector / Display === */}
          {dependencies.length > 0 && (
            <div className="px-5 sm:px-8 py-4 border-b border-neutral-800/80 bg-neutral-900/40 flex flex-col gap-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-450 flex items-center gap-1.5">
                <FiLink className="w-3.5 h-3.5 text-neutral-500" />
                Related Dependencies
              </h4>
              <div className="flex flex-wrap gap-2">
                {dependencies.map((depId) => {
                  const depTask = tasks.find(t => t.id === depId);
                  return (
                    <div 
                      key={depId}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 border border-neutral-750 text-xxs text-neutral-300 shadow-sm"
                    >
                      <FiTarget className="w-3 h-3 text-neutral-500" />
                      <span className="truncate max-w-[140px] font-medium">
                        {depTask ? depTask.title : 'Deleted Task'}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleToggleDependency(depId)}
                        className="text-neutral-500 hover:text-red-400 cursor-pointer p-0.5"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* === Checklist Progress === */}
          {subTotal > 0 && (
            <div className="px-5 sm:px-8 py-5 border-b border-neutral-800/80">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400 w-28 shrink-0">
                  <FiCheckSquare className="w-3.5 h-3.5" />
                  Progress
                </span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                      style={{ width: `${subPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-400 font-medium w-10 text-right">{subPct}%</span>
                </div>
              </div>
            </div>
          )}

          {/* === Subtasks Checklist Section === */}
          <div className="px-5 sm:px-8 py-5 border-b border-neutral-800/80">
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
              <h4 className="text-xs font-bold text-neutral-300">Checklist Subtasks</h4>
              {subTotal > 0 && (
                <>
                  <span className="text-[10px] text-neutral-500">{subOpen} open</span>
                  <span className="inline-block w-6 h-0.5 bg-neutral-800 rounded-full"></span>
                  {subCompleted > 0 && (
                    <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
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
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                          sub.isCompleted 
                            ? 'bg-green-600 border-green-600 text-white' 
                            : 'border-neutral-700 hover:border-neutral-500'
                        }`}
                      >
                        {sub.isCompleted && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
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
                    className="w-4 h-4 rounded border border-dashed border-neutral-700 flex items-center justify-center hover:border-neutral-500 cursor-pointer"
                  >
                    <FiPlus className="w-2.5 h-2.5 text-neutral-500" />
                  </button>
                  <input
                    id="subtask-input"
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
                    className="flex-1 text-xs bg-transparent text-neutral-400 placeholder-neutral-650 border-none outline-none focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* === File Attachment Preview Section === */}
          {attachments.length > 0 && (
            <div className="px-5 sm:px-8 py-5 border-b border-neutral-800/80 bg-neutral-900/10">
              <h4 className="text-xs font-bold text-neutral-300 mb-3 flex items-center gap-1.5">
                <FiPaperclip className="w-4 h-4 text-neutral-400" />
                Attached Files ({attachments.length})
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((file, idx) => {
                  const isImage = file.type.startsWith('image/');
                  const isVideo = file.type.startsWith('video/');
                  const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                  
                  return (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-lg border border-neutral-800 bg-[#161618] hover:border-neutral-700 transition-colors flex flex-col gap-2 relative group/file"
                    >
                      {/* Media Preview */}
                      {isImage && (
                        <div className="w-full h-24 rounded overflow-hidden bg-neutral-950 border border-neutral-800 relative">
                          <img 
                            src={file.url} 
                            className="w-full h-full object-cover" 
                            alt={file.name}
                          />
                        </div>
                      )}

                      {isVideo && (
                        <div className="w-full h-24 rounded overflow-hidden bg-neutral-950 border border-neutral-800 relative">
                          <video 
                            src={file.url} 
                            className="w-full h-full object-cover" 
                            controls
                          />
                        </div>
                      )}

                      {!isImage && !isVideo && (
                        <div className="w-full h-24 rounded bg-neutral-950 border border-neutral-850 flex items-center justify-center text-neutral-500">
                          <FiFileText className="w-10 h-10 text-neutral-600" />
                        </div>
                      )}

                      {/* File Info */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-semibold text-neutral-300 truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[9px] text-neutral-500">
                          {sizeMB} MB • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </div>

                      {/* Overlay Controls */}
                      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                        <a 
                          href={file.url} 
                          download={file.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                          title="Open/Download"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </a>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteAttachment(idx)}
                          className="p-1 rounded bg-neutral-900/80 hover:bg-red-900/80 text-neutral-400 hover:text-red-400 cursor-pointer"
                          title="Remove Attachment"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* === File warning banner if present === */}
          {fileWarning && (
            <div className="mx-5 sm:mx-8 mt-4 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-xxs leading-relaxed">
              {fileWarning}
            </div>
          )}

          {/* === Quick Action Links (Workable) === */}
          <div className="px-5 sm:px-8 py-5 space-y-2.5">
            {/* Relate items action */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDependenciesDropdown(!showDependenciesDropdown)}
                className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-350 cursor-pointer transition-colors w-full text-left"
              >
                <FiLink className="w-3.5 h-3.5" />
                <span>Relate items or add dependencies ({dependencies.length} linked)</span>
              </button>

              {showDependenciesDropdown && (
                <div className="absolute left-0 bottom-6 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-30 py-1.5 min-w-[280px] max-h-48 overflow-y-auto mt-1 custom-scrollbar">
                  <div className="px-2.5 py-1 text-[9px] font-bold text-neutral-500 border-b border-neutral-700/50 uppercase tracking-wide">Select Tasks to Relate</div>
                  {potentialDependencies.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-neutral-500 italic">No other tasks available to link.</div>
                  ) : (
                    potentialDependencies.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleToggleDependency(t.id)}
                        className="w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-neutral-700 cursor-pointer text-neutral-300"
                      >
                        <span className="truncate max-w-[200px]">{t.title}</span>
                        {dependencies.includes(t.id) && (
                          <span className="text-[10px] text-green-500 font-bold font-mono">✓</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Checklist action */}
            <button
              type="button"
              onClick={handleFocusChecklist}
              className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-350 cursor-pointer transition-colors w-full text-left"
            >
              <FiList className="w-3.5 h-3.5" />
              <span>Create checklist</span>
            </button>

            {/* File upload action */}
            <button
              type="button"
              onClick={handleTriggerFilePicker}
              className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-350 cursor-pointer transition-colors w-full text-left"
            >
              <FiPaperclip className="w-3.5 h-3.5" />
              <span>Attach file (Images, Videos, PDFs, Docs)</span>
            </button>
          </div>

        </div>

        {/* === Footer Actions === */}
        <div className="px-5 sm:px-8 py-4 border-t border-neutral-800 bg-neutral-900/80 flex justify-end gap-3">
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
