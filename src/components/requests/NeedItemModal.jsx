import { useState } from 'react';
import Button from '@/components/common/Button';
import Alert  from '@/components/common/Alert';
import useAuth from '@/hooks/useAuth';

/**
 * NeedItemModal — confirmation + optional message before submitting a request.
 * Prefills contact from the authenticated profile; only asks for phone if missing.
 */
function NeedItemModal({
  donation,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  if (!isOpen || !donation) return null;

  const itemName = donation.itemType === 'medicine'
    ? donation.medicine?.name
    : donation.medicalDevice?.deviceType;

  const donorName = donation.donor?.name || 'المتبرع';
  const location  = donation.location?.displayLabel;
  const needsPhone = !user?.phone;

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      requestReason: message.trim() || undefined,
      contactPhone:  needsPhone ? contactPhone.trim() : undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="need-item-title"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 id="need-item-title" className="text-lg font-bold text-gray-900">
            تأكيد طلب التبرع
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            لن يتم مشاركة بيانات المتبرع معك إلا بعد موافقته.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4">
          <div className="rounded-xl bg-gray-50 p-4 text-sm space-y-2">
            <p>
              <span className="text-xs font-semibold text-gray-400">العنصر</span>
              <br />
              <span className="font-bold text-gray-900">{itemName}</span>
            </p>
            <p>
              <span className="text-xs font-semibold text-gray-400">تبرّع به</span>
              <br />
              <span className="font-medium text-gray-800">{donorName}</span>
            </p>
            {location && (
              <p>
                <span className="text-xs font-semibold text-gray-400">الموقع</span>
                <br />
                <span className="font-medium text-gray-800">{location}</span>
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 p-4 text-sm space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 mb-2">بياناتك (من حسابك)</p>
            <p><span className="text-gray-500">الاسم:</span> <span className="font-medium">{user?.name}</span></p>
            <p><span className="text-gray-500">البريد:</span> <span className="font-medium" dir="ltr">{user?.email}</span></p>
            {user?.phone && (
              <p><span className="text-gray-500">الهاتف:</span> <span className="font-medium" dir="ltr">{user.phone}</span></p>
            )}
          </div>

          {needsPhone && (
            <div>
              <label htmlFor="contactPhone" className="mb-1.5 block text-sm font-semibold text-gray-700">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input
                id="contactPhone"
                type="tel"
                className="input"
                dir="ltr"
                required
                placeholder="01XXXXXXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                maxLength={20}
              />
              <p className="mt-1 text-xs text-gray-400">مطلوب حتى يتمكن المتبرع من التواصل معك.</p>
            </div>
          )}

          <div>
            <label htmlFor="requestMessage" className="mb-1.5 block text-sm font-semibold text-gray-700">
              رسالة للمتبرع <span className="text-gray-400 font-normal">(اختياري)</span>
            </label>
            <textarea
              id="requestMessage"
              className="input resize-none"
              rows={3}
              maxLength={1000}
              placeholder="مثال: أحتاج هذا الدواء لوالدتي ويمكنني الاستلام في المنصورة."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && <Alert variant="error" message={error} />}

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isSubmitting}
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              إرسال الطلب
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NeedItemModal;
