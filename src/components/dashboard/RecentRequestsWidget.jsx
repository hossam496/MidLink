import { Link } from 'react-router-dom';
import RequestStatusBadge from '@/components/common/RequestStatusBadge';
import { ListSkeleton }   from '@/components/dashboard/DashboardSkeleton';

/**
 * RecentRequestsWidget — shows a compact list of recent requests.
 * Used for:
 *   - Beneficiary: their outgoing requests (getMyRequests)
 *   - Donor/NGO/Admin: incoming requests on their donations (getReceivedRequests)
 *
 * Props:
 *   requests    Array of request objects
 *   title       Section heading string
 *   emptyMsg    Empty state message
 *   ctaTo       CTA route for empty state
 *   ctaLabel    CTA label for empty state
 *   viewAllTo   "View all" link route
 *   isLoading   Boolean
 *   error       String or null
 *   mode        'received' | 'my' — controls which fields to display
 */
function RecentRequestsWidget({
  requests   = [],
  title      = 'الطلبات الأخيرة',
  emptyMsg   = 'لا توجد طلبات بعد.',
  ctaTo      = '/donations',
  ctaLabel   = 'تصفح التبرعات',
  viewAllTo  = '/my-requests',
  isLoading  = false,
  error      = null,
  mode       = 'my',
}) {
  const recent = requests.slice(0, 5);

  function getItemName(req) {
    const d = req.donation;
    if (!d) return 'عنصر غير معروف';
    return d.itemType === 'medicine' ? d.medicine?.name : d.medicalDevice?.deviceType;
  }

  function getSubtitle(req) {
    if (mode === 'received') {
      const who = req.requesterSnapshot?.fullName || req.beneficiary?.name || '—';
      return `${who} · ${new Date(req.createdAt).toLocaleDateString('ar-EG')}`;
    }
    return `${req.donation?.category?.name ?? ''} · ${new Date(req.createdAt).toLocaleDateString('ar-EG')}`;
  }

  return (
    <section aria-labelledby="recent-requests-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="recent-requests-heading" className="text-sm font-bold text-gray-800">
          {title}
        </h2>
        <Link
          to={viewAllTo}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          aria-label={`عرض جميع ${title}`}
        >
          عرض الكل ←
        </Link>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : recent.length === 0 ? (
        <EmptyCard
          icon="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          message={emptyMsg}
          ctaLabel={ctaLabel}
          ctaTo={ctaTo}
        />
      ) : (
        <div className="card divide-y divide-gray-50 p-0 overflow-hidden">
          {recent.map((req) => (
            <Link
              key={req._id}
              to={`/requests/${req._id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/80 transition-colors group"
            >
              {/* Status indicator dot */}
              <StatusDot status={req.status} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                  {getItemName(req)}
                </p>
                <p className="truncate text-xs text-gray-400">{getSubtitle(req)}</p>
              </div>

              {/* Status badge */}
              <RequestStatusBadge status={req.status} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusDot({ status }) {
  const colours = {
    PENDING:     'bg-amber-400',
    APPROVED:    'bg-emerald-400',
    RESERVED:    'bg-purple-400',
    DISTRIBUTED: 'bg-teal-400',
    REJECTED:    'bg-red-400',
    CANCELLED:   'bg-gray-300',
  };
  const colour = colours[status] ?? 'bg-gray-300';
  return (
    <span className={`h-2 w-2 shrink-0 rounded-full ${colour}`} aria-hidden="true" />
  );
}

function EmptyCard({ icon, message, ctaLabel, ctaTo }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100" aria-hidden="true">
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <p className="text-sm text-gray-500">{message}</p>
      {ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          {ctaLabel} →
        </Link>
      )}
    </div>
  );
}

function ErrorCard({ message }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-8 text-center" role="alert">
      <svg className="h-6 w-6 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

export default RecentRequestsWidget;
