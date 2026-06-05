import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Task, Priority } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiUser,
  FiCheckCircle,
  FiLayout,
  FiList
} from 'react-icons/fi';


export const KanbanBoard: React.FC = () => {
  const { 
    columns, 
    tasks, 
    addTask, 
    updateTask 
  } = useStore();

  const [searchQuery] = useState('');
  const [priorityFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [activeColumnForNewTask, setActiveColumnForNewTask] = useState<string>('todo');
  
  // Track collapsed state for accordion groups (store column id if collapsed)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());


  const editingTask = tasks.find(t => t.id === editingTaskId) || null;

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

  const handleAddNewTaskToColumn = (colId: string) => {
    setActiveColumnForNewTask(colId);
    setEditingTaskId(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setIsModalOpen(true);
  };

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
      updateTask(editingTask.id, taskData);
    } else {
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

  const toggleGroup = (colId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  };

  // ClickUp style column badges
  const getGroupBadge = (colId: string) => {
    switch (colId) {
      case 'backlog':
        return { label: 'BACKLOG', bg: 'bg-zinc-800 text-zinc-300' };
      case 'todo':
        return { label: 'TO DO', bg: 'bg-zinc-700 text-white border border-zinc-600' };
      case 'in-progress':
        return { label: 'IN PROGRESS', bg: 'bg-[#5b21b6] text-white border border-[#4c1d95]' }; // ClickUp Purple
      case 'review':
        return { label: 'REVIEW', bg: 'bg-[#ca8a04] text-white border border-[#a16207]' }; // Yellow
      case 'done':
        return { label: 'DONE', bg: 'bg-[#16a34a] text-white border border-[#15803d]' }; // Green
      default:
        return { label: colId.toUpperCase(), bg: 'bg-zinc-800 text-zinc-300' };
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col relative text-left bg-[#1a1a1a] border-t border-zinc-900 rounded-t-xl overflow-hidden shadow-2xl">
      
      {/* 1. ClickUp-style Top Navigation Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-zinc-800">
        
        {/* Left: View Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 px-3 py-1.5 transition-colors whitespace-nowrap">
            Add Channel |
          </button>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800/80 text-zinc-200 text-[11px] font-semibold transition-colors">
            <FiList className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-zinc-800/50 text-zinc-400 text-[11px] font-semibold transition-colors">
            <FiLayout className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
          
          <button className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 px-3 py-1.5 transition-colors whitespace-nowrap flex items-center gap-1">
            <FiPlus className="w-3 h-3" /> View
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end mt-3 md:mt-0">
          <button className="text-[10px] font-bold px-3 py-1.5 rounded-md border border-[#ca8a04] text-[#ca8a04] hover:bg-[#ca8a04]/10 transition-colors">
            Save view v
          </button>
          
          <div className="flex items-center gap-3 border-r border-zinc-700 pr-3">
            <FiFilter className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
            <FiCheckCircle className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
            <FiUser className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
            <FiSearch className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
            <FiSettings className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
          </div>

          <button
            onClick={() => handleAddNewTaskToColumn('todo')}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-[#7B61FF] hover:bg-[#6b50f0] text-white rounded cursor-pointer transition-colors shadow-sm"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Task</span>
            <span className="ml-1 pl-1 border-l border-white/20">v</span>
          </button>
        </div>
      </div>

      {/* 2. Main List Container */}
      <div className="flex-1 overflow-y-auto bg-[#1a1a1a] p-4 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          {columns.map((col) => {
            const colTasks = getFilteredTasks(col.id);
            const isCollapsed = collapsedGroups.has(col.id);
            const badge = getGroupBadge(col.id);

            return (
              <div key={col.id} className="flex flex-col">
                
                {/* Accordion Group Header */}
                <div 
                  className="flex items-center gap-3 py-2 cursor-pointer group select-none"
                  onClick={() => toggleGroup(col.id)}
                >
                  <button className="text-zinc-500 group-hover:text-zinc-300 transition-colors p-0.5">
                    {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                  </button>
                  
                  <div className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${badge.bg} shadow-sm`}>
                    {col.id === 'in-progress' && <span className="w-2 h-2 rounded-full border border-white/40" />}
                    {col.id === 'todo' && <span className="w-2 h-2 rounded-full border border-zinc-400 border-dashed" />}
                    {col.id === 'review' && <span className="w-2 h-2 rounded-full border border-white/40" />}
                    {badge.label}
                  </div>
                  
                  <span className="text-xs font-semibold text-zinc-500">
                    {colTasks.length}
                  </span>
                </div>

                {/* Group Content (Rows) */}
                {!isCollapsed && (
                  <div className="mt-2 flex flex-col border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/50">
                    
                    {/* Grid Header */}
                    <div className="grid grid-cols-[minmax(250px,1fr)_120px_120px_100px_40px] text-[10px] text-zinc-400 font-medium px-4 py-2 border-b border-zinc-800 bg-[#1e1e1e]">
                      <div className="border-r border-zinc-800/50">Name</div>
                      <div className="px-4 border-r border-zinc-800/50">Assignee</div>
                      <div className="px-4 border-r border-zinc-800/50">Due date</div>
                      <div className="px-4 border-r border-zinc-800/50">Priority</div>
                      <div className="flex justify-center"><FiPlus className="w-3.5 h-3.5 text-zinc-600 bg-zinc-800 rounded p-0.5" /></div>
                    </div>

                    {/* Task Rows */}
                    {colTasks.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-zinc-600 italic border-b border-zinc-800 bg-zinc-950">
                        No tasks in this group.
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onEdit={handleEditTask} 
                        />
                      ))
                    )}

                    {/* + Add Task Row */}
                    <div 
                      className="py-2.5 px-4 text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 cursor-pointer transition-colors flex items-center gap-2 group bg-zinc-950 border-t border-zinc-800/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddNewTaskToColumn(col.id);
                      }}
                    >
                      <FiPlus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>Add Task</span>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
          
        </div>
      </div>

      {/* Tasks configuration modal wrapper */}
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
