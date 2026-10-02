import { Link } from 'react-router-dom';

function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-50 px-4 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100" aria-hidden="true">
        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
        </svg>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">أنت غير متصل بالإنترنت</h1>
        <p className="mt-2 text-gray-500 leading-relaxed">
          تحقق من اتصالك بالشبكة وحاول مرة أخرى.
        </p>
      </div>

      <div className="w-full max-w-sm card p-5 text-right">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-50">
            <svg className="h-4 w-4 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-success-700">متاح بدون إنترنت</p>
        </div>
        <ul className="space-y-2 text-sm text-success-700">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500 shrink-0" />
            صفحات التبرعات التي شاهدتها سابقاً
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500 shrink-0" />
            قوائم التبرعات المحفوظة مؤقتاً
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500 shrink-0" />
            بلاطات الخريطة المحملة مسبقاً
          </li>
        </ul>
      </div>

      <div className="w-full max-w-sm card p-5 text-right">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger-50">
            <svg className="h-4 w-4 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-danger-700">يتطلب إنترنت</p>
        </div>
        <ul className="space-y-2 text-sm text-danger-600">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-danger-500 shrink-0" />
            إنشاء أو إرسال تبرعات
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-danger-500 shrink-0" />
            تقديم أو إدارة الطلبات
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-danger-500 shrink-0" />
            تسجيل الدخول أو إنشاء حساب
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-danger-500 shrink-0" />
            الإشعارات
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-danger-500 shrink-0" />
            معالجة صور الأدوية (OCR)
          </li>
        </ul>
      </div>

      <Link
        to="/donations"
        className="btn-primary gap-1.5"
        onClick={() => window.location.reload()}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
        حاول مرة أخرى
      </Link>
    </div>
  );
}

export default OfflinePage;
