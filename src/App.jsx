import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }   from '@/context/AuthContext';
import ProtectedRoute     from '@/components/common/ProtectedRoute';
import AppLayout          from '@/components/common/AppLayout';
import { ROLES }          from '@/config/constants';

// Auth pages
import RegisterPage       from '@/pages/RegisterPage';
import LoginPage          from '@/pages/LoginPage';
import DashboardPage      from '@/pages/DashboardPage';

// Donation pages
import DonationListPage   from '@/pages/DonationListPage';
import DonationDetailPage from '@/pages/DonationDetailPage';
import CreateDonationPage from '@/pages/CreateDonationPage';

// Request pages
import MyRequestsPage        from '@/pages/MyRequestsPage';
import ReceivedRequestsPage  from '@/pages/ReceivedRequestsPage';
import RequestDetailPage     from '@/pages/RequestDetailPage';

// Map page
import DonationMapPage    from '@/pages/DonationMapPage';

// PWA offline fallback
import OfflinePage        from '@/pages/OfflinePage';

// Auth pages get their own full-screen layout (no nav bar).
// All other pages are wrapped in AppLayout for the nav + notification bell.

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Auth pages (full-screen, no AppLayout) ─────────────── */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login"    element={<LoginPage />} />

        {/* ── Public pages with AppLayout ─────────────────────────── */}
        <Route path="/donations" element={
          <AppLayout><DonationListPage /></AppLayout>
        } />

        <Route path="/donations/:id" element={
          <AppLayout><DonationDetailPage /></AppLayout>
        } />

        <Route path="/map" element={
          <AppLayout><DonationMapPage /></AppLayout>
        } />

        {/* ── Donor-only ────────────────────────────────────────────── */}
        <Route path="/donations/new" element={
          <ProtectedRoute allowedRoles={[ROLES.DONOR]}>
            <AppLayout><CreateDonationPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* ── Beneficiary-only ─────────────────────────────────────── */}
        <Route path="/my-requests" element={
          <ProtectedRoute allowedRoles={[ROLES.BENEFICIARY]}>
            <AppLayout><MyRequestsPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* ── Donor inbox (NGO/admin may also review) ─────────────── */}
        <Route path="/received-requests" element={
          <ProtectedRoute allowedRoles={[ROLES.DONOR, ROLES.NGO, ROLES.ADMIN]}>
            <AppLayout><ReceivedRequestsPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* ── Request detail (parties authorised server-side) ──────── */}
        <Route path="/requests/:id" element={
          <ProtectedRoute>
            <AppLayout><RequestDetailPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* ── Any authenticated user ───────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><DashboardPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* ── Root redirect ─────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/donations" replace />} />

        {/* ── Offline fallback ──────────────────────────────────────── */}
        <Route path="/offline" element={<OfflinePage />} />

        {/* ── 404 ──────────────────────────────────────────────────── */}
        <Route path="*" element={
          <AppLayout>
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-400">الصفحة غير موجودة</p>
            </div>
          </AppLayout>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
