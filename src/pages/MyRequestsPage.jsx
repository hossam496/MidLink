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

function RequestCard({ request, onCancel }) {
  const { _id, status, donation, requestReason, createdAt, rejectionReason, donorContact } = request;

  const itemName = donation?.itemType === 'medicine'
    ? donation?.medicine?.name
    : donation?.medicalDevice?.deviceType;

  const primaryImage = donation?.images?.find((i) => i.isPrimary) || donation?.images?.[0];
  const canCancel    = ['PENDING', 'APPROVED', 'RESERVED'].includes(status);
  const showDonorContact = ['RESERVED', 'DISTRIBUTED', 'APPROVED'].includes(status) && donorContact;

  return (
    <div className="card flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {primaryImage ? (
            <img src={primaryImage.url} alt={itemName} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/requests/${_id}`}
              className="text-sm font-bold text-gray-900 hover:text-primary-600 truncate transition-colors"
            >
              {itemName || 'عنصر غير معروف'}
            </Link>
            <RequestStatusBadge status={status} />
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">{donation?.category?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(createdAt).toLocaleDateString('ar-EG')}
          </p>
        </div>
      </div>

      {status === 'PENDING' && (
        <p className="text-xs font-medium text-amber-700">🟡 بانتظار موافقة المتبرع</p>
      )}

      {requestReason && (
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-bold text-gray-700">رسالتك:</span> {requestReason}
          </p>
        </div>
      )}

      {rejectionReason && (
        <Alert variant="error" message={`سبب الرفض: ${rejectionReason}`} />
      )}

      {showDonorContact && (
        <ContactCard
          title="تواصل مع المتبرع"
          fullName={donorContact.fullName}
          phone={donorContact.phone}
          email={donorContact.email}
        />
      )}

      {status === 'DISTRIBUTED' && (
        <Alert variant="success" message="تم استلام هذا العنصر بنجاح." />
      )}

      <div className="flex gap-2">
        <Link to={`/requests/${_id}`} className="flex-1">
          <Button variant="secondary" className="w-full text-sm">عرض الطلب</Button>
        </Link>
        {canCancel && (
          <Button variant="danger" className="flex-1 text-sm" onClick={() => onCancel(_id)}>
            إلغاء
          </Button>
        )}
      </div>
    </div>
  );
}

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
      <div className="page-header">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">طلباتي</h1>
            <p className="mt-1 text-sm text-gray-500">
              {pagination.total > 0 ? `${pagination.total} طلب` : 'لا توجد طلبات بعد'}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all
                ${statusFilter === value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <Alert variant="error" message={error} className="mb-4" />}

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">لا توجد طلبات.</p>
            <Link to="/donations" className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              تصفح التبرعات المتاحة
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {requests.map((req) => (
                <RequestCard key={req._id} request={req} onCancel={handleCancel} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchRequests(pagination.page - 1)}
                  className="text-sm gap-1"
                >
                  السابق
                </Button>
                <span className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">
                  {pagination.page} / {pagination.pages}
                </span>
                <Button
                  variant="secondary"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchRequests(pagination.page + 1)}
                  className="text-sm gap-1"
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyRequestsPage;
