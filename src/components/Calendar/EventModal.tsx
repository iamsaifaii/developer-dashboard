import React, { useState, useEffect } from 'react';
import type { CalendarEvent } from '../../types';
import { FiX, FiCalendar, FiFileText, FiTrash2, FiStar } from 'react-icons/fi';
interface EventModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSave: (eventData: {
 title: string;
 description: string;
 start: string;
 end: string;
 color: string;
 }) => void;
 onDelete?: (eventId: string) => void;
 event?: CalendarEvent | null; // For editing
 initialDate?: string; // Preselected date when adding
}

const COLORS = [
  { value: '#22c55e', label: 'Green' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ec4899', label: 'Pink' }
];

export const EventModal: React.FC<EventModalProps> = ({ 
 isOpen, 
 onClose, 
 onSave, 
 onDelete,
 event,
 initialDate
}) => {
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [start, setStart] = useState('');
 const [color, setColor] = useState('#22c55e');

 useEffect(() => {
 if (event) {
 setTitle(event.title);
 setDescription(event.description);
 setStart(event.start);
 setColor(event.color || '#22c55e');
 } else {
 setTitle('');
 setDescription('');
 setStart(initialDate || new Date().toISOString().split('T')[0]);
 setColor('#22c55e');
 }
 }, [event, initialDate, isOpen]);

 if (!isOpen) return null;

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!title.trim() || !start) return;

 onSave({
 title: title.trim(),
 description: description.trim(),
 start,
 end: start, // single-day events for simplicty
 color
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

 {/* Modal Container */}
 <div
 className="w-full max-w-md bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl relative z-10 overflow-hidden"
 >
 {/* Header */}
 <div className="p-5 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
 <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
 <FiStar className="w-4.5 h-4.5" />
 <span>{event ? 'Edit Calendar Event' : 'Schedule Event'}</span>
 </h3>
 <button 
 onClick={onClose}
 className="p-1 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-black dark:text-white hover:bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
 >
 <FiX className="w-5 h-5" />
 </button>
 </div>

 {/* Form */}
 <form onSubmit={handleSubmit} className="p-5 space-y-4 text-left">
 {/* Title */}
 <div>
 <label className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">Event Name</label>
 <input 
 type="text" 
 placeholder="e.g., Sprint Planning..." 
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-650 focus:outline-none focus:border-neutral-500"
 required
 autoFocus
 />
 </div>

 {/* Date */}
 <div>
 <label className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">Date</label>
 <div className="relative">
 <FiCalendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
 <input 
 type="date" 
 value={start}
 onChange={(e) => setStart(e.target.value)}
 className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 text-neutral-250 focus:outline-none focus:border-neutral-500"
 required
 />
 </div>
 </div>

 {/* Description */}
 <div>
 <label className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">Details</label>
 <div className="relative">
 <FiFileText className="w-4 h-4 text-neutral-500 dark:text-neutral-400 absolute left-3 top-3" />
 <textarea 
 placeholder="Standup link, call links, notes..."
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 rows={3}
 className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-650 focus:outline-none focus:border-neutral-500"
 />
 </div>
 </div>

 {/* Color Chips */}
 <div>
 <label className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">Category Color</label>
 <div className="flex gap-2">
 {COLORS.map(c => (
 <button
 type="button"
 key={c.value}
 onClick={() => setColor(c.value)}
 className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer  ${
 color === c.value 
 ? 'ring-2 ring-white scale-110 shadow-lg' 
 : 'opacity-70 hover:opacity-100 '
 }`}
 style={{ backgroundColor: c.value }}
 title={c.label}
 />
 ))}
 </div>
 </div>

 {/* Buttons Panel */}
 <div className="pt-4 border-t border-neutral-200 dark:border-neutral-850 flex items-center justify-between">
 {event && onDelete ? (
 <button
 type="button"
 onClick={() => {
 onDelete(event.id);
 onClose();
 }}
 className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-lg text-xxs font-bold cursor-pointer"
 >
 <FiTrash2 className="w-3.5 h-3.5" />
 <span>Delete</span>
 </button>
 ) : (
 <div /> // spacing placeholder
 )}

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={onClose}
 className="px-3.5 py-1.5 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:bg-neutral-800 text-xxs font-bold rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 text-xxs font-bold rounded-lg text-black dark:text-white cursor-pointer shadow-md shadow-neutral-900/10"
 >
 Save Event
 </button>
 </div>
 </div>
 </form>
 </div>
 </div>
 );
};
export default EventModal;
