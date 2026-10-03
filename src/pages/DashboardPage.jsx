import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { ROLES } from '@/config/constants';

// ── Existing services (unchanged) ────────────────────────────────────────────
import { getMyDonations }                        from '@/services/donationService';
import { getMyRequests, getReceivedRequests }     from '@/services/requestService';
import { getNotifications }                      from '@/services/notificationService';

// ── New dashboard-specific service ───────────────────────────────────────────
import { getOverview, getActivity }              from '@/services/dashboardService';

// ── Dashboard UI components ───────────────────────────────────────────────────
import WelcomeBanner         from '@/components/dashboard/WelcomeBanner';
import QuickActions          from '@/components/dashboard/QuickActions';
import StatCard              from '@/components/dashboard/StatCard';
import RecentDonationsWidget from '@/components/dashboard/RecentDonationsWidget';
import RecentRequestsWidget  from '@/components/dashboard/RecentRequestsWidget';
import NotificationsWidget   from '@/components/dashboard/NotificationsWidget';
import ActivityWidget        from '@/components/dashboard/ActivityWidget';
import DashboardSkeleton     from '@/components/dashboard/DashboardSkeleton';

// ─── Icon paths (Heroicons 24 outline) ──────────────────────────────────────
const ICONS = {
  gift:    'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
  check:   'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  clock:   'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  list:    'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  truck:   'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
  inbox:   'M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z',
  users:   'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  flag:    'M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5',
  warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  map:     'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
  chart:   'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
};

// ─── Build stat cards from the overview API response ─────────────────────────
// Returns an array of { icon, iconBg, title, value } for the StatCard grid.
// All numbers come directly from the backend aggregation — no client-side maths.
function buildStatsFromOverview(role, overview) {
  if (!overview) return [];

  if (role === ROLES.DONOR || role === ROLES.NGO) {
    return [
      {
        icon:   ICONS.gift,
        iconBg: 'bg-blue-50 text-blue-600',
        title:  'إجمالي تبرعاتي',
        value:  overview.donations?.total ?? 0,
      },
      {
        icon:   ICONS.check,
        iconBg: 'bg-green-50 text-green-600',
        title:  'تبرعات نشطة',
        value:  overview.donations?.active ?? 0,
      },
      {
        icon:   ICONS.clock,
        iconBg: 'bg-amber-50 text-amber-600',
        title:  'طلبات بانتظار الرد',
        value:  overview.receivedRequests?.pending ?? 0,
      },
      {
        icon:   ICONS.truck,
        iconBg: 'bg-teal-50 text-teal-600',
        title:  'تم التسليم',
        value:  overview.donations?.distributed ?? 0,
      },
    ];
  }

  if (role === ROLES.BENEFICIARY) {
    return [
      {
        icon:   ICONS.list,
        iconBg: 'bg-blue-50 text-blue-600',
        title:  'إجمالي طلباتي',
        value:  overview.requests?.total ?? 0,
      },
      {
        icon:   ICONS.clock,
        iconBg: 'bg-amber-50 text-amber-600',
        title:  'قيد الانتظار',
        value:  overview.requests?.pending ?? 0,
      },
      {
        icon:   ICONS.check,
        iconBg: 'bg-green-50 text-green-600',
        title:  'موافق عليها',
        value:  (overview.requests?.approved ?? 0) + (overview.requests?.reserved ?? 0),
      },
      {
        icon:   ICONS.truck,
        iconBg: 'bg-teal-50 text-teal-600',
        title:  'تم الاستلام',
        value:  overview.requests?.distributed ?? 0,
      },
    ];
  }

  if (role === ROLES.ADMIN) {
    return [
      {
        icon:   ICONS.users,
        iconBg: 'bg-purple-50 text-purple-600',
        title:  'إجمالي المستخدمين',
        value:  overview.users?.total ?? 0,
      },
      {
        icon:   ICONS.gift,
        iconBg: 'bg-blue-50 text-blue-600',
        title:  'إجمالي التبرعات',
        value:  overview.donations?.total ?? 0,
      },
      {
        icon:   ICONS.inbox,
        iconBg: 'bg-amber-50 text-amber-600',
        title:  'طلبات نشطة',
        value:  overview.requests?.total ?? 0,
      },
      {
        icon:   ICONS.flag,
        iconBg: 'bg-red-50 text-red-600',
        title:  'بلاغات مفتوحة',
        value:  overview.system?.openReports ?? 0,
      },
    ];
  }

  return [];
}

