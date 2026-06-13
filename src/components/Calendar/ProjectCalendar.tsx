import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { CalendarEvent } from '../../types';
import { EventModal } from './EventModal';
import { 
 FiChevronLeft, 
 FiChevronRight, 
 FiPlus, 
 FiCalendar
} from 'react-icons/fi';
import { TrelloIcon } from '../BrandIcons';

export const ProjectCalendar: React.FC = () => {
 const { events, tasks, addEvent, updateEvent, deleteEvent } = useStore();

 const [currentDate, setCurrentDate] = useState(new Date());
 const currentYear = currentDate.getFullYear();
 const currentMonth = currentDate.getMonth(); // 0-indexed

 // Modal control state
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
 const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

 const monthNames = [
 'January', 'February', 'March', 'April', 'May', 'June',
 'July', 'August', 'September', 'October', 'November', 'December'
 ];

 const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

 // Grid dates generation
 const getDaysInMonth = (year: number, month: number) => {
 const firstDay = new Date(year, month, 1);
 const startDayOfWeek = firstDay.getDay(); // 0 represents Sunday
 const days = [];

 // 1. Backfill previous month padding
 const prevMonthLastDate = new Date(year, month, 0).getDate();
 for (let i = startDayOfWeek - 1; i >= 0; i--) {
 days.push({
 date: new Date(year, month - 1, prevMonthLastDate - i),
 isCurrentMonth: false
 });
 }

 // 2. Insert current month dates
 const currentMonthLastDate = new Date(year, month + 1, 0).getDate();
 for (let i = 1; i <= currentMonthLastDate; i++) {
 days.push({
 date: new Date(year, month, i),
 isCurrentMonth: true
 });
 }

 // 3. Insert next month padding (complete a standard 6-week 42-day)
 const remaining = 42 - days.length;
 for (let i = 1; i <= remaining; i++) {
 days.push({
 date: new Date(year, month + 1, i),
 isCurrentMonth: false
 });
 }

 return days;
 };

 const calendarDays = getDaysInMonth(currentYear, currentMonth);

 // Month navigation helpers
 const handlePrevMonth = () => {
 setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
 };

 const handleNextMonth = () => {
 setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
 };

 const handleGoToday = () => {
 setCurrentDate(new Date());
 };

 // Maps events and tasks to formatted dates (YYYY-MM-DD)
 const getPlottedItemsOnDate = (date: Date) => {
 const dateStr = date.toISOString().split('T')[0];
 
 // Filter scheduled custom events
 const dayEvents = events.filter(e => e.start === dateStr);
 
 // Filter tasks whose deadline is this date
 const dayTasks = tasks.filter(t => t.dueDate === dateStr);

 return { dayEvents, dayTasks, dateStr };
 };

 const handleCellClick = (dateStr: string) => {
 setSelectedDateStr(dateStr);
 setSelectedEvent(null);
 setIsModalOpen(true);
 };

 const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
 e.stopPropagation(); // Avoid triggering cell click
 setSelectedEvent(event);
 setSelectedDateStr(event.start);
 setIsModalOpen(true);
 };

 const handleSaveEvent = (eventData: {
 title: string;
 description: string;
 start: string;
 end: string;
 color: string;
 }) => {
 if (selectedEvent) {
 // Edit
 updateEvent(selectedEvent.id, eventData);
 } else {
 // Create new
 addEvent(eventData);
 }
 };

 const isToday = (date: Date) => {
 const today = new Date();
 return date.getDate() === today.getDate() &&
 date.getMonth() === today.getMonth() &&
 date.getFullYear() === today.getFullYear();
 };

 return (
 <div className="h-[calc(100vh-8.5rem)] flex flex-col gap-4 select-none">
 
 {/* 1. Header Toolbar */}
 <div className="flex items-center justify-between bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-800/80 p-4 rounded-2xl shadow-lg">
 
 {/* Month Label */}
 <div className="flex items-center gap-3">
 <FiCalendar className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
 <h3 className="text-sm font-bold text-white uppercase tracking-wider">
 {monthNames[currentMonth]} {currentYear}
 </h3>
 </div>

 {/* Action Controls */}
 <div className="flex items-center gap-2">
 <button
 onClick={handleGoToday}
 className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/40 text-neutral-500 dark:text-neutral-400 hover:text-white rounded-lg text-xxs font-bold cursor-pointer hover:bg-neutral-100 dark:bg-neutral-800"
 >
 Today
 </button>
 
 <div className="flex items-center bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5">
 <button
 onClick={handlePrevMonth}
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-white rounded-md cursor-pointer"
 >
 <FiChevronLeft className="w-4 h-4" />
 </button>
 <button
 onClick={handleNextMonth}
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-white rounded-md cursor-pointer"
 >
 <FiChevronRight className="w-4 h-4" />
 </button>
 </div>

 <button
 onClick={() => {
 setSelectedEvent(null);
 setSelectedDateStr(new Date().toISOString().split('T')[0]);
 setIsModalOpen(true);
 }}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 text-xxs font-bold text-white rounded-lg cursor-pointer shadow-md shadow-neutral-900/10"
 >
 <FiPlus className="w-3.5 h-3.5" />
 <span>Add Event</span>
 </button>
 </div>
 </div>

 {/* 2. Calendar Grid */}
 <div className="flex-1 glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xl flex flex-col">
 {/* Days label header */}
 <div className="grid grid-cols-7 gap-1 text-center border-b border-neutral-200 dark:border-neutral-800/60 pb-2 mb-2">
 {daysOfWeek.map(day => (
 <div key={day} className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
 {day}
 </div>
 ))}
 </div>

 {/* 42 grid cells */}
 <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1 bg-white dark:bg-black/20 rounded-xl overflow-hidden border border-neutral-300 dark:border-black/50">
 {calendarDays.map((dayObj, index) => {
 const { dayEvents, dayTasks, dateStr } = getPlottedItemsOnDate(dayObj.date);
 const currentIsToday = isToday(dayObj.date);
 
 return (
 <div
 key={index}
 onClick={() => handleCellClick(dateStr)}
 className={`p-1.5 flex flex-col gap-1 min-h-0 relative border border-neutral-300 dark:border-black  cursor-pointer text-left ${
 dayObj.isCurrentMonth 
 ? 'bg-white dark:bg-black/10 hover:bg-white dark:bg-black/40' 
 : 'bg-white dark:bg-black/50 opacity-30 hover:opacity-50'
 }`}
 >
 {/* Cell Number & Hover Indicators */}
 <div className="flex items-center justify-between">
 <span 
 className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
 currentIsToday 
 ? 'bg-neutral-200 dark:bg-neutral-700 text-white shadow-md' 
 : 'text-neutral-500 dark:text-neutral-400'
 }`}
 >
 {dayObj.date.getDate()}
 </span>
 
 {/* Hover Quick Add indicator */}
 <span className="opacity-0 hover:opacity-100 p-0.5 bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-100 dark:bg-neutral-800 rounded pointer-events-none">
 <FiPlus className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400" />
 </span>
 </div>

 {/* Items container */}
 <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 text-xxs custom-scrollbar select-none">
 
 {/* Render Scheduled Custom Events */}
 {dayEvents.map(e => (
 <div
 key={e.id}
 onClick={(evt) => handleEventClick(evt, e)}
 className="px-1.5 py-0.5 rounded text-[10px] truncate font-medium text-white hover:brightness-110 shadow-sm"
 style={{ 
 backgroundColor: e.color || '#64748b',
 borderLeft: `3px solid rgba(255,255,255,0.4)`
 }}
 title={`${e.title} - ${e.description}`}
 >
 {e.title}
 </div>
 ))}

 {/* Render Imported Kanban Tasks deadlines */}
 {dayTasks.map(t => (
 <div
 key={t.id}
 className={`px-1.5 py-0.5 rounded border border-dashed text-[9px] truncate flex items-center gap-1 hover:border-neutral-500 ${
 t.columnId === 'done'
 ? 'bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 line-through'
 : 'bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800'
 }`}
 title={`Task: ${t.title} [Status: ${t.columnId}]`}
 >
 <TrelloIcon className="w-2.5 h-2.5 shrink-0 text-neutral-500" />
 <span className="truncate">{t.title}</span>
 </div>
 ))}

 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* 3. Event Creation/Modification modal */}
 <EventModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onSave={handleSaveEvent}
 onDelete={deleteEvent}
 event={selectedEvent}
 initialDate={selectedDateStr || undefined}
 />
 </div>
 );
};
export default ProjectCalendar;
