import React, { useState, useEffect } from 'react';
import type { Task, Priority, Subtask } from '../../types';
import { FiX, FiTrash2, FiCalendar, FiTag, FiAlertTriangle } from 'react-icons/fi';
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
 }) => void;
 task?: Task | null; // If editing, pass the task
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [priority, setPriority] = useState<Priority>('medium');
 const [dueDate, setDueDate] = useState('');
 const [tagsInput, setTagsInput] = useState('');
 const [subtasks, setSubtasks] = useState<Subtask[]>([]);
 const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

 // Sync state if task changes (editing mode)
 useEffect(() => {
 if (task) {
 setTitle(task.title);
 setDescription(task.description);
 setPriority(task.priority);
 setDueDate(task.dueDate || '');
 setTagsInput(task.tags.join(', '));
 setSubtasks(task.subtasks);
 } else {
 // Clear fields for new task
 setTitle('');
 setDescription('');
 setPriority('medium');
 setDueDate('');
 setTagsInput('');
 setSubtasks([]);
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

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
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
 dueDate: dueDate || undefined
 });
 
 onClose();
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center">
 {/* Backdrop */}
 <div 
 className="absolute inset-0 bg-white dark:bg-black/80 backdrop-blur-md" 
 onClick={onClose} 
 />

 {/* Modal Box */}
 <div
 className="w-full max-w-2xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
 >
 {/* Header */}
 <div className="p-6 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
 <h3 className="text-base font-bold text-black dark:text-white">
 {task ? 'Edit Workspace Task' : 'Create New Task'}
 </h3>
 <button 
 onClick={onClose}
 className="p-1 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-black dark:text-white hover:bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
 >
 <FiX className="w-5 h-5" />
 </button>
 </div>

 {/* Form Container (Scrollable) */}
 <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
 {/* Title */}
 <div>
 <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Task Title</label>
 <input 
 type="text" 
 placeholder="Refactor API request layers..."
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
 required
 />
 </div>

 {/* Description */}
 <div>
 <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Description (Markdown friendly)</label>
 <textarea 
 placeholder="Detail the sprint expectations here..."
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 rows={4}
 className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-650 focus:outline-none focus:border-neutral-500"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Priority */}
 <div>
 <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Priority</label>
 <div className="relative">
 <FiAlertTriangle className="w-4 h-4 text-neutral-500 dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
 <select
 value={priority}
 onChange={(e) => setPriority(e.target.value as Priority)}
 className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 text-neutral-250 focus:outline-none focus:border-neutral-500"
 >
 <option value="low">Low Priority</option>
 <option value="medium">Medium Priority</option>
 <option value="high">High Priority</option>
 </select>
 </div>
 </div>

 {/* Due Date */}
 <div>
 <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Due Date</label>
 <div className="relative">
 <FiCalendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
 <input 
 type="date" 
 value={dueDate}
 onChange={(e) => setDueDate(e.target.value)}
 className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 text-neutral-250 focus:outline-none focus:border-neutral-500"
 />
 </div>
 </div>
 </div>

 {/* Tags */}
 <div>
 <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Tags (Comma-separated)</label>
 <div className="relative">
 <FiTag className="w-4 h-4 text-neutral-500 dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
 <input 
 type="text" 
 placeholder="architecture, UI, testing"
 value={tagsInput}
 onChange={(e) => setTagsInput(e.target.value)}
 className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-650 focus:outline-none focus:border-neutral-500"
 />
 </div>
 </div>

 {/* Subtasks Checklist */}
 <div>
 <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Checklist Items</label>
 
 {/* Input field */}
 <div className="flex gap-2 mb-3">
 <input 
 type="text" 
 placeholder="Add item..." 
 value={newSubtaskTitle}
 onChange={(e) => setNewSubtaskTitle(e.target.value)}
 className="flex-1 text-xs px-3.5 py-2.5 rounded-lg bg-white dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 text-neutral-250 placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handleAddSubtask(e);
 }
 }}
 />
 <button
 type="button"
 onClick={handleAddSubtask}
 className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 text-xs font-semibold rounded-lg text-black dark:text-white cursor-pointer"
 >
 Add
 </button>
 </div>

 {/* Checklist Loop */}
 <div className="space-y-1.5 max-h-40 overflow-y-auto">
 {subtasks.length === 0 ? (
 <p className="text-[10px] text-neutral-500 italic">No checklist items added.</p>
 ) : (
 subtasks.map(sub => (
 <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-black/30 border border-neutral-200 dark:border-neutral-850">
 <div className="flex items-center gap-2">
 <input 
 type="checkbox" 
 checked={sub.isCompleted}
 onChange={() => handleToggleSubtask(sub.id)}
 className="rounded border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 w-4 h-4 cursor-pointer"
 />
 <span className={`text-xs ${sub.isCompleted ? 'line-through text-neutral-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
 {sub.title}
 </span>
 </div>
 <button
 type="button"
 onClick={() => handleRemoveSubtask(sub.id)}
 className="p-1 text-neutral-500 hover:text-neutral-400 cursor-pointer"
 >
 <FiTrash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 ))
 )}
 </div>
 </div>
 </form>

 {/* Footer Actions */}
 <div className="p-6 border-t border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-black/20 flex justify-end gap-3.5">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:bg-neutral-800 text-xs font-bold rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={handleSubmit}
 className="px-5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 text-xs font-bold rounded-lg text-black dark:text-white cursor-pointer shadow-lg shadow-neutral-900/10"
 >
 Save Task
 </button>
 </div>
 </div>
 </div>
 );
};
