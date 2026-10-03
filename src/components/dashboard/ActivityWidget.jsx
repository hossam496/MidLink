import { Link } from 'react-router-dom';
import { ListSkeleton } from '@/components/dashboard/DashboardSkeleton';

/**
 * ActivityWidget — renders the real-time audit-log activity feed.
 *
 * Receives pre-fetched data from DashboardPage (GET /api/dashboard/activity).
 * Each entry has: { _id, label, actorName, targetType, actionUrl, createdAt }
 *
 * Props:
 *   activity   Array of activity entries
 *   isLoading  Boolean
 */

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'الآن';
  if (diff < 3600)  return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

// Maps targetType to a colour class for the timeline dot.
const TARGET_DOT = {
  Donation:           'bg-blue-400',
  BeneficiaryRequest: 'bg-amber-400',
  User:               'bg-purple-400',
  NGO:                'bg-green-400',
};

function ActivityWidget({ activity = [], isLoading = false }) {
  return (
    <section aria-labelledby="activity-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="activity-heading" className="text-sm font-bold text-gray-800">
          آخر النشاطات
        </h2>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : activity.length === 0 ? (
        <EmptyActivity />
      ) : (
        <div className="card divide-y divide-gray-50 p-0 overflow-hidden">
          {activity.map((entry) => {
            const dot = TARGET_DOT[entry.targetType] ?? 'bg-gray-300';
            const inner = (
              <div className="flex items-start gap-3 px-4 py-3.5">
                {/* Timeline dot */}
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-1">
                    {entry.label}
                  </p>
                  {entry.actorName && (
                    <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
                      {entry.actorName}
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-xs text-gray-400 tabular-nums whitespace-nowrap">
                  {timeAgo(entry.createdAt)}
                </span>
              </div>
            );

            // Wrap in a Link if we have a URL to navigate to.
            return entry.actionUrl ? (
              <Link
                key={entry._id}
                to={entry.actionUrl}
                className="block hover:bg-gray-50/80 transition-colors"
              >
                {inner}
              </Link>
            ) : (
              <div key={entry._id}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EmptyActivity() {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100" aria-hidden="true">
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm text-gray-500">لا توجد نشاطات بعد.</p>
    </div>
  );
}

export default ActivityWidget;
