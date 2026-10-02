import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/services/notificationService';
import useAuth from '@/hooks/useAuth';

// ─── تنسيق الوقت ─────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'الآن';
  if (diff < 3600)  return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

function NotificationItem({ notification, onRead }) {
  const { _id, title, body, actionUrl, isRead, createdAt } = notification;

  async function handleClick() {
    if (!isRead) await onRead(_id);
  }

  return (
    <Link
      to={actionUrl || '/'}
      onClick={handleClick}
      className={`flex flex-col gap-1 px-4 py-3 transition-colors border-b border-gray-50 last:border-0
        ${!isRead
          ? 'bg-primary-50/40 hover:bg-primary-50/60'
          : 'hover:bg-gray-50'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm leading-relaxed ${!isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
          {title}
        </p>
        {!isRead && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-label="غير مقروء" />
        )}
      </div>
      {body && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{body}</p>}
      <p className="text-xs text-gray-400">{timeAgo(createdAt)}</p>
    </Link>
  );
}

function BellIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
    </svg>
  );
}

function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const [isOpen,        setIsOpen]        = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isLoading,     setIsLoading]     = useState(false);
  const dropdownRef = useRef(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getNotifications({ limit: 15 })
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  async function handleMarkAsRead(id) {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-primary-500 transition-colors"
        aria-label={`الإشعارات${unreadCount > 0 ? ` (${unreadCount} غير مقروء)` : ''}`}
        aria-expanded={isOpen}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center
                       rounded-full bg-primary-600 text-[10px] font-bold text-white ring-2 ring-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="الإشعارات"
          className="absolute left-0 z-50 mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-elevated overflow-hidden animate-scale-in"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-900">الإشعارات</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <BellIcon className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">لا توجد إشعارات بعد</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n._id} notification={n} onRead={handleMarkAsRead} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
