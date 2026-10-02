/**
 * ContactCard — Call / WhatsApp / Email actions for approved request parties.
 * Only render when the caller has already authorised contact visibility.
 */

function digitsOnly(phone) {
  return (phone || '').replace(/[^\d+]/g, '');
}

/** Normalise Egyptian/local numbers for wa.me (needs country code). */
function whatsappHref(phone) {
  let digits = digitsOnly(phone).replace(/^\+/, '');
  if (!digits) return null;
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `20${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function ContactCard({
  title = 'معلومات التواصل',
  fullName,
  phone,
  email,
  displayLabel,
  className = '',
}) {
  const wa = phone ? whatsappHref(phone) : null;

  return (
    <div className={`rounded-2xl border border-primary-100 bg-primary-50/40 p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-bold text-gray-900">{title}</h3>

      <div className="flex flex-col gap-2 text-sm">
        {fullName && (
          <p className="font-semibold text-gray-800">{fullName}</p>
        )}

        {displayLabel && (
          <p className="flex items-center gap-1.5 text-gray-600">
            <svg className="h-4 w-4 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {displayLabel}
          </p>
        )}

        {phone && (
          <p className="text-gray-700" dir="ltr">
            <span className="text-xs font-semibold text-gray-400 me-2">الهاتف</span>
            {phone}
          </p>
        )}

        {email && (
          <p className="text-gray-700 break-all" dir="ltr">
            <span className="text-xs font-semibold text-gray-400 me-2">البريد</span>
            {email}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {phone && (
          <a
            href={`tel:${digitsOnly(phone)}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            اتصال
          </a>
        )}
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            واتساب
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            إرسال بريد
          </a>
        )}
      </div>

      {!phone && !email && (
        <p className="mt-2 text-xs text-amber-700">لا تتوفر معلومات تواصل كافية بعد.</p>
      )}
    </div>
  );
}

export default ContactCard;
