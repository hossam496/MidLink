import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listDonations, listCategories } from '@/services/donationService';
import DonationCard   from '@/components/donations/DonationCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Alert          from '@/components/common/Alert';
import Button         from '@/components/common/Button';
import useAuth        from '@/hooks/useAuth';
import { ROLES }      from '@/config/constants';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];
const ITEM_TYPES = [
  { value: '',               label: 'جميع الأنواع'    },
  { value: 'medicine',       label: 'أدوية'            },
  { value: 'medical_device', label: 'أجهزة طبية'       },
];

function DonationListPage() {
  const { isAuthenticated, user } = useAuth();

  const [donations,  setDonations]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [filters, setFilters] = useState({
    itemType:    '',
    categoryId:  '',
    radiusKm:    25,
    longitude:   '',
    latitude:    '',
    useLocation: false,
  });

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const fetchDonations = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (filters.itemType)   params.itemType   = filters.itemType;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.useLocation && filters.longitude && filters.latitude) {
        params.longitude = filters.longitude;
        params.latitude  = filters.latitude;
        params.radiusKm  = filters.radiusKm;
      }
      const data = await listDonations(params);
      setDonations(data.donations || []);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.message || 'فشل تحميل التبرعات.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchDonations(1); }, [fetchDonations]);

  function handleDetectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setFilters((prev) => ({
        ...prev,
        latitude:    pos.coords.latitude,
        longitude:   pos.coords.longitude,
        useLocation: true,
      })),
      () => {}
    );
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const visibleCategories = categories.filter(
    (c) => !filters.itemType || c.itemType === filters.itemType
  );

  return (
    <div className="min-h-screen bg-surface-50">
      {/* الترويسة */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التبرعات المتاحة</h1>
            <p className="mt-1 text-sm text-gray-500">
              {pagination.total > 0
                ? `${pagination.total} تبرع متاح`
                : 'لا توجد تبرعات'}
            </p>
          </div>
          {isAuthenticated && user?.role === ROLES.DONOR && (
            <Link to="/donations/new">
              <Button variant="primary" className="gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                تبرع الآن
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* الفلاتر */}
          <aside className="w-full shrink-0 lg:w-64">
            <div className="card flex flex-col gap-5 lg:sticky lg:top-20">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                الفلاتر
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">النوع</label>
                <select
                  className="input bg-white text-gray-800"
                  value={filters.itemType}
                  onChange={(e) => handleFilterChange('itemType', e.target.value)}
                >
                  {ITEM_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">التصنيف</label>
                <select
                  className="input bg-white text-gray-800"
                  value={filters.categoryId}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                >
                  <option value="">جميع التصنيفات</option>
                  {visibleCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">بالقرب مني</label>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full text-xs gap-1.5"
                  onClick={handleDetectLocation}
                >
                  {filters.useLocation ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      تم تحديد الموقع
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      استخدام موقعي
                    </>
                  )}
                </Button>
                {filters.useLocation && (
                  <div className="mt-2">
                    <label className="text-xs font-medium text-gray-500">
                      النطاق: <span className="font-bold text-primary-700">{filters.radiusKm} كم</span>
                    </label>
                    <input
                      type="range"
                      min="5" max="100" step="5"
                      value={filters.radiusKm}
                      onChange={(e) => handleFilterChange('radiusKm', Number(e.target.value))}
                      className="mt-1.5 w-full accent-primary-600"
                      aria-label="نطاق البحث بالكيلومتر"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      {RADIUS_OPTIONS.map((r) => <span key={r}>{r}</span>)}
                    </div>
                  </div>
                )}
                {filters.useLocation && (
                  <button
                    type="button"
                    className="mt-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => handleFilterChange('useLocation', false)}
                  >
                    إلغاء الموقع
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* شبكة التبرعات */}
          <main className="flex-1">
            {error && <Alert variant="error" message={error} className="mb-4" />}

            {isLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : donations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-base font-medium">لا توجد تبرعات</p>
                <p className="mt-1 text-sm text-gray-400">
                  حاول تعديل الفلاتر أو توسيع نطاق البحث.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {donations.map((donation) => (
                    <DonationCard key={donation._id} donation={donation} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <Button
                      variant="secondary"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchDonations(pagination.page - 1)}
                      className="text-sm gap-1"
                    >
                      <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      السابق
                    </Button>
                    <span className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">
                      {pagination.page} / {pagination.pages}
                    </span>
                    <Button
                      variant="secondary"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => fetchDonations(pagination.page + 1)}
                      className="text-sm gap-1"
                    >
                      التالي
                      <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default DonationListPage;
