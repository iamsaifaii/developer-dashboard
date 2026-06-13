import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useDebounce } from '../../hooks/useDebounce';
import type { Task, Priority } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiArrowRight,
  FiStar,
  FiArchive,
  FiList,
  FiClock,
  FiEye,
  FiMoreHorizontal
} from 'react-icons/fi';
import { TrelloIcon, GithubIcon } from '../BrandIcons';
export const KanbanBoard: React.FC = () => {
  const {
    columns,
    tasks,
    addTask,
    updateTask,
    moveTask,
    githubConnected,
    githubIssues,
    importGithubIssue
  } = useStore();

  // Kanban view state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dueDateFilter, setDueDateFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tasks]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [activeColumnForNewTask, setActiveColumnForNewTask] = useState<string>('todo');

  // Resolve current editing task dynamically from store tasks array
  const editingTask = tasks.find(t => t.id === editingTaskId) || null;

  // Drag states
  const [isDragOverCol, setIsDragOverCol] = useState<string | null>(null);

  // GitHub import slide-out widget
  const [showGitDrawer, setShowGitDrawer] = useState(false);

  // Filters tasks based on Title/Description and Priority
  const getFilteredTasks = (colId: string) => {
    return (tasks || []).filter(task => {
      // 1. Column/Status check
      if (task.columnId !== colId) return false;
      if (statusFilter !== 'all' && task.columnId !== statusFilter) return false;

      // 2. Search check
      const q = debouncedSearchQuery.toLowerCase();
      const matchesSearch = !q ||
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.tags.some(tag => tag.toLowerCase().includes(q));

      // 3. Priority check
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      // 4. Tag check
      const matchesTag = tagFilter === 'all' || task.tags.includes(tagFilter);

      // 5. Due Date check
      let matchesDate = true;
      if (dueDateFilter !== 'all') {
        if (!task.dueDate) {
          matchesDate = false;
        } else {
          const due = new Date(task.dueDate);
          const now = new Date();
          now.setHours(0,0,0,0);
          due.setHours(0,0,0,0);
          
          if (dueDateFilter === 'overdue') {
            matchesDate = due < now && task.columnId !== 'done';
          } else if (dueDateFilter === 'today') {
            matchesDate = due.getTime() === now.getTime();
          } else if (dueDateFilter === 'week') {
            const nextWeek = new Date(now);
            nextWeek.setDate(now.getDate() + 7);
            matchesDate = due >= now && due <= nextWeek;
          }
        }
      }

      return matchesSearch && matchesPriority && matchesTag && matchesDate;
    });
  };

  // Triggered when adding task specifically to a column
  const handleAddNewTaskToColumn = (colId: string) => {
    setActiveColumnForNewTask(colId);
    setEditingTaskId(null);
    setIsModalOpen(true);
  };

  // Triggered when clicking Edit on a card
  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setIsModalOpen(true);
  };

  // Saves task (whether new or edited)
  const handleSaveTask = (taskData: {
    title: string;
    description: string;
    priority: Priority;
    tags: string[];
    subtasks: any[];
    dueDate?: string;
    coverImage?: string;
    attachmentCount?: number;
  }) => {
    if (editingTask) {
      // Edit mode
      updateTask(editingTask.id, taskData);
    } else {
      // Add mode
      const newTask = {
        title: taskData.title,
        description: taskData.description,
        columnId: activeColumnForNewTask,
        priority: taskData.priority,
        tags: taskData.tags,
        subtasks: taskData.subtasks,
        dueDate: taskData.dueDate,
        coverImage: taskData.coverImage,
        attachmentCount: taskData.attachmentCount
      };
      addTask(newTask);
    }
  };

  // Drag and Drop implementation
  const handleDragOver = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    setIsDragOverCol(targetColId);
  };

  const handleDragLeave = () => {
    setIsDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, targetColId);
    }
    setIsDragOverCol(null);
  };

  // Status-based color accents for column header/badges
  const getColumnHeaderBadge = (colId: string) => {
    switch (colId) {
      case 'backlog':
        return {
          label: 'BACKLOG',
          bg: 'bg-zinc-900 text-zinc-300 border border-zinc-800/80',
          icon: <FiArchive className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        };
      case 'todo':
        return {
          label: 'TO DO',
          bg: 'bg-zinc-800 text-white border border-zinc-700',
          icon: <FiList className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
        };
      case 'in-progress':
        return {
          label: 'IN PROGRESS',
          bg: 'bg-blue-600 text-white border border-blue-600',
          icon: <FiClock className="w-3.5 h-3.5 text-white shrink-0" />
        };
      case 'review':
        return {
          label: 'REVIEW',
          bg: 'bg-yellow-500 text-black border border-yellow-500',
          icon: <FiEye className="w-3.5 h-3.5 text-black shrink-0" />
        };
      case 'done':
        return {
          label: 'COMPLETE',
          bg: 'bg-green-600 text-white border border-green-600',
          icon: (
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white text-green-600 shrink-0">
              <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )
        };
      default:
        return {
          label: colId.toUpperCase(),
          bg: 'bg-zinc-800 text-white border border-zinc-700',
          icon: null
        };
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col gap-6 relative animate-fade-in-up">

      {/* 1. Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#080809] p-3 rounded-xl border border-zinc-900">

        {/* Search & Basic Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64 group">
            <FiSearch className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search board tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all shadow-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg border transition-colors shadow-sm ${
              showFilters 
                ? 'bg-zinc-800 border-zinc-700 text-white' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700'
            }`}
          >
            <FiFilter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(priorityFilter !== 'all' || statusFilter !== 'all' || dueDateFilter !== 'all' || tagFilter !== 'all') && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            )}
          </button>
        </div>

        {/* Global Board Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {githubConnected && githubIssues.length > 0 && (
            <button
              onClick={() => setShowGitDrawer(!showGitDrawer)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-lg border cursor-pointer transition-all shadow-sm ${showGitDrawer
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700'
                }`}
            >
              <GithubIcon className="w-4 h-4 shrink-0" />
              <span>Issues <span className="ml-1 bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-[10px]">{githubIssues.length}</span></span>
            </button>
          )}

          <button
            onClick={() => handleAddNewTaskToColumn('todo')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white hover:bg-zinc-200 text-black rounded-lg cursor-pointer shadow-sm transition-all btn-press"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-[#080809] p-4 rounded-xl border border-zinc-900 flex flex-wrap gap-4 panel-in z-10 shadow-lg">
          <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-[140px]">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
            >
              <option value="all">Any Status</option>
              {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-[140px]">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
            >
              <option value="all">Any Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-[140px]">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Due Date</label>
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
            >
              <option value="all">Any Date</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-[140px]">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tag</label>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
            >
              <option value="all">Any Tag</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </div>

          {(priorityFilter !== 'all' || statusFilter !== 'all' || dueDateFilter !== 'all' || tagFilter !== 'all') && (
            <div className="flex items-end pb-0.5 ml-auto">
              <button 
                onClick={() => {
                  setPriorityFilter('all');
                  setStatusFilter('all');
                  setDueDateFilter('all');
                  setTagFilter('all');
                }}
                className="text-xs font-medium text-zinc-500 hover:text-white px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Main Columns Display */}
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 select-none pr-1 snap-x scroll-smooth custom-scrollbar">
        {columns.map((col) => {
          const colTasks = getFilteredTasks(col.id);
          const isOver = isDragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-[320px] shrink-0 snap-start flex flex-col h-full rounded-2xl border transition-all duration-200 ${isOver
                  ? 'bg-zinc-900 border-zinc-600 shadow-2xl scale-[1.01]'
                  : 'bg-[#080809] border-zinc-900'
                }`}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-zinc-900">
                <div className="flex items-center gap-2.5">
                  {(() => {
                    const badge = getColumnHeaderBadge(col.id);
                    return (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase shadow-sm ${badge.bg}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </div>
                    );
                  })()}
                  <span className="text-xs font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAddNewTaskToColumn(col.id)}
                    className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
                    title={`Add task to ${col.title}`}
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-zinc-600 hover:text-zinc-400 rounded-lg hover:bg-zinc-900 cursor-pointer transition-colors">
                    <FiMoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards Container (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-zinc-800/80 rounded-xl flex flex-col items-center justify-center text-center p-4 text-zinc-500 bg-zinc-900/20">
                    <TrelloIcon className="w-6 h-6 opacity-30 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Empty Column</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. GitHub Drawer Import Panel (Slide-in) */}
      <>
        {showGitDrawer && (
          <>
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 rounded-2xl transition-opacity duration-300"
              onClick={() => setShowGitDrawer(false)}
            />
            {/* Panel */}
            <div
              className="absolute right-0 top-0 w-80 h-full bg-[#0a0a0a] border-l border-zinc-800 rounded-r-2xl p-5 shadow-2xl flex flex-col gap-4 z-40 animate-in slide-in-from-right-8 duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <GithubIcon className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">GitHub Issues</h4>
                </div>
                <button
                  onClick={() => setShowGitDrawer(false)}
                  className="text-zinc-500 hover:text-white text-xxs font-bold uppercase tracking-wider border border-zinc-800 hover:bg-zinc-800 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl flex items-start gap-2.5 text-left">
                <FiStar className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                  Import repository bugs and tasks directly to your sprint. Simply click an issue to ingest it into the <strong className="text-zinc-200">Backlog</strong>.
                </p>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {githubIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => importGithubIssue(issue.id, 'backlog')}
                    className="p-3.5 rounded-xl border border-zinc-800 bg-[#080809] hover:bg-zinc-900 hover:border-zinc-700 cursor-pointer text-left flex flex-col gap-2 group transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-zinc-300 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded shadow-sm">
                        {issue.repoName}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 font-mono">
                        #{issue.number}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-2 leading-snug">
                      {issue.title}
                    </h5>
                    <div className="flex justify-end items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-white mt-1 transition-colors">
                      <span>Import Issue</span>
                      <FiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </>

      {/* 4. Tasks configuration modal wrapper */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
};
export default KanbanBoard;