// ─── ImpactCard numbers come from the overview API too ───────────────────────
function buildImpactMetrics(role, overview) {
  if (!overview) return [];

  if (role === ROLES.DONOR || role === ROLES.NGO) {
    return [
      { label: 'إجمالي التبرعات',   value: overview.donations?.total       ?? 0 },
      { label: 'تم التسليم',         value: overview.donations?.distributed  ?? 0 },
      { label: 'طلبات واردة',        value: overview.receivedRequests?.total  ?? 0 },
      { label: 'طلبات مكتملة',       value: overview.receivedRequests?.distributed ?? 0 },
    ].filter((m) => m.value > 0);
  }

  if (role === ROLES.BENEFICIARY) {
    return [
      { label: 'إجمالي طلباتي', value: overview.requests?.total       ?? 0 },
      { label: 'تم استلامها',    value: overview.requests?.distributed  ?? 0 },
      { label: 'قيد الانتظار',  value: overview.requests?.pending      ?? 0 },
    ].filter((m) => m.value > 0);
  }

  if (role === ROLES.ADMIN) {
    return [
      { label: 'المستخدمون',    value: overview.users?.total         ?? 0 },
      { label: 'التبرعات',      value: overview.donations?.total     ?? 0 },
      { label: 'متاحة الآن',    value: overview.donations?.available ?? 0 },
      { label: 'تم التوزيع',    value: overview.donations?.distributed ?? 0 },
    ].filter((m) => m.value > 0);
  }

  return [];
}

