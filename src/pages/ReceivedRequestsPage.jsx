import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getReceivedRequests } from '@/services/requestService';
import RequestStatusBadge from '@/components/common/RequestStatusBadge';
import LoadingSpinner     from '@/components/common/LoadingSpinner';
import Alert              from '@/components/common/Alert';
import Button             from '@/components/common/Button';

const STATUS_FILTERS = [
  { value: '',            label: 'الكل' },
  { value: 'PENDING',     label: 'قيد الانتظار' },
  { value: 'RESERVED',    label: 'موافق / محجوز' },
  { value: 'DISTRIBUTED', label: 'تم التسليم' },
  { value: 'REJECTED',    label: 'مرفوض' },
  { value: 'CANCELLED',   label: 'ملغي' },
];

function itemName(donation) {
  if (!donation) return 'عنصر غير معروف';
  return donation.itemType === 'medicine'
    ? donation.medicine?.name
    : donation.medicalDevice?.deviceType;
}

function ReceivedRequestsPage() {
  const [requests, setRequests]         = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination]     = useState({ page: 1, pages: 1, total: 0 });

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
      <div className="page-header">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900">طلبات التبرعات</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination.total > 0
              ? `${pagination.total} طلب على تبرعاتك`
              : 'لا توجد طلبات على تبرعاتك بعد'}
          </p>
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
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {!statusFilter && pendingCount > 0 && (
          <Alert
            variant="info"
            message={`لديك ${pendingCount} طلب بانتظار المراجعة في هذه الصفحة.`}
            className="mb-4"
          />
        )}

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
            <p className="text-gray-500 font-medium">لا توجد طلبات حالياً.</p>
            <Link to="/donations/new" className="mt-3 text-sm font-semibold text-primary-600">
              أنشئ تبرعاً جديداً
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">العنصر</th>
                    <th className="px-4 py-3 font-semibold">الطالب</th>
                    <th className="px-4 py-3 font-semibold">التاريخ</th>
                    <th className="px-4 py-3 font-semibold">الحالة</th>
                    <th className="px-4 py-3 font-semibold">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {itemName(req.donation)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {req.requesterSnapshot?.fullName || req.beneficiary?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-4 py-3">
                        <RequestStatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/requests/${req._id}`}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                        >
                          عرض
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchRequests(pagination.page - 1)}
                  className="text-sm"
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
                  className="text-sm"
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

export default ReceivedRequestsPage;
