import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { FiPlus, FiTrash2, FiFolder, FiCheckCircle, FiCircle, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { ProjectTask, Subtask } from '../../types';

export const ProjectsTodoPage: React.FC = () => {
  const { 
    projects, projectTasks, 
    addProject, deleteProject, 
    addProjectTask, updateProjectTask, deleteProjectTask 
  } = useStore();

  const [activeProjectId, setActiveProjectId] = useState<string | null>(projects.length > 0 ? projects[0].id : null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<Record<string, string>>({});

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    addProject(newProjectName.trim());
    setNewProjectName('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeProjectId) return;
    addProjectTask(activeProjectId, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const handleAddSubtask = (taskId: string) => {
    const title = newSubtaskTitles[taskId]?.trim();
    if (!title) return;
    
    const task = projectTasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: `sub-${Date.now()}`,
      title,
      isCompleted: false
    };

    updateProjectTask(taskId, { subtasks: [...(task.subtasks || []), newSubtask] });
    setNewSubtaskTitles({ ...newSubtaskTitles, [taskId]: '' });
  };

  const toggleTaskCompletion = (task: ProjectTask) => {
    updateProjectTask(task.id, { isCompleted: !task.isCompleted });
  };

  const toggleSubtaskCompletion = (task: ProjectTask, subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map(st => 
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    updateProjectTask(task.id, { subtasks: updatedSubtasks });
  };

  const toggleExpandTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeTasks = projectTasks.filter(t => t.projectId === activeProjectId);

  const completedTasksCount = activeTasks.filter(t => t.isCompleted).length;
  const progressPercent = activeTasks.length > 0 ? Math.round((completedTasksCount / activeTasks.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* LEFT PANEL: Projects List */}
      <div className="w-full md:w-64 lg:w-80 flex flex-col gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-black/40 backdrop-blur-md flex flex-col gap-4 h-full shadow-lg">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide">
            <FiFolder className="w-4 h-4 text-indigo-400" />
            Projects
          </h2>

          <form onSubmit={handleAddProject} className="relative">
            <input 
              type="text" 
              placeholder="New project..." 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!newProjectName.trim()}
              className="absolute right-1 top-1 bottom-1 px-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1 mt-2">
            {projects.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No projects yet.</p>
            ) : (
              projects.map(project => (
                <div 
                  key={project.id}
                  onClick={() => setActiveProjectId(project.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeProjectId === project.id 
                      ? 'bg-zinc-800/80 border border-zinc-700 shadow-sm' 
                      : 'hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FiFolder className={`w-3.5 h-3.5 shrink-0 ${activeProjectId === project.id ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                    <span className={`text-sm truncate font-medium ${activeProjectId === project.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                      {project.name}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteProject(project.id); if (activeProjectId === project.id) setActiveProjectId(null); }}
                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all cursor-pointer shrink-0"
                    title="Delete Project"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Project Tasks */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeProject ? (
          <div className="flex-1 rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm flex flex-col overflow-hidden shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white tracking-tight">{activeProject.name}</h1>
                <div className="text-xs font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                  {completedTasksCount} / {activeTasks.length} Done
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {activeTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                  <FiCheckCircle className="w-10 h-10 text-zinc-700" />
                  <p className="text-sm">No tasks in this project. Add one below!</p>
                </div>
              ) : (
                activeTasks.map(task => {
                  const isExpanded = expandedTasks.has(task.id);
                  const subtasks = task.subtasks || [];
                  const completedSubtasks = subtasks.filter(st => st.isCompleted).length;

                  return (
                    <div key={task.id} className="group rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden transition-all hover:border-zinc-700/80">
                      <div className="flex items-center p-3 gap-3">
                        {/* Task Checkbox */}
                        <button 
                          onClick={() => toggleTaskCompletion(task)}
                          className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-md border transition-all cursor-pointer ${
                            task.isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-600 hover:border-indigo-400 text-transparent'
                          }`}
                        >
                          {task.isCompleted && <FiCheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        
                        {/* Task Title & Expand */}
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className={`text-sm truncate font-medium transition-all ${task.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                            {task.title}
                          </span>
                          {subtasks.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-medium">
                              {completedSubtasks}/{subtasks.length}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => deleteProjectTask(task.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md cursor-pointer"
                            title="Delete Task"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => toggleExpandTask(task.id)}
                            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md cursor-pointer"
                            title="Subtasks"
                          >
                            {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Subtasks Section */}
                      {isExpanded && (
                        <div className="bg-black/40 border-t border-zinc-800/50 p-3 pl-11 space-y-2">
                          {subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2.5 group/sub">
                              <button 
                                onClick={() => toggleSubtaskCompletion(task, subtask.id)}
                                className={`shrink-0 w-3.5 h-3.5 flex items-center justify-center rounded-sm border transition-colors cursor-pointer ${
                                  subtask.isCompleted ? 'bg-zinc-600 border-zinc-600 text-white' : 'border-zinc-600 hover:border-zinc-400 text-transparent'
                                }`}
                              >
                                {subtask.isCompleted && <FiCheckCircle className="w-2.5 h-2.5" />}
                              </button>
                              <span className={`text-xs truncate ${subtask.isCompleted ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                          
                          {/* Add Subtask Input */}
                          <div className="flex items-center gap-2 mt-2">
                            <FiPlus className="w-3 h-3 text-zinc-600" />
                            <input 
                              type="text" 
                              placeholder="Add subtask..." 
                              value={newSubtaskTitles[task.id] || ''}
                              onChange={(e) => setNewSubtaskTitles({ ...newSubtaskTitles, [task.id]: e.target.value })}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(task.id); }}
                              className="bg-transparent border-none outline-none text-xs text-zinc-300 placeholder-zinc-600 w-full focus:ring-0 p-0"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Task Input */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/20 shrink-0">
              <form onSubmit={handleAddTask} className="relative">
                <FiCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text" 
                  placeholder="Add a new task..." 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-black/10">
            <div className="text-center text-zinc-500">
              <FiFolder className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
              <p className="text-sm font-medium">Select or create a project to see its tasks</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
