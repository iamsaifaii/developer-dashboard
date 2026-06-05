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
          bg: 'bg-zinc-900 text-zinc-400 border border-zinc-800',
          icon: <FiArchive className="w-3 h-3 text-zinc-500 shrink-0" />
        };
      case 'todo':
        return {
          label: 'TO DO',
          bg: 'bg-zinc-900 text-zinc-200 border border-zinc-800',
          icon: <FiList className="w-3.5 h-3.5 text-zinc-450 shrink-0" />
        };
      case 'in-progress':
        return {
          label: 'IN PROGRESS',
          bg: 'bg-zinc-900 text-zinc-100 border border-zinc-800',
          icon: <FiClock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        };
      case 'review':
        return {
          label: 'REVIEW',
          bg: 'bg-zinc-900 text-zinc-300 border border-zinc-800',
          icon: <FiEye className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        };
      case 'done':
        return {
          label: 'COMPLETE',
          bg: 'bg-zinc-900 text-zinc-200 border border-zinc-800',
          icon: (
            <span className="flex items-center justify-center w-3 h-3 rounded-full bg-zinc-200 text-zinc-950 shrink-0 font-bold text-[9px]">
              Γ£ô
            </span>
          )
        };
      default:
        return {
          label: colId.toUpperCase(),
          bg: 'bg-zinc-900 text-zinc-300 border border-zinc-800',
          icon: null
        };
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col gap-5 relative text-left">
      
      {/* 1. Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search & Priority Filter */}
        <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <FiSearch className="w-4 h-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search board tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-44 flex items-center">
            <FiFilter className="w-3.5 h-3.5 text-zinc-550 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-250 focus:outline-none focus:border-zinc-500"
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
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
                showGitDrawer 
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <GithubIcon className="w-4 h-4" />
              <span>Import Issues ({githubIssues.length})</span>
            </button>
          )}

          <button
            onClick={() => handleAddNewTaskToColumn('todo')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg cursor-pointer shadow-lg"
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
              className={`w-72 flex-shrink-0 flex flex-col max-h-full rounded-2xl border transition-colors ${
                isOver 
                  ? 'bg-zinc-900 border-zinc-700 shadow-xl' 
                  : 'bg-zinc-950 border-zinc-850'
              }`}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-zinc-850 bg-zinc-900">
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
                  <span className="text-xs font-semibold text-zinc-550">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => handleAddNewTaskToColumn(col.id)}
                  className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 cursor-pointer transition-colors"
                  title={`Add task to ${col.title}`}
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards Container (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {colTasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-zinc-850 rounded-xl flex flex-col items-center justify-center text-center p-4 text-zinc-650">
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
              className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 rounded-2xl"
              onClick={() => setShowGitDrawer(false)}
            />
            {/* Panel */}
            <div
              className="absolute right-0 top-0 w-80 h-full bg-zinc-900 border-l border-zinc-800 rounded-r-2xl p-5 shadow-2xl flex flex-col gap-4 z-40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-300">
                  <GithubIcon className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">GitHub Issues</h4>
                </div>
                <button
                  onClick={() => setShowGitDrawer(false)}
                  className="text-zinc-400 hover:text-white text-xxs border border-zinc-800 hover:border-zinc-750 px-2 py-0.5 rounded cursor-pointer bg-zinc-950 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-start gap-2.5">
                <FiStar className="w-5 h-5 text-zinc-450 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Import repository bugs and tasks directly to your sprint. Simply click one of these active issues to ingest it into the <strong>Backlog</strong>.
                </p>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {githubIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => importGithubIssue(issue.id, 'backlog')}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer text-left flex flex-col gap-1.5 group transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded">
                        {issue.repoName}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-550">
                        #{issue.number}
                      </span>
                    </div>
                    <h5 className="text-[11px] font-semibold text-zinc-250 group-hover:text-white line-clamp-2 leading-snug">
                      {issue.title}
                    </h5>
                    <div className="flex justify-end items-center gap-1 text-[9px] font-semibold text-zinc-500 group-hover:text-zinc-350 mt-1">
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
