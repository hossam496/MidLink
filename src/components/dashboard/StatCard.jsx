/**
 * StatCard — a single KPI metric tile for the dashboard.
 *
 * Props:
 *   icon       SVG path string (Heroicons 24px outline)
 *   iconBg     Tailwind bg + text colour pair for the icon container, e.g. 'bg-blue-50 text-blue-600'
 *   title      Short metric label
 *   value      Number or string to display large
 *   isLoading  Shows skeleton shimmer while data fetches
 */
function StatCard({ icon, iconBg = 'bg-primary-50 text-primary-600', title, value, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="card flex flex-col gap-4 p-5 animate-pulse" aria-hidden="true">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-gray-100" />
          <div className="h-3 w-16 rounded bg-gray-100" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-7 w-12 rounded bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="card group flex flex-col gap-3 p-5 transition-shadow duration-200 hover:shadow-card-hover">
      {/* Icon */}
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-105`}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>

      {/* Metric */}
      <div>
        <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
          {value ?? '—'}
        </p>
        <p className="mt-1 text-xs font-medium text-gray-500">{title}</p>
      </div>
    </div>
  );
}

export default StatCard;
