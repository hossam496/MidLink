import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth               from '@/hooks/useAuth';
import NotificationCenter    from '@/components/notifications/NotificationCenter';
import ConnectionStatusBar   from '@/components/common/ConnectionStatusBar';
import InstallPromptBanner   from '@/components/common/InstallPromptBanner';
import { ROLES }             from '@/config/constants';

// ─── Nav link definitions ───────────────────────────────────────────────────
// Each entry includes an SVG path for the icon (Heroicons outline 24px).
const NAV_ICON = {
  donations: 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
  map:        'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
  newDon:     'M12 4.5v15m7.5-7.5h-15',
  received:   'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  myReq:      'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  dashboard:  'M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z',
};

function NavIcon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function AppLayout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }

  // Role-gated nav links — same logic as before, never changed
  const navLinks = [
    {
      to: '/dashboard',
      label: 'لوحة التحكم',
      icon: NAV_ICON.dashboard,
      show: isAuthenticated,
    },
    {
      to: '/donations',
      label: 'التبرعات',
      icon: NAV_ICON.donations,
      show: true,
    },
    {
      to: '/map',
      label: 'الخريطة',
      icon: NAV_ICON.map,
      show: true,
    },
    {
      to: '/donations/new',
      label: 'تبرع الآن',
      icon: NAV_ICON.newDon,
      show: isAuthenticated && user?.role === ROLES.DONOR,
      highlight: true,
    },
    {
      to: '/received-requests',
      label: 'طلبات التبرعات',
      icon: NAV_ICON.received,
      show: isAuthenticated && (
        user?.role === ROLES.DONOR ||
        user?.role === ROLES.NGO   ||
        user?.role === ROLES.ADMIN
      ),
    },
    {
      to: '/my-requests',
      label: 'طلباتي',
      icon: NAV_ICON.myReq,
      show: isAuthenticated && user?.role === ROLES.BENEFICIARY,
    },
  ];

  const visibleLinks = navLinks.filter((l) => l.show);

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <ConnectionStatusBar />

      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-sm border-b border-gray-100 shadow-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="ميدلينك — الصفحة الرئيسية">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm transition-all duration-200 group-hover:bg-primary-700 group-hover:scale-105">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">ميدلينك</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="التنقل الرئيسي">
            {visibleLinks.map((link) => (
              link.highlight ? (
                <Link
                  key={link.to}
                  to={link.to}
                  className="ms-1 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
                >
                  <NavIcon path={link.icon} className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                    ${isActive(link.to)
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <NavIcon path={link.icon} className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <NotificationCenter />

                {/* User pill */}
                <div className="hidden md:flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold" aria-hidden="true">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-gray-700 max-w-[96px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label="تسجيل الخروج"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  خروج
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="btn-primary py-1.5 px-4 text-xs"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="القائمة"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-slide-down" role="navigation" aria-label="القائمة المحمولة">
            <div className="px-4 py-3 flex flex-col gap-0.5">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                    ${isActive(link.to)
                      ? 'bg-primary-50 text-primary-700'
                      : link.highlight
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <NavIcon path={link.icon} className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-gray-100" />

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-bold" aria-hidden="true">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary py-2.5 text-sm text-center"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white px-4 py-5">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-600 text-white" aria-hidden="true">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">ميدلينك</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} MedLink — التبرع الطبي الآمن
          </p>
        </div>
      </footer>

      <InstallPromptBanner />
    </div>
  );
}

export default AppLayout;
