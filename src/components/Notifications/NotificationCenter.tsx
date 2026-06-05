import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
  FiBell, 
  FiCheck, 
  FiTrash2, 
  FiGithub, 
  FiCheckCircle, 
  FiClock, 
  FiInfo 
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { AppNotification, NotificationCategory } from '../../types';

interface NotificationCenterProps {}

export const NotificationCenter: React.FC<NotificationCenterProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    clearNotification 
  } = useStore();

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIconForCategory = (category: NotificationCategory) => {
    switch (category) {
      case 'task':
        return <FiCheckCircle className="text-blue-400 w-4 h-4" />;
      case 'productivity':
        return <FiClock className="text-orange-400 w-4 h-4" />;
      case 'github':
        return <FiGithub className="text-purple-400 w-4 h-4" />;
      case 'system':
      default:
        return <FiInfo className="text-zinc-400 w-4 h-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer relative transition-colors"
      >
        <FiBell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center border border-zinc-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[400px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllNotificationsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {(!notifications || notifications.length === 0) ? (
              <div className="p-8 text-center text-zinc-500 flex flex-col items-center gap-2">
                <FiBell className="w-8 h-8 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification: AppNotification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors group flex gap-3 ${notification.isRead ? 'opacity-60' : 'bg-blue-500/5'}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getIconForCategory(notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm truncate ${notification.isRead ? 'text-zinc-300' : 'text-white font-medium'}`}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.link && (
                        <a href={notification.link} className="text-xs text-blue-400 hover:underline mt-1 inline-block">
                          View details
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {!notification.isRead && (
                        <button 
                          onClick={() => markNotificationRead(notification.id)}
                          className="p-1 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                          title="Mark as read"
                        >
                          <FiCheck className="w-3 h-3" />
                        </button>
                      )}
                      <button 
                        onClick={() => clearNotification(notification.id)}
                        className="p-1 text-zinc-400 hover:text-red-400 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                        title="Remove"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
