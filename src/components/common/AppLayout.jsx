import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth               from '@/hooks/useAuth';
import NotificationCenter    from '@/components/notifications/NotificationCenter';
import ConnectionStatusBar   from '@/components/common/ConnectionStatusBar';
import InstallPromptBanner   from '@/components/common/InstallPromptBanner';
import { ROLES }             from '@/config/constants';

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

  const navLinks = [
    { to: '/donations', label: 'التبرعات', show: true },
    { to: '/map', label: 'الخريطة', show: true },
    { to: '/donations/new', label: 'تبرع الآن', show: isAuthenticated && user?.role === ROLES.DONOR },
    { to: '/received-requests', label: 'طلبات التبرعات', show: isAuthenticated && (user?.role === ROLES.DONOR || user?.role === ROLES.NGO || user?.role === ROLES.ADMIN) },
    { to: '/my-requests', label: 'طلباتي', show: isAuthenticated && user?.role === ROLES.BENEFICIARY },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <ConnectionStatusBar />

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          {/* الشعار */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">ميدلينك</span>
          </Link>

          {/* روابط التنقل — Desktop */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
            {navLinks.filter(l => l.show).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors
                  ${isActive(link.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* الجانب الأيسر */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden md:inline-flex rounded-xl px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  تسجيل الدخول
                </Link>
                <Link to="/register"
                  className="btn-primary py-2 px-5 text-sm">
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-xl p-2 text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="القائمة"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-slide-down">
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.filter(l => l.show).map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors
                    ${isActive(link.to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-100" />
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 text-right"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    تسجيل الدخول
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary py-2.5 text-sm text-center">
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-4 py-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">ميدلينك</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} MedLink — التبرع الطبي الآمن</p>
        </div>
      </footer>

      <InstallPromptBanner />
    </div>
  );
}

export default AppLayout;
