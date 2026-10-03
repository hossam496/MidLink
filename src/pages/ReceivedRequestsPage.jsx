import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getReceivedRequests } from '@/services/requestService';
import RequestStatusBadge from '@/components/common/RequestStatusBadge';
import LoadingSpinner     from '@/components/common/LoadingSpinner';
import Alert              from '@/components/common/Alert';
import Button             from '@/components/common/Button';

const STATUS_FILTERS = [
  { value: '',            label: 'الكل'           },
  { value: 'PENDING',     label: 'قيد الانتظار'   },
  { value: 'RESERVED',    label: 'موافق / محجوز'  },
  { value: 'DISTRIBUTED', label: 'تم التسليم'     },
  { value: 'REJECTED',    label: 'مرفوض'          },
  { value: 'CANCELLED',   label: 'ملغي'           },
];

function itemName(donation) {
  if (!donation) return 'عنصر غير معروف';
  return donation.itemType === 'medicine'
    ? donation.medicine?.name
    : donation.medicalDevice?.deviceType;
}

// ── Table skeleton ─────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm" aria-hidden="true">
      <div className="bg-gray-50 px-4 py-3 grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-gray-200 animate-pulse" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-t border-gray-50 px-4 py-3.5 grid grid-cols-5 gap-4 animate-pulse">
          <div className="h-3.5 rounded bg-gray-100" />
          <div className="h-3.5 rounded bg-gray-100" />
          <div className="h-3.5 w-3/4 rounded bg-gray-100" />
          <div className="h-5 w-20 rounded-lg bg-gray-100" />
          <div className="h-3.5 w-8 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
function ReceivedRequestsPage() {
  const [requests,     setRequests]     = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination,   setPagination]   = useState({ page: 1, pages: 1, total: 0 });

  const fetchRequests = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (statusFilter) params.status = statusFilter;
      const data = await getReceivedRequests(params);
      setRequests(data.requests || []);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.message || 'فشل تحميل الطلبات.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(1); }, [fetchRequests]);

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-surface-50">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">طلبات التبرعات</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {isLoading ? 'جاري التحميل…' : pagination.total > 0
                ? `${pagination.total.toLocaleString('ar-EG')} طلب على تبرعاتك`
                : 'لا توجد طلبات على تبرعاتك بعد'}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">

        {/* ── Pending alert ──────────────────────────────────────────── */}
        {!statusFilter && !isLoading && pendingCount > 0 && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3" role="alert">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100" aria-hidden="true">
              <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </span>
            <p className="text-sm font-medium text-amber-800">
              لديك <span className="font-bold">{pendingCount}</span> طلب بانتظار المراجعة في هذه الصفحة.
            </p>
          </div>
        )}

        {/* ── Status filter chips ────────────────────────────────────── */}
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="فلترة الحالة">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all
                ${statusFilter === value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
              aria-pressed={statusFilter === value}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <Alert variant="error" message={error} className="mb-5" />}

        {isLoading ? (
          <TableSkeleton />
        ) : requests.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ── Desktop table ──────────────────────────────────────── */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-sm text-right" role="table">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th scope="col" className="px-5 py-3 text-xs font-semibold text-gray-500">العنصر</th>
                    <th scope="col" className="px-5 py-3 text-xs font-semibold text-gray-500">الطالب</th>
                    <th scope="col" className="px-5 py-3 text-xs font-semibold text-gray-500">التاريخ</th>
                    <th scope="col" className="px-5 py-3 text-xs font-semibold text-gray-500">الحالة</th>
                    <th scope="col" className="px-5 py-3 text-xs font-semibold text-gray-500">
                      <span className="sr-only">إجراء</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                          {itemName(req.donation)}
                        </span>
                        {req.donation?.category?.name && (
                          <p className="text-xs text-gray-400 mt-0.5">{req.donation.category.name}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {req.requesterSnapshot?.fullName || req.beneficiary?.name || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                        {new Date(req.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <RequestStatusBadge status={req.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/requests/${req._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                          aria-label={`عرض طلب ${itemName(req.donation)}`}
                        >
                          عرض
                          <svg className="h-3 w-3 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list (table doesn't work well on small screens) */}
            <div className="flex flex-col gap-3 sm:hidden">
              {requests.map((req) => (
                <Link
                  key={req._id}
                  to={`/requests/${req._id}`}
                  className="card flex items-center gap-3 hover:shadow-card-hover transition-shadow"
                >
                  {/* Status dot */}
                  <span className="h-2 w-2 shrink-0 rounded-full mt-0.5
                    bg-amber-400
                    [.APPROVED_&]:bg-emerald-400
                    " aria-hidden="true" />

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {itemName(req.donation)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {req.requesterSnapshot?.fullName || req.beneficiary?.name || '—'}
                      {' · '}
                      {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>

                  <RequestStatusBadge status={req.status} />
                </Link>
              ))}
            </div>

            {pagination.pages > 1 && (
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPrev={() => fetchRequests(pagination.page - 1)}
                onNext={() => fetchRequests(pagination.page + 1)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100" aria-hidden="true">
        <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-700">لا توجد طلبات حالياً.</p>
      <p className="mt-1 text-sm text-gray-400">ستظهر هنا طلبات المستفيدين على تبرعاتك.</p>
      <Link
        to="/donations/new"
        className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        أنشئ تبرعاً جديداً →
      </Link>
    </div>
  );
}

function Pagination({ page, pages, onPrev, onNext }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <Button
        variant="secondary"
        disabled={page <= 1}
        onClick={onPrev}
        className="text-sm"
        aria-label="الصفحة السابقة"
      >
        السابق
      </Button>
      <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 tabular-nums">
        {page} / {pages}
      </span>
      <Button
        variant="secondary"
        disabled={page >= pages}
        onClick={onNext}
        className="text-sm"
        aria-label="الصفحة التالية"
      >
        التالي
      </Button>
    </div>
  );
}

export default ReceivedRequestsPage;
