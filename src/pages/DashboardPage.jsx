import { Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import Button   from '@/components/common/Button';

const ROLE_LABELS = {
  donor:       'متبرع',
  beneficiary: 'مستفيد',
  ngo:         'منظمة',
  admin:       'مدير',
};

const ROLE_ICONS = {
  donor:       'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
  beneficiary: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  ngo:         'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
  admin:       'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z',
};

function DashboardPage() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  const quickLinks = [
    { to: '/donations', label: 'تصفح التبرعات', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', show: true },
    { to: '/donations/new', label: 'أنشئ تبرعاً', icon: 'M12 4.5v15m7.5-7.5h-15', show: user?.role === 'donor' },
    { to: '/received-requests', label: 'طلبات التبرعات', icon: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0', show: user?.role === 'donor' || user?.role === 'ngo' || user?.role === 'admin' },
    { to: '/my-requests', label: 'طلباتي', icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z', show: user?.role === 'beneficiary' },
    { to: '/map', label: 'الخريطة', icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z', show: true },
  ];

  return (
    <div className="min-h-screen bg-surface-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-lg animate-fade-in">
        {/* Welcome card */}
        <div className="card p-6 sm:p-8 text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
            <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={ROLE_ICONS[user?.role] || ROLE_ICONS.donor} />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            أهلاً، {user?.name}
          </h1>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            {ROLE_LABELS[user?.role] || user?.role}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickLinks.filter(l => l.show).map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="card-hover flex flex-col items-center gap-2 p-5 text-center group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <Button variant="secondary" className="w-full" onClick={handleLogout}>
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}

export default DashboardPage;
