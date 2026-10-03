import { Link } from 'react-router-dom';
import DonationStatusBadge from '@/components/donations/DonationStatusBadge';
import { ListSkeleton }    from '@/components/dashboard/DashboardSkeleton';

/**
 * RecentDonationsWidget — shows the donor's latest donations.
 * Receives pre-fetched data from DashboardPage to avoid duplicate API calls.
 *
 * Props:
 *   donations  Array of donation objects (from getMyDonations)
 *   isLoading  Boolean
 *   error      String or null
 */
function RecentDonationsWidget({ donations = [], isLoading = false, error = null }) {
  const recent = donations.slice(0, 5);

  return (
    <section aria-labelledby="recent-donations-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="recent-donations-heading" className="text-sm font-bold text-gray-800">
          تبرعاتي الأخيرة
        </h2>
        <Link
          to="/donations"
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          aria-label="عرض جميع التبرعات"
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
          icon="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          message="لم تُضف أي تبرعات بعد."
          ctaLabel="أضف تبرعك الأول"
          ctaTo="/donations/new"
        />
      ) : (
        <div className="card divide-y divide-gray-50 p-0 overflow-hidden">
          {recent.map((donation) => {
            const title =
              donation.itemType === 'medicine'
                ? donation.medicine?.name
                : donation.medicalDevice?.deviceType;
            const primaryImage =
              donation.images?.find((i) => i.isPrimary) || donation.images?.[0];

            return (
              <Link
                key={donation._id}
                to={`/donations/${donation._id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/80 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {primaryImage ? (
                    <img
                      src={primaryImage.url}
                      alt={title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300" aria-hidden="true">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {title || 'عنصر غير معروف'}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {donation.category?.name} · {new Date(donation.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>

                {/* Status */}
                <DonationStatusBadge status={donation.status} />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Shared sub-components ───────────────────────────────────────────────────

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

export default RecentDonationsWidget;
