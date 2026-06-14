import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { FiPlus, FiTrash2, FiFolder, FiCheckCircle, FiCircle, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import type { ProjectTask, Subtask } from '../../types';

// ─── Circular Progress Ring ───────────────────────────────────────────────────
const CircularProgress: React.FC<{ percent: number; size?: number }> = ({ percent, size = 72 }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (percent / 100) * circumference;
  const isComplete = percent === 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth="5"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? '#ffffff' : '#71717a'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.6s ease-out, stroke 0.4s ease' }}
        />
      </svg>
      <span
        className="absolute text-sm font-bold tabular-nums"
        style={{ color: isComplete ? '#ffffff' : '#a1a1aa' }}
      >
        {percent}%
      </span>
    </div>
  );
};

// ─── Per-project mini progress bar (used in sidebar list) ────────────────────
const MiniProgress: React.FC<{ percent: number; taskCount: number }> = ({ percent, taskCount }) => (
  <div className="mt-1.5 w-full">
    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-zinc-400 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
    {taskCount > 0 && (
      <p className="text-[9px] text-zinc-600 mt-0.5 font-mono">{percent}%</p>
    )}
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ percent: number; total: number }> = ({ percent, total }) => {
  if (total === 0) return <span className="text-[10px] text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-medium">No tasks</span>;
  if (percent === 0) return <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-medium">Not started</span>;
  if (percent === 100) return <span className="text-[10px] text-white bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full font-bold tracking-wide">✓ Complete</span>;
  return <span className="text-[10px] text-zinc-300 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded-full font-medium">In progress</span>;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const ProjectsTodoPage: React.FC = () => {
  const {
    projects, projectTasks,
    addProject, deleteProject,
    addProjectTask, updateProjectTask, deleteProjectTask
  } = useStore();

  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<Record<string, string>>({});

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getProjectProgress = (projectId: string) => {
    const tasks = projectTasks.filter(t => t.projectId === projectId);
    if (tasks.length === 0) return { percent: 0, completed: 0, total: 0 };
    const completed = tasks.filter(t => t.isCompleted).length;
    return { percent: Math.round((completed / tasks.length) * 100), completed, total: tasks.length };
  };

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
    const newSubtask: Subtask = { id: `sub-${Date.now()}`, title, isCompleted: false };
    updateProjectTask(taskId, { subtasks: [...(task.subtasks || []), newSubtask] });
    setNewSubtaskTitles({ ...newSubtaskTitles, [taskId]: '' });
  };

  const toggleTaskCompletion = (task: ProjectTask) =>
    updateProjectTask(task.id, { isCompleted: !task.isCompleted });

  const toggleSubtaskCompletion = (task: ProjectTask, subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map(st =>
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    updateProjectTask(task.id, { subtasks: updatedSubtasks });
  };

  const toggleExpandTask = (taskId: string) => {
    const next = new Set(expandedTasks);
    next.has(taskId) ? next.delete(taskId) : next.add(taskId);
    setExpandedTasks(next);
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeTasks = projectTasks.filter(t => t.projectId === activeProjectId);
  const { percent: progressPercent, completed: completedTasksCount } = activeProject
    ? getProjectProgress(activeProject.id)
    : { percent: 0, completed: 0 };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">

      {/* ── LEFT PANEL: Projects List ─────────────────────────────────────── */}
      <div className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-black/40 backdrop-blur-md flex flex-col gap-4 h-full shadow-lg">

          <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide">
            <FiFolder className="w-4 h-4 text-white" />
            Projects
          </h2>

          {/* New project form */}
          <form onSubmit={handleAddProject} className="relative">
            <input
              type="text"
              placeholder="New project..."
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              disabled={!newProjectName.trim()}
              className="absolute right-1 top-1 bottom-1 px-2 rounded-md bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-black transition-colors flex items-center justify-center cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Project list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
            {projects.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-6">No projects yet.</p>
            ) : (
              projects.map(project => {
                const { percent, total } = getProjectProgress(project.id);
                const isActive = activeProjectId === project.id;
                return (
                  <div
                    key={project.id}
                    onClick={() => setActiveProjectId(project.id)}
                    className={`group flex flex-col px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-zinc-800/80 border border-zinc-700 shadow-sm'
                        : 'hover:bg-zinc-900/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FiFolder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                        <span className={`text-sm truncate font-medium ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                          {project.name}
                        </span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteProject(project.id); if (isActive) setActiveProjectId(null); }}
                        className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all cursor-pointer shrink-0"
                        title="Delete Project"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Mini progress bar under each project */}
                    {total > 0 && <MiniProgress percent={percent} taskCount={total} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Task View ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeProject ? (
          <div className="flex-1 rounded-xl border border-zinc-800 bg-black/20 backdrop-blur-sm flex flex-col overflow-hidden shadow-lg">

            {/* ── Progress Header ─────────────────────────────────────────── */}
            <div className="p-6 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/60 to-transparent">
              <div className="flex items-center gap-5">

                {/* Circular ring */}
                <CircularProgress percent={progressPercent} size={72} />

                {/* Stats block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h1 className="text-lg font-bold text-white tracking-tight truncate">{activeProject.name}</h1>
                    <StatusBadge percent={progressPercent} total={activeTasks.length} />
                  </div>

                  {/* Segmented task pills */}
                  {activeTasks.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      {activeTasks.slice(0, 12).map(t => (
                        <div
                          key={t.id}
                          title={t.title}
                          className={`h-1.5 flex-1 min-w-[10px] max-w-[28px] rounded-full transition-colors duration-300 ${
                            t.isCompleted ? 'bg-white' : 'bg-zinc-700'
                          }`}
                        />
                      ))}
                      {activeTasks.length > 12 && (
                        <span className="text-[9px] text-zinc-600 ml-1">+{activeTasks.length - 12}</span>
                      )}
                    </div>
                  )}

                  {/* Counters */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-zinc-400">
                      <span className="text-white font-bold">{completedTasksCount}</span>
                      <span className="text-zinc-600 mx-1">/</span>
                      <span className="text-zinc-500">{activeTasks.length} tasks done</span>
                    </span>
                    {activeTasks.length - completedTasksCount > 0 && (
                      <span className="text-zinc-600">
                        {activeTasks.length - completedTasksCount} remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Full-width progress bar */}
              <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* ── Task List ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {activeTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
                  <FiCheckCircle className="w-10 h-10 text-zinc-800" />
                  <p className="text-sm">No tasks yet — add one below to start tracking progress.</p>
                </div>
              ) : (
                activeTasks.map(task => {
                  const isExpanded = expandedTasks.has(task.id);
                  const subtasks = task.subtasks || [];
                  const completedSubtasks = subtasks.filter(st => st.isCompleted).length;

                  return (
                    <div
                      key={task.id}
                      className="group rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden transition-all hover:border-zinc-700/80"
                    >
                      <div className="flex items-center p-3 gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTaskCompletion(task)}
                          className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-md border transition-all cursor-pointer ${
                            task.isCompleted
                              ? 'bg-white border-white text-black'
                              : 'border-zinc-600 hover:border-white text-transparent'
                          }`}
                        >
                          {task.isCompleted && <FiCheckCircle className="w-3.5 h-3.5" />}
                        </button>

                        {/* Title + subtask badge */}
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className={`text-sm truncate font-medium transition-all ${task.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                            {task.title}
                          </span>
                          {subtasks.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-medium shrink-0">
                              {completedSubtasks}/{subtasks.length}
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteProjectTask(task.id)}
                            className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                            title="Delete Task"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleExpandTask(task.id)}
                            className="p-1.5 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                            title={isExpanded ? 'Hide subtasks' : 'Show subtasks'}
                          >
                            {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Inline subtask progress bar */}
                      {subtasks.length > 0 && !isExpanded && (
                        <div className="px-3 pb-2">
                          <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-zinc-500 rounded-full transition-all duration-500"
                              style={{ width: `${subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Subtasks expanded section */}
                      {isExpanded && (
                        <div className="bg-black/40 border-t border-zinc-800/50 p-3 pl-11 space-y-2">
                          {subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2.5">
                              <button
                                onClick={() => toggleSubtaskCompletion(task, subtask.id)}
                                className={`shrink-0 w-3.5 h-3.5 flex items-center justify-center rounded-sm border transition-colors cursor-pointer ${
                                  subtask.isCompleted
                                    ? 'bg-zinc-500 border-zinc-500 text-white'
                                    : 'border-zinc-600 hover:border-zinc-400 text-transparent'
                                }`}
                              >
                                {subtask.isCompleted && <FiCheckCircle className="w-2.5 h-2.5" />}
                              </button>
                              <span className={`text-xs truncate ${subtask.isCompleted ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}

                          {/* Add subtask */}
                          <div className="flex items-center gap-2 mt-2 border-t border-zinc-800/50 pt-2">
                            <FiPlus className="w-3 h-3 text-zinc-600 shrink-0" />
                            <input
                              type="text"
                              placeholder="Add subtask..."
                              value={newSubtaskTitles[task.id] || ''}
                              onChange={e => setNewSubtaskTitles({ ...newSubtaskTitles, [task.id]: e.target.value })}
                              onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(task.id); }}
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

            {/* ── Add Task footer ──────────────────────────────────────────── */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/20 shrink-0">
              <form onSubmit={handleAddTask} className="relative">
                <FiCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Add a new task..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-14 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-black transition-colors font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-black/10">
            <div className="text-center text-zinc-600">
              <FiFolder className="w-12 h-12 mx-auto mb-3 text-zinc-800" />
              <p className="text-sm font-medium">Select or create a project to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
