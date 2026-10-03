/**
 * DashboardSkeleton — shimmer placeholder shown while dashboard data loads.
 * Matches the visual structure of the real dashboard to minimise layout shift.
 */
function Shimmer({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-100 ${className}`}
      aria-hidden="true"
    />
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card flex flex-col gap-4 p-5 animate-pulse">
          <Shimmer className="h-10 w-10 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Shimmer className="h-6 w-10" />
            <Shimmer className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ rows = 4 }) {
  return (
    <div className="card divide-y divide-gray-50 p-0 overflow-hidden animate-pulse" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <Shimmer className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Shimmer className="h-3 w-1/2" />
            <Shimmer className="h-2.5 w-1/3" />
          </div>
          <Shimmer className="h-5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="جار التحميل…">
      {/* Welcome */}
      <div className="flex flex-col gap-2">
        <Shimmer className="h-7 w-56" />
        <Shimmer className="h-4 w-72" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card flex flex-col gap-2.5 p-4 animate-pulse">
            <Shimmer className="h-9 w-9 rounded-lg" />
            <Shimmer className="h-3.5 w-20" />
            <Shimmer className="h-2.5 w-16" />
          </div>
        ))}
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Shimmer className="h-4 w-28" />
          <ListSkeleton rows={4} />
        </div>
        <div className="flex flex-col gap-3">
          <Shimmer className="h-4 w-28" />
          <ListSkeleton rows={4} />
        </div>
      </div>
    </div>
  );
}

export { StatsSkeleton, ListSkeleton };
export default DashboardSkeleton;
