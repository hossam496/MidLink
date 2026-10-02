import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getNearbyDonations } from '@/services/geoService';
import { listCategories }     from '@/services/donationService';
import MapView                from '@/components/map/MapView';
import DonationCard           from '@/components/donations/DonationCard';
import LoadingSpinner         from '@/components/common/LoadingSpinner';
import Alert                  from '@/components/common/Alert';
import Button                 from '@/components/common/Button';
import useGeolocation         from '@/hooks/useGeolocation';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];
const ITEM_TYPES = [
  { value: '',               label: 'جميع الأنواع' },
  { value: 'medicine',       label: 'أدوية'         },
  { value: 'medical_device', label: 'أجهزة طبية'    },
];

function DonationMapPage() {
  const { coords, isLoading: locLoading, error: locError, requestLocation } = useGeolocation();

  const [donations,  setDonations]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState('');
  const [view,       setView]       = useState('map');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [filters, setFilters] = useState({ radiusKm: 25, categoryId: '', itemType: '' });

  useEffect(() => {
    listCategories().then((d) => setCategories(d.categories || [])).catch(() => {});
  }, []);

  const fetchDonations = useCallback(async (page = 1) => {
    if (!coords) return;
    setIsLoading(true);
    setError('');
    try {
      const params = {
        longitude: coords.longitude,
        latitude:  coords.latitude,
        radiusKm:  filters.radiusKm,
        page,
        limit:     50,
      };
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.itemType)   params.itemType   = filters.itemType;
      const data = await getNearbyDonations(params);
      setDonations(data.donations || []);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.message || 'فشل تحميل التبرعات القريبة.');
    } finally {
      setIsLoading(false);
    }
  }, [coords, filters]);

  useEffect(() => { fetchDonations(1); }, [fetchDonations]);

  const userLocation = coords ? { lat: coords.latitude, lng: coords.longitude } : null;

  return (
    <div className="flex h-screen flex-col bg-surface-50">
      {/* الترويسة */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 shrink-0 shadow-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">خريطة التبرعات</h1>
            {pagination.total > 0 && coords && (
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-primary-700">{pagination.total}</span> تبرع ضمن {filters.radiusKm} كم
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              {[
                { v: 'map', label: 'خريطة', icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z' },
                { v: 'list', label: 'قائمة', icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
              ].map(({ v, label, icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all
                    ${view === v ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                  {label}
                </button>
              ))}
            </div>
            <Link to="/donations">
              <Button variant="secondary" className="text-xs py-2">تصفح الكل</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* شريط الفلاتر */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 shrink-0">
        <div className="mx-auto flex max-w-7xl items-center gap-3 flex-wrap">
          {!coords ? (
            <Button variant="primary" className="text-xs py-2 gap-1.5" isLoading={locLoading} onClick={requestLocation}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              استخدام موقعي
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-success-600 font-semibold">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              تم تحديد الموقع
            </span>
          )}

          {locError && <span className="text-xs text-danger-500 font-medium">{locError}</span>}

          {coords && (
            <>
              <select
                className="input py-1.5 text-xs rounded-xl"
                style={{ width: 'auto' }}
                value={filters.radiusKm}
                onChange={(e) => setFilters((p) => ({ ...p, radiusKm: Number(e.target.value) }))}
              >
                {RADIUS_OPTIONS.map((r) => <option key={r} value={r}>{r} كم</option>)}
              </select>

              <select
                className="input py-1.5 text-xs rounded-xl"
                style={{ width: 'auto' }}
                value={filters.itemType}
                onChange={(e) => setFilters((p) => ({ ...p, itemType: e.target.value }))}
              >
                {ITEM_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                className="input py-1.5 text-xs rounded-xl"
                style={{ width: 'auto' }}
                value={filters.categoryId}
                onChange={(e) => setFilters((p) => ({ ...p, categoryId: e.target.value }))}
              >
                <option value="">جميع التصنيفات</option>
                {categories
                  .filter((c) => !filters.itemType || c.itemType === filters.itemType)
                  .map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 overflow-hidden">
        {error && <div className="p-4"><Alert variant="error" message={error} /></div>}

        {!coords && !locLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-50">
              <svg className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">اكتشف التبرعات القريبة</p>
              <p className="mt-1 text-sm text-gray-500">شارك موقعك للعثور على التبرعات المتاحة في منطقتك</p>
            </div>
            <Button variant="primary" isLoading={locLoading} onClick={requestLocation} className="gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              تفعيل الموقع
            </Button>
          </div>
        )}

        {locLoading && (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" label="جاري تحديد موقعك..." />
          </div>
        )}

        {coords && view === 'map' && (
          <MapView donations={donations} userLocation={userLocation} radiusKm={filters.radiusKm} height="100%" />
        )}

        {coords && view === 'list' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            {isLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : donations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">لا توجد تبرعات قريبة.</p>
                <p className="text-sm text-gray-400 mt-1">حاول توسيع نطاق البحث.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {donations.map((d) => <DonationCard key={d._id} donation={d} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DonationMapPage;
