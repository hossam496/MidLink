import { Link } from 'react-router-dom';
import { ROLES } from '@/config/constants';

/**
 * QuickActions — role-gated shortcut tiles.
 * Uses existing routes; never creates new business logic.
 * Only shows actions the current user is authorised to perform.
 */

const ALL_ACTIONS = [
  {
    to:      '/donations',
    label:   'تصفح التبرعات',
    desc:    'استعرض التبرعات المتاحة',
    icon:    'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
    iconBg:  'bg-blue-50 text-blue-600',
    roles:   null, // show to everyone
  },
  {
    to:      '/donations/new',
    label:   'تبرع جديد',
    desc:    'أضف دواءً أو جهازاً',
    icon:    'M12 4.5v15m7.5-7.5h-15',
    iconBg:  'bg-primary-50 text-primary-600',
    roles:   [ROLES.DONOR],
  },
  {
    to:      '/received-requests',
    label:   'طلبات التبرعات',
    desc:    'راجع الطلبات الواردة',
    icon:    'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
    iconBg:  'bg-amber-50 text-amber-600',
    roles:   [ROLES.DONOR, ROLES.NGO, ROLES.ADMIN],
  },
  {
    to:      '/my-requests',
    label:   'طلباتي',
    desc:    'تابع طلباتك الحالية',
    icon:    'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
    iconBg:  'bg-green-50 text-green-600',
    roles:   [ROLES.BENEFICIARY],
  },
  {
    to:      '/map',
    label:   'الخريطة',
    desc:    'التبرعات القريبة منك',
    icon:    'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
    iconBg:  'bg-teal-50 text-teal-600',
    roles:   null,
  },
];

function QuickActions({ user }) {
  const visible = ALL_ACTIONS.filter((a) =>
    a.roles === null || a.roles.includes(user?.role)
  );

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        إجراءات سريعة
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group flex flex-col gap-2.5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-150 hover:border-gray-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.iconBg} transition-transform duration-150 group-hover:scale-110`}>
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700 transition-colors leading-tight">
                {action.label}
              </p>
              <p className="mt-0.5 text-xs text-gray-400 leading-snug">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