// ─── Main page ────────────────────────────────────────────────────────────────
function DashboardPage() {
  const { user, logout } = useAuth();
  const role = user?.role;

  // ── State ────────────────────────────────────────────────────────────────
  const [overview,      setOverview]      = useState(null);
  const [donorData,     setDonorData]     = useState(null);
  const [myRequestData, setMyRequestData] = useState(null);
  const [receivedData,  setReceivedData]  = useState(null);
  const [notifData,     setNotifData]     = useState([]);
  const [activityData,  setActivityData]  = useState([]);

  const [loadingOverview,  setLoadingOverview]  = useState(true);
  const [loadingDonor,     setLoadingDonor]     = useState(false);
  const [loadingMyReq,     setLoadingMyReq]     = useState(false);
  const [loadingReceived,  setLoadingReceived]  = useState(false);
  const [loadingNotif,     setLoadingNotif]     = useState(false);
  const [loadingActivity,  setLoadingActivity]  = useState(false);

  const [errorOverview,   setErrorOverview]   = useState(null);
  const [errorDonor,      setErrorDonor]      = useState(null);
  const [errorMyReq,      setErrorMyReq]      = useState(null);
  const [errorReceived,   setErrorReceived]   = useState(null);

  // ── Fetch: overview (new API endpoint → real aggregated stats) ──────────
  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    setErrorOverview(null);
    try {
      const data = await getOverview();
      setOverview(data);
    } catch (err) {
      setErrorOverview(err.message || 'فشل تحميل الإحصائيات.');
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // ── Fetch: donor's own donations (list widget + recent donations) ────────
  const fetchDonorData = useCallback(async () => {
    if (role !== ROLES.DONOR && role !== ROLES.NGO && role !== ROLES.ADMIN) return;
    setLoadingDonor(true);
    setErrorDonor(null);
    try {
      const data = await getMyDonations({ page: 1, limit: 20 });
      setDonorData(data);
    } catch (err) {
      setErrorDonor(err.message || 'فشل تحميل التبرعات.');
    } finally {
      setLoadingDonor(false);
    }
  }, [role]);

  // ── Fetch: beneficiary's own requests (list widget) ──────────────────────
  const fetchMyRequests = useCallback(async () => {
    if (role !== ROLES.BENEFICIARY) return;
    setLoadingMyReq(true);
    setErrorMyReq(null);
    try {
      const data = await getMyRequests({ page: 1, limit: 20 });
      setMyRequestData(data);
    } catch (err) {
      setErrorMyReq(err.message || 'فشل تحميل الطلبات.');
    } finally {
      setLoadingMyReq(false);
    }
  }, [role]);

  // ── Fetch: incoming requests on donor's donations (list widget) ──────────
  const fetchReceivedRequests = useCallback(async () => {
    if (role !== ROLES.DONOR && role !== ROLES.NGO && role !== ROLES.ADMIN) return;
    setLoadingReceived(true);
    setErrorReceived(null);
    try {
      const data = await getReceivedRequests({ page: 1, limit: 20 });
      setReceivedData(data);
    } catch (err) {
      setErrorReceived(err.message || 'فشل تحميل طلبات التبرعات.');
    } finally {
      setLoadingReceived(false);
    }
  }, [role]);

  // ── Fetch: notifications (notification widget) ───────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoadingNotif(true);
    try {
      const data = await getNotifications({ limit: 8 });
      setNotifData(data.notifications || []);
    } catch {
      // Non-critical — fail silently on the dashboard.
    } finally {
      setLoadingNotif(false);
    }
  }, []);

  // ── Fetch: activity feed (new API endpoint → real audit log) ─────────────
  const fetchActivity = useCallback(async () => {
    setLoadingActivity(true);
    try {
      const data = await getActivity(8);
      setActivityData(data);
    } catch {
      // Non-critical — fail silently.
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchDonorData();
    fetchMyRequests();
    fetchReceivedRequests();
    fetchNotifications();
    fetchActivity();
  }, [fetchOverview, fetchDonorData, fetchMyRequests, fetchReceivedRequests, fetchNotifications, fetchActivity]);

  // ── Derived values ────────────────────────────────────────────────────────
  const isDonorLike   = role === ROLES.DONOR || role === ROLES.NGO || role === ROLES.ADMIN;
  const isBeneficiary = role === ROLES.BENEFICIARY;

  // Primary loading = overview is still in flight (controls full skeleton).
  const primaryLoading = loadingOverview;

  // Stats come entirely from the overview API — no client-side derivation.
  const stats = buildStatsFromOverview(role, overview);

  // Pending alert badge count from the overview.receivedRequests (donors).
  const pendingReceivedCount = overview?.receivedRequests?.pending ?? 0;

  // Impact metrics from overview.
  const impactMetrics = buildImpactMetrics(role, overview);

  async function handleLogout() {
    await logout();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (primaryLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8">

          {/* ── Welcome ─────────────────────────────────────────────────── */}
          <WelcomeBanner user={user} />

          {/* ── Overview error (non-blocking; stats just show zeros) ─────── */}
          {errorOverview && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert">
              <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.warning} />
              </svg>
              <p className="text-sm text-red-700">{errorOverview}</p>
              <button
                type="button"
                onClick={fetchOverview}
                className="ms-auto text-xs font-semibold text-red-700 hover:text-red-800 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* ── Pending requests alert (donors / NGO / admin) ────────────── */}
          {isDonorLike && pendingReceivedCount > 0 && (
            <PendingAlert count={pendingReceivedCount} />
          )}

          {/* ── Quick Actions ────────────────────────────────────────────── */}
          <QuickActions user={user} />

          {/* ── Stats (real counts from /api/dashboard/overview) ─────────── */}
          {stats.length > 0 && (
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                نظرة عامة
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((s) => (
                  <StatCard
                    key={s.title}
                    icon={s.icon}
                    iconBg={s.iconBg}
                    title={s.title}
                    value={s.value}
                    isLoading={false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Main two-column grid ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Left column — lists */}
            <div className="flex flex-col gap-6">
              {isDonorLike && (
                <RecentDonationsWidget
                  donations={donorData?.donations ?? []}
                  isLoading={loadingDonor}
                  error={errorDonor}
                />
              )}
              {isDonorLike && (
                <RecentRequestsWidget
                  requests={receivedData?.requests ?? []}
                  title="طلبات التبرعات الواردة"
                  emptyMsg="لا توجد طلبات واردة على تبرعاتك بعد."
                  ctaTo="/donations/new"
                  ctaLabel="أنشئ تبرعاً"
                  viewAllTo="/received-requests"
                  isLoading={loadingReceived}
                  error={errorReceived}
                  mode="received"
                />
              )}
              {isBeneficiary && (
                <RecentRequestsWidget
                  requests={myRequestData?.requests ?? []}
                  title="طلباتي الأخيرة"
                  emptyMsg="لم تُرسل أي طلبات بعد."
                  ctaTo="/donations"
                  ctaLabel="تصفح التبرعات المتاحة"
                  viewAllTo="/my-requests"
                  isLoading={loadingMyReq}
                  error={errorMyReq}
                  mode="my"
                />
              )}
            </div>

            {/* Right column — activity, notifications, impact, map */}
            <div className="flex flex-col gap-6">

              {/* Activity feed — driven by real audit log entries */}
              <ActivityWidget
                activity={activityData}
                isLoading={loadingActivity}
              />

              <NotificationsWidget
                notifications={notifData}
                isLoading={loadingNotif}
              />

              {/* Impact card — numbers from overview API */}
              {impactMetrics.length > 0 && (
                <ImpactCard metrics={impactMetrics} />
              )}

              <MapShortcut />
            </div>
          </div>

          {/* ── Logout ──────────────────────────────────────────────────── */}
          <div className="border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              تسجيل الخروج
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function PendingAlert({ count }) {
  return (
    <Link
      to="/received-requests"
      className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-primary-500"
      aria-label={`${count} طلب بانتظار مراجعتك — انقر للمراجعة`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100" aria-hidden="true">
        <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </span>
      <p className="flex-1 text-sm font-medium text-amber-800">
        لديك <span className="font-bold">{count}</span> طلب بانتظار مراجعتك
      </p>
      <svg className="h-4 w-4 shrink-0 text-amber-500 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    </Link>
  );
}

/**
 * Impact card — displays pre-computed metrics passed in as props.
 * Numbers originate from the overview API; no computation happens here.
 */
function ImpactCard({ metrics }) {
  return (
    <section aria-labelledby="impact-heading">
      <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="mb-4 flex items-center gap-2">
          <svg className="h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <h2 id="impact-heading" className="text-sm font-bold opacity-90">إحصائياتك</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-2xl font-bold tabular-nums leading-none">{m.value}</p>
              <p className="mt-1 text-xs font-medium opacity-70">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MapShortcut() {
  return (
    <Link
      to="/map"
      className="group card-hover flex items-center gap-4 focus-visible:outline-2 focus-visible:outline-primary-500"
      aria-label="عرض الخريطة التفاعلية"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-transform duration-150 group-hover:scale-105" aria-hidden="true">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
          اكتشف التبرعات على الخريطة
        </p>
        <p className="text-xs text-gray-400 mt-0.5">تصفح التبرعات والمنظمات القريبة منك</p>
      </div>
      <svg className="h-4 w-4 shrink-0 text-gray-400 rtl:rotate-180 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    </Link>
  );
}

export default DashboardPage;
