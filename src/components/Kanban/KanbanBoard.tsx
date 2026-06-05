import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
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
  FiEye
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
      const matchesColumn = task.columnId === colId;
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchesColumn && matchesSearch && matchesPriority;
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
  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setIsDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setIsDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, colId);
    }
    setIsDragOverCol(null);
  };

  // Status-based color accents for column header/badges
  const getColumnHeaderBadge = (colId: string) => {
    switch (colId) {
      case 'backlog':
        return {
          label: 'BACKLOG',
          bg: 'bg-neutral-800 text-neutral-300 border border-neutral-700/50',
          icon: <FiArchive className="w-3 h-3 text-neutral-400 shrink-0" />
        };
      case 'todo':
        return {
          label: 'TO DO',
          bg: 'bg-neutral-700 text-white border border-neutral-600/50',
          icon: <FiList className="w-3 h-3 text-neutral-350 shrink-0" />
        };
      case 'in-progress':
        return {
          label: 'IN PROGRESS',
          bg: 'bg-blue-600 text-white border border-blue-500/20',
          icon: <FiClock className="w-3.5 h-3.5 text-blue-100 shrink-0" />
        };
      case 'review':
        return {
          label: 'REVIEW',
          bg: 'bg-yellow-500 text-black border border-yellow-400/20',
          icon: <FiEye className="w-3.5 h-3.5 text-black shrink-0" />
        };
      case 'done':
        return {
          label: 'COMPLETE',
          bg: 'bg-green-600 text-white border border-green-500/20',
          icon: (
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white text-green-600 shrink-0">
              <svg className="w-2 h-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )
        };
      default:
        return {
          label: colId.toUpperCase(),
          bg: 'bg-neutral-700 text-white border border-neutral-600',
          icon: null
        };
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col gap-5 relative">

      {/* 1. Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

        {/* Search & Priority Filter */}
        <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <FiSearch className="w-4 h-4 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search board tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-800/80 text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-44 flex items-center">
            <FiFilter className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-800/80 text-neutral-350 focus:outline-none focus:border-neutral-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Global Board Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {githubConnected && githubIssues.length > 0 && (
            <button
              onClick={() => setShowGitDrawer(!showGitDrawer)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border cursor-pointer  ${showGitDrawer
                  ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-600 text-neutral-700 dark:text-neutral-300'
                  : 'bg-white dark:bg-black/40 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200'
                }`}
            >
              <GithubIcon className="w-4 h-4" />
              <span>Import Issues ({githubIssues.length})</span>
            </button>
          )}

          <button
            onClick={() => handleAddNewTaskToColumn('todo')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white rounded-lg cursor-pointer shadow-lg shadow-neutral-900/10"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 2. Main Columns Display */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 select-none pr-1">
        {columns.map((col) => {
          const colTasks = getFilteredTasks(col.id);
          const isOver = isDragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-72 flex-shrink-0 flex flex-col max-h-full rounded-2xl border ${isOver
                  ? 'bg-neutral-900 border-neutral-600 shadow-xl'
                  : 'bg-neutral-900/60 border-neutral-800/80'
                }`}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-neutral-850 bg-neutral-900/10">
                <div className="flex items-center gap-2">
                  {(() => {
                    const badge = getColumnHeaderBadge(col.id);
                    return (
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider ${badge.bg}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </div>
                    );
                  })()}
                  <span className="text-xs font-semibold text-neutral-500">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => handleAddNewTaskToColumn(col.id)}
                  className="p-1 text-neutral-500 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                  title={`Add task to ${col.title}`}
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards Container (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {colTasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-neutral-850 rounded-xl flex flex-col items-center justify-center text-center p-4 text-neutral-600">
                    <TrelloIcon className="w-5 h-5 opacity-20 mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Empty Column</span>
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
              className="absolute inset-0 bg-white dark:bg-black/40 backdrop-blur-xs z-30 rounded-2xl"
              onClick={() => setShowGitDrawer(false)}
            />
            {/* Panel */}
            <div
              className="absolute right-0 top-0 w-80 h-full bg-white dark:bg-black border-l border-neutral-200 dark:border-neutral-800 rounded-r-2xl p-5 shadow-2xl flex flex-col gap-4 z-40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <GithubIcon className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">GitHub Issues</h4>
                </div>
                <button
                  onClick={() => setShowGitDrawer(false)}
                  className="text-neutral-500 hover:text-black dark:text-white text-xxs border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:border-neutral-700 px-2 py-0.5 rounded cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="p-3 bg-neutral-100 dark:bg-neutral-800/20 border border-neutral-300 dark:border-neutral-700/30 rounded-xl flex items-start gap-2.5">
                <FiStar className="w-5 h-5 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-neutral-350 leading-relaxed">
                  Import repository bugs and tasks directly to your sprint. Simply click one of these active issues to ingest it into the <strong>Backlog</strong>.
                </p>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {githubIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => importGithubIssue(issue.id, 'backlog')}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-black/40 hover:border-neutral-600 hover:bg-white dark:bg-black cursor-pointer text-left flex flex-col gap-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/50 px-1 py-0.5 rounded">
                        {issue.repoName}
                      </span>
                      <span className="text-[9px] font-bold text-neutral-500">
                        #{issue.number}
                      </span>
                    </div>
                    <h5 className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:text-white line-clamp-2 leading-snug">
                      {issue.title}
                    </h5>
                    <div className="flex justify-end items-center gap-1 text-[9px] font-semibold text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-300 mt-1">
                      <span>Import</span>
                      <FiArrowRight className="w-3 h-3 group-hover:translate-x-0.5" />
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
