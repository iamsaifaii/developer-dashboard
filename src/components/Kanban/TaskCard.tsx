import React, { useState } from 'react';
import type { Task } from '../../types';
import { useStore } from '../../store/useStore';
import { 
  FiCheckCircle, 
  FiCalendar, 
  FiFlag,
  FiTrash2,
  FiUser,
  FiChevronDown,
  FiCircle,
  FiCheck
} from 'react-icons/fi';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const STATUS_GROUPS = [
  {
    label: 'Not started',
    items: [
      { id: 'backlog', label: 'BACKLOG', color: 'text-zinc-500', bg: 'bg-zinc-800 text-zinc-300' },
      { id: 'todo', label: 'TO DO', color: 'text-zinc-400', bg: 'bg-zinc-700 text-white' }
    ]
  },
  {
    label: 'Active',
    items: [
      { id: 'in-progress', label: 'IN PROGRESS', color: 'text-[#7B61FF]', bg: 'bg-[#5b21b6] text-white' },
      { id: 'review', label: 'RVIEW', color: 'text-[#ca8a04]', bg: 'bg-[#ca8a04] text-white' }
    ]
  },
  {
    label: 'Closed',
    items: [
      { id: 'done', label: 'COMPLETE', color: 'text-[#16a34a]', bg: 'bg-[#16a34a] text-white' }
    ]
  }
];

