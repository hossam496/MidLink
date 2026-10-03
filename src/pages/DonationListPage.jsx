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
  { value: '',               label: 'جميع الأنواع'  },
  { value: 'medicine',       label: 'أدوية'          },
  { value: 'medical_device', label: 'أجهزة طبية'     },
];

// ── Icons ──────────────────────────────────────────────────────────────────
function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICON_FILTER   = 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75';
const ICON_LOCATION = 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z';
const ICON_CHECK    = 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
const ICON_PLUS     = 'M12 4.5v15m7.5-7.5h-15';
const ICON_EMPTY    = 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z';
const ICON_PREV     = 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3';
const ICON_NEXT     = 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18';

// ── Skeleton for the card grid ─────────────────────────────────────────────
function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card animate-pulse flex flex-col gap-3">
          <div className="aspect-video w-full rounded-xl bg-gray-100" />
          <div className="flex flex-col gap-2 px-0.5">
            <div className="h-4 w-3/4 rounded bg-gray-100" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
            <div className="h-3 w-1/3 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
function DonationListPage() {
  const { isAuthenticated, user } = useAuth();

  const [donations,  setDonations]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);   // mobile filter drawer

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

  const activeFilterCount = [
    filters.itemType,
    filters.categoryId,
    filters.useLocation,
  ].filter(Boolean).length;

  // ── Filter panel (shared between desktop sidebar and mobile drawer) ──────
  const FilterPanel = (
    <div className="flex flex-col gap-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800">
        <Icon path={ICON_FILTER} className="h-4 w-4 text-primary-600" />
        الفلاتر
        {activeFilterCount > 0 && (
          <span className="ms-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white" aria-label={`${activeFilterCount} فلاتر نشطة`}>
            {activeFilterCount}
          </span>
        )}
      </h2>

      {/* Item type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-type" className="text-xs font-semibold text-gray-600">النوع</label>
        <select
          id="filter-type"
          className="input"
          value={filters.itemType}
          onChange={(e) => handleFilterChange('itemType', e.target.value)}
        >
          {ITEM_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-category" className="text-xs font-semibold text-gray-600">التصنيف</label>
        <select
          id="filter-category"
          className="input"
          value={filters.categoryId}
          onChange={(e) => handleFilterChange('categoryId', e.target.value)}
        >
          <option value="">جميع التصنيفات</option>
          {visibleCategories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Proximity */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-600">بالقرب مني</label>
        <Button
          type="button"
          variant="secondary"
          className="w-full text-xs gap-1.5"
          onClick={handleDetectLocation}
        >
          {filters.useLocation ? (
            <>
              <Icon path={ICON_CHECK} className="h-3.5 w-3.5 text-green-600" />
              تم تحديد الموقع
            </>
          ) : (
            <>
              <Icon path={ICON_LOCATION} className="h-3.5 w-3.5" />
              استخدام موقعي
            </>
          )}
        </Button>

        {filters.useLocation && (
          <div>
            <label className="text-xs font-medium text-gray-500">
              النطاق: <span className="font-bold text-primary-700">{filters.radiusKm} كم</span>
            </label>
            <input
              type="range"
              min="5" max="100" step="5"
              value={filters.radiusKm}
              onChange={(e) => handleFilterChange('radiusKm', Number(e.target.value))}
              className="mt-1.5 w-full"
              aria-label="نطاق البحث بالكيلومتر"
            />
            <div className="mt-0.5 flex justify-between text-[10px] text-gray-400">
              {RADIUS_OPTIONS.map((r) => <span key={r}>{r}</span>)}
            </div>
            <button
              type="button"
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => handleFilterChange('useLocation', false)}
            >
              إلغاء الموقع
            </button>
          </div>
        )}
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={() => setFilters({ itemType: '', categoryId: '', radiusKm: 25, longitude: '', latitude: '', useLocation: false })}
          className="text-xs font-semibold text-danger-500 hover:text-danger-600 transition-colors"
        >
          إعادة ضبط الفلاتر
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">التبرعات المتاحة</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {isLoading ? 'جاري التحميل…' : pagination.total > 0
                ? `${pagination.total.toLocaleString('ar-EG')} تبرع متاح`
                : 'لا توجد تبرعات مطابقة'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden relative inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              aria-expanded={filtersOpen}
              aria-label="الفلاتر"
            >
              <Icon path={ICON_FILTER} className="h-3.5 w-3.5" />
              فلاتر
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white" aria-hidden="true">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Donate CTA */}
            {isAuthenticated && user?.role === ROLES.DONOR && (
              <Link to="/donations/new">
                <Button variant="primary" className="gap-1.5 text-sm">
                  <Icon path={ICON_PLUS} className="h-3.5 w-3.5" />
                  تبرع الآن
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      {filtersOpen && (
        <div className="lg:hidden border-b border-gray-100 bg-white px-4 py-5 shadow-sm">
          <div className="mx-auto max-w-6xl">
            {FilterPanel}
          </div>
        </div>
      )}

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex gap-6">

          {/* Desktop sidebar */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="card sticky top-20 p-5">
              {FilterPanel}
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {error && <Alert variant="error" message={error} className="mb-5" />}

            {isLoading ? (
              <CardGridSkeleton />
            ) : donations.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {donations.map((donation) => (
                    <DonationCard key={donation._id} donation={donation} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <Pagination
                    page={pagination.page}
                    pages={pagination.pages}
                    onPrev={() => fetchDonations(pagination.page - 1)}
                    onNext={() => fetchDonations(pagination.page + 1)}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100" aria-hidden="true">
        <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={ICON_EMPTY} />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-700">لا توجد تبرعات</p>
      <p className="mt-1 text-sm text-gray-400">حاول تعديل الفلاتر أو توسيع نطاق البحث.</p>
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
        className="text-sm gap-1.5"
        aria-label="الصفحة السابقة"
      >
        <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PREV} />
        </svg>
        السابق
      </Button>

      <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 tabular-nums">
        {page} / {pages}
      </span>

      <Button
        variant="secondary"
        disabled={page >= pages}
        onClick={onNext}
        className="text-sm gap-1.5"
        aria-label="الصفحة التالية"
      >
        التالي
        <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={ICON_NEXT} />
        </svg>
      </Button>
    </div>
  );
}

export default DonationListPage;
