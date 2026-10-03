import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyRequests, cancelRequest } from '@/services/requestService';
import RequestStatusBadge from '@/components/common/RequestStatusBadge';
import ContactCard        from '@/components/requests/ContactCard';
import LoadingSpinner     from '@/components/common/LoadingSpinner';
import Alert              from '@/components/common/Alert';
import Button             from '@/components/common/Button';

const STATUS_FILTERS = [
  { value: '',            label: 'الكل'         },
  { value: 'PENDING',     label: 'قيد الانتظار' },
  { value: 'RESERVED',    label: 'موافق عليه'   },
  { value: 'DISTRIBUTED', label: 'تم الاستلام'  },
  { value: 'REJECTED',    label: 'مرفوض'        },
  { value: 'CANCELLED',   label: 'ملغي'         },
];

// ── Skeleton list ──────────────────────────────────────────────────────────
function RequestListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card animate-pulse flex flex-col gap-3">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-gray-100 shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-1/2 rounded bg-gray-100" />
                <div className="h-5 w-20 rounded-lg bg-gray-100" />
              </div>
              <div className="h-3 w-1/3 rounded bg-gray-100" />
              <div className="h-3 w-1/4 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Request card ───────────────────────────────────────────────────────────
function RequestCard({ request, onCancel }) {
  const { _id, status, donation, requestReason, createdAt, rejectionReason, donorContact } = request;

  const itemName = donation?.itemType === 'medicine'
    ? donation?.medicine?.name
    : donation?.medicalDevice?.deviceType;

  const primaryImage   = donation?.images?.find((i) => i.isPrimary) || donation?.images?.[0];
  const canCancel      = ['PENDING', 'APPROVED', 'RESERVED'].includes(status);
  const showDonorContact = ['RESERVED', 'DISTRIBUTED', 'APPROVED'].includes(status) && donorContact;

  return (
    <article className="card flex flex-col gap-4" aria-label={`طلب: ${itemName}`}>
      {/* Header row */}
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={itemName}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300" aria-hidden="true">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75z" />
              </svg>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/requests/${_id}`}
              className="text-sm font-bold text-gray-900 hover:text-primary-600 transition-colors truncate"
            >
              {itemName || 'عنصر غير معروف'}
            </Link>
            <RequestStatusBadge status={status} />
          </div>
          {donation?.category?.name && (
            <p className="mt-1 text-xs font-medium text-gray-500">{donation.category.name}</p>
          )}
          <p className="mt-0.5 text-xs text-gray-400">
            {new Date(createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Pending note */}
      {status === 'PENDING' && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
          <p className="text-xs font-medium text-amber-700">بانتظار موافقة المتبرع</p>
        </div>
      )}

      {/* Request reason */}
      {requestReason && (
        <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-bold text-gray-700">رسالتك: </span>
            {requestReason}
          </p>
        </div>
      )}

      {/* Rejection reason */}
      {rejectionReason && (
        <Alert variant="error" message={`سبب الرفض: ${rejectionReason}`} />
      )}

      {/* Donor contact */}
      {showDonorContact && (
        <ContactCard
          title="تواصل مع المتبرع"
          fullName={donorContact.fullName}
          phone={donorContact.phone}
          email={donorContact.email}
        />
      )}

      {/* Distributed success */}
      {status === 'DISTRIBUTED' && (
        <Alert variant="success" message="تم استلام هذا العنصر بنجاح." />
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-50">
        <Link to={`/requests/${_id}`} className="flex-1">
          <Button variant="secondary" className="w-full text-sm">
            عرض الطلب
          </Button>
        </Link>
        {canCancel && (
          <Button
            variant="danger"
            className="flex-1 text-sm"
            onClick={() => onCancel(_id)}
          >
            إلغاء
          </Button>
        )}
      </div>
    </article>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
function MyRequestsPage() {
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
      const data = await getMyRequests(params);
      setRequests(data.requests || []);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.message || 'فشل تحميل الطلبات.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(1); }, [fetchRequests]);

  async function handleCancel(requestId) {
    if (!window.confirm('هل تريد إلغاء هذا الطلب؟')) return;
    try {
      await cancelRequest(requestId);
      fetchRequests(pagination.page);
    } catch (err) {
      setError(err.message || 'فشل إلغاء الطلب.');
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">طلباتي</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {isLoading ? 'جاري التحميل…' : pagination.total > 0
                ? `${pagination.total.toLocaleString('ar-EG')} طلب`
                : 'لا توجد طلبات بعد'}
            </p>
          </div>
          <Link to="/donations">
            <Button variant="primary" className="text-sm gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              تصفح التبرعات
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">

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
          <RequestListSkeleton />
        ) : requests.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {requests.map((req) => (
                <RequestCard key={req._id} request={req} onCancel={handleCancel} />
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
      <p className="text-base font-semibold text-gray-700">لا توجد طلبات.</p>
      <p className="mt-1 text-sm text-gray-400">لم تُرسل أي طلبات بعد.</p>
      <Link
        to="/donations"
        className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        تصفح التبرعات المتاحة →
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

export default MyRequestsPage;