const getFlatColumns = () => STATUS_GROUPS.flatMap(g => g.items);

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask, moveTask, currentUser, settings } = useStore();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [statusSearch, setStatusSearch] = useState('');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (d1: Date, d2: Date) => 
      d1.getFullYear() === d2.getFullYear() && 
      d1.getMonth() === d2.getMonth() && 
      d1.getDate() === d2.getDate();

    if (isSameDay(date, yesterday)) return <span className="text-red-400 font-medium">Yesterday</span>;
    if (isSameDay(date, today)) return <span className="text-green-400 font-medium">Today</span>;
    if (isSameDay(date, tomorrow)) return <span className="text-yellow-400 font-medium">Tomorrow</span>;

    return <span className="text-zinc-400">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>;
  };

  const renderPriority = () => {
    if (!task.priority) return '-';
    const isUrgent = task.priority === 'urgent';
    const isHigh = task.priority === 'high';
    const isNormal = task.priority === 'medium';
    
    let colorClass = 'text-zinc-500';
    if (isUrgent) colorClass = 'text-red-500 fill-red-500/20';
    else if (isHigh) colorClass = 'text-yellow-500 fill-yellow-500/20';
    else if (isNormal) colorClass = 'text-blue-500 fill-blue-500/20';

    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 capitalize">
        <FiFlag className={`w-3.5 h-3.5 ${colorClass}`} />
        <span>{task.priority === 'medium' ? 'Normal' : task.priority}</span>
      </div>
    );
  };

  const flatCols = getFlatColumns();
  const currentColumn = flatCols.find(c => c.id === task.columnId) || flatCols[1];
  const avatarUrl = settings.avatarUrl || currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(settings.userName || currentUser?.displayName || 'Developer')}`;

  return (
    <div
      onClick={() => onEdit(task)}
      className="group flex flex-col md:grid md:grid-cols-[minmax(250px,1fr)_120px_120px_100px_40px] items-start md:items-center border-b border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition-colors cursor-pointer relative"
    >
      {/* Name & Status Column */}
      <div className="w-full md:w-auto py-2.5 px-4 flex flex-col md:flex-row md:items-center gap-3 border-r-0 md:border-r border-zinc-800/50">
        
        <div className="flex items-center gap-2">
          {/* Quick Complete */}
          <button 
            className={`transition-colors shrink-0 ${task.columnId === 'done' ? 'text-green-500' : 'text-zinc-500 hover:text-green-500'}`}
            title={task.columnId === 'done' ? "Completed" : "Mark complete"}
            onClick={(e) => {
              e.stopPropagation(); 
              if (task.columnId !== 'done') {
                moveTask(task.id, 'done');
              } else {
                moveTask(task.id, 'todo'); // toggle back
              }
            }}
          >
            <FiCheckCircle className="w-4 h-4" />
          </button>
          
          {/* Title */}
          <span className={`text-xs font-medium truncate transition-colors ${task.columnId === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-200 group-hover:text-white'}`}>
            {task.title}
          </span>
        </div>

        {/* Status Dropdown (Mobile visible by default, desktop inline) */}
        <div className="mt-2 md:mt-0 md:ml-auto relative" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${currentColumn.bg} shadow-sm border border-transparent hover:brightness-110`}
          >
            {currentColumn.label}
            <FiChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
              <div className="absolute top-full left-0 md:right-0 md:left-auto mt-2 w-64 bg-[#1e1e1e] border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
                
                {/* Tabs */}
                <div className="flex items-center p-2 gap-1 border-b border-zinc-800/50">
                  <button className="flex-1 py-1.5 bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-md transition-colors">
                    Status
                  </button>
                  <button className="flex-1 py-1.5 text-zinc-500 hover:text-zinc-300 text-xs font-semibold rounded-md transition-colors">
                    Task Type
                  </button>
                </div>

                {/* Search */}
                <div className="p-2 border-b border-zinc-800/50">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={statusSearch}
                      onChange={e => setStatusSearch(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-zinc-700 rounded-md py-1.5 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] transition-all"
                    />
                  </div>
                </div>

                {/* Status List */}
                <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                  {STATUS_GROUPS.map(group => {
                    const filteredItems = group.items.filter(item => item.label.toLowerCase().includes(statusSearch.toLowerCase()));
                    if (filteredItems.length === 0) return null;

                    return (
                      <div key={group.label} className="mb-2">
                        <div className="px-3 py-1 flex items-center justify-between text-xs font-semibold text-zinc-400">
                          <span>{group.label}</span>
                          <span className="text-zinc-600 tracking-widest leading-none mt-1">...</span>
                        </div>
                        <div className="flex flex-col">
                          {filteredItems.map(item => {
                            const isSelected = item.id === task.columnId;
                            return (
                              <button
                                key={item.id}
                                className={`w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                                  isSelected ? 'bg-zinc-800/80 text-zinc-200' : 'text-zinc-300 hover:bg-zinc-800/50'
                                }`}
                                onClick={() => {
                                  moveTask(task.id, item.id);
                                  setShowStatusMenu(false);
                                  setStatusSearch('');
                                }}
                              >
                                {item.id === 'todo' || item.id === 'backlog' ? (
                                  <FiCircle className={`w-3.5 h-3.5 ${item.color}`} style={item.id === 'todo' ? { strokeDasharray: '2,2' } : {}} />
                                ) : item.id === 'done' ? (
                                  <FiCheckCircle className={`w-3.5 h-3.5 ${item.color}`} />
                                ) : (
                                  <div className={`w-3.5 h-3.5 rounded-full border-[3px] flex items-center justify-center`} style={{ borderColor: item.color.match(/\[(.*?)\]/)?.[1] || 'currentColor' }} />
                                )}
                                <span className="flex-1">{item.label}</span>
                                {isSelected && <FiCheck className="w-3.5 h-3.5 text-zinc-300" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Meta Columns (Row on Mobile, Grid on Desktop) */}
      <div className="w-full md:w-auto flex flex-row items-center justify-between md:contents pb-2 md:pb-0 px-4 md:px-0">
        
        {/* Assignee Column */}
        <div className="py-1 md:py-2.5 md:px-4 border-r-0 md:border-r border-zinc-800/50 flex items-center">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              className="w-5 h-5 rounded-full object-cover ring-2 ring-zinc-900" 
              alt="Assignee"
            />
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-zinc-600 flex items-center justify-center text-zinc-500">
              <FiUser className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Due Date Column */}
        <div className="py-1 md:py-2.5 md:px-4 border-r-0 md:border-r border-zinc-800/50 flex items-center text-[11px]">
          {task.dueDate ? (
            formatDate(task.dueDate)
          ) : (
            <FiCalendar className="w-3.5 h-3.5 text-zinc-600 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Priority Column */}
        <div className="py-1 md:py-2.5 md:px-4 border-r-0 md:border-r border-zinc-800/50 flex items-center">
          {renderPriority()}
        </div>

        {/* Actions / + Column */}
        <div className="py-1 md:py-2.5 md:px-2 flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
            title="Delete Task"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default TaskCard;
