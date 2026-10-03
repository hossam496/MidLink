import { Link } from 'react-router-dom';
import { ListSkeleton } from '@/components/dashboard/DashboardSkeleton';

/**
 * NotificationsWidget — shows recent notifications inside the dashboard body.
 * Uses pre-fetched data from DashboardPage; does NOT call the notification API
 * itself to avoid duplicate requests alongside NotificationCenter in the header.
 *
 * Props:
 *   notifications  Array of notification objects (from getNotifications)
 *   isLoading      Boolean
 *   error          String or null
 */

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'الآن';
  if (diff < 3600)  return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

function NotificationsWidget({ notifications = [], isLoading = false, error = null }) {
  const recent = notifications.slice(0, 5);

  return (
    <section aria-labelledby="notifications-widget-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="notifications-widget-heading" className="text-sm font-bold text-gray-800">
          آخر الإشعارات
        </h2>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <div className="card flex flex-col items-center gap-2 py-8 text-center" role="alert">
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      ) : recent.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100" aria-hidden="true">
            <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">لا توجد إشعارات بعد.</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50 p-0 overflow-hidden">
          {recent.map((n) => (
            <Link
              key={n._id}
              to={n.actionUrl || '/'}
              className={`flex items-start gap-3 px-4 py-3.5 transition-colors group
                ${!n.isRead ? 'bg-primary-50/30 hover:bg-primary-50/50' : 'hover:bg-gray-50/80'}`}
            >
              {/* Unread dot */}
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors
                  ${!n.isRead ? 'bg-primary-500' : 'bg-gray-200'}`}
                aria-label={!n.isRead ? 'غير مقروء' : ''}
              />

              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug line-clamp-1 ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'} group-hover:text-primary-700 transition-colors`}>
                  {n.title}
                </p>
                {n.body && (
                  <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{n.body}</p>
                )}
              </div>

              <span className="shrink-0 text-xs text-gray-400 tabular-nums whitespace-nowrap">
                {timeAgo(n.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default NotificationsWidget;
