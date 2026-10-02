import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getDonation, submitDonation, cancelDonation } from '@/services/donationService';
import { createRequest } from '@/services/requestService';
import DonationStatusBadge from '@/components/donations/DonationStatusBadge';
import NeedItemModal       from '@/components/requests/NeedItemModal';
import LoadingSpinner      from '@/components/common/LoadingSpinner';
import Alert               from '@/components/common/Alert';
import Button              from '@/components/common/Button';
import useAuth             from '@/hooks/useAuth';
import { ROLES }           from '@/config/constants';

const CONDITION_LABELS = {
  new:          'جديد',
  good:         'جيد',
  fair:         'مقبول',
  needs_repair: 'يحتاج إصلاح',
};

function DetailRow({ label, value, icon }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-medium text-gray-800">{value}</span>
      </div>
    </div>
  );
}

function DonationDetailPage() {
  const { id }       = useParams();
  const location     = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [donation,         setDonation]         = useState(null);
  const [isLoading,        setIsLoading]        = useState(true);
  const [error,            setError]            = useState('');
  const [actionError,      setActionError]      = useState('');
  const [isActioning,      setIsActioning]      = useState(false);
  const [activeImage,      setActiveImage]      = useState(0);
  const [showNeedModal,    setShowNeedModal]    = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const justSubmitted = location.state?.submitted;

  useEffect(() => {
    setIsLoading(true);
    getDonation(id)
      .then(({ donation: d }) => setDonation(d))
      .catch((err) => setError(err.message || 'التبرع غير موجود.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const isOwner     = isAuthenticated && donation?.donor?._id === user?._id;
  const isDraft     = donation?.status === 'DRAFT';
  const isCancellable = donation &&
    !['DISTRIBUTED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(donation.status);

  async function handleSubmit() {
    setActionError('');
    setIsActioning(true);
    try {
      const { donation: updated } = await submitDonation(id);
      setDonation(updated);
    } catch (err) {
      setActionError(err.message || 'فشل الإرسال.');
    } finally {
      setIsActioning(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا التبرع؟')) return;
    setActionError('');
    setIsActioning(true);
    try {
      const { donation: updated } = await cancelDonation(id);
      setDonation(updated);
    } catch (err) {
      setActionError(err.message || 'فشل الإلغاء.');
    } finally {
      setIsActioning(false);
    }
  }

  async function handleRequestSubmit(payload) {
    setActionError('');
    setIsActioning(true);
    try {
      await createRequest(id, payload);
      setRequestSubmitted(true);
      setShowNeedModal(false);
    } catch (err) {
      setActionError(err.message || 'فشل الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsActioning(false);
    }
  }

  const canRequest =
    !isOwner &&
    ['AVAILABLE', 'REQUESTED'].includes(donation?.status) &&
    isAuthenticated &&
    user?.role === ROLES.BENEFICIARY;

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Alert variant="error" message={error} />
      <Link to="/donations"><Button variant="secondary" className="gap-1.5">
        <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
        العودة للتبرعات
      </Button></Link>
    </div>
  );

  const { itemType, medicine, medicalDevice, category, images, location: loc,
          status, description, donor, createdAt } = donation;

  const title = itemType === 'medicine' ? medicine?.name : medicalDevice?.deviceType;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* شريط علوي */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Link to="/donations" className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
            <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            التبرعات
          </Link>
          <span className="text-gray-300">|</span>
          <DonationStatusBadge status={status} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 animate-fade-in">
        {justSubmitted && (
          <Alert
            variant="success"
            message="تم إرسال تبرعك وهو قيد المراجعة الآن. سنُخطرك عند الموافقة عليه."
            className="mb-6"
          />
        )}
        {actionError && !showNeedModal && <Alert variant="error" message={actionError} className="mb-4" />}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* معرض الصور */}
          <div className="flex flex-col gap-3">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 shadow-card">
              {images?.length > 0 ? (
                <>
                  <img
                    src={images[activeImage]?.url}
                    alt={`${title} — صورة ${activeImage + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.img-placeholder')?.classList.remove('hidden');
                    }}
                  />
                  <div className="img-placeholder hidden flex h-full flex-col items-center justify-center gap-2 text-gray-300">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75z" />
                    </svg>
                    <span className="text-sm">تعذر تحميل الصورة</span>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-300">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75z" />
                  </svg>
                  <span className="text-sm">لا توجد صور</span>
                </div>
              )}
            </div>
            {images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.publicId || i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all
                      ${i === activeImage
                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                        : 'border-transparent hover:border-gray-300'}`}
                    aria-label={`عرض الصورة ${i + 1}`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" onError={(e) => { e.target.style.opacity = '0'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* التفاصيل */}
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {category && <p className="mt-1 text-sm font-medium text-gray-500">{category.name}</p>}
            </div>

            {/* تفاصيل الدواء */}
            {itemType === 'medicine' && medicine && (
              <div className="card flex flex-col gap-1 divide-y divide-gray-50">
                <h2 className="pb-2 text-sm font-bold text-gray-800">تفاصيل الدواء</h2>
                <DetailRow label="المواد الفعّالة" value={medicine.activeIngredients} />
                <DetailRow label="تاريخ الانتهاء"
                  value={medicine.expiryDate
                    ? new Date(medicine.expiryDate).toLocaleDateString('ar-EG')
                    : null} />
                <DetailRow label="الكمية"
                  value={medicine.quantity ? `${medicine.quantity} ${medicine.unit || ''}`.trim() : null} />
                <DetailRow label="الشركة المصنّعة" value={medicine.manufacturer} />
                <DetailRow label="رقم الدُفعة"     value={medicine.batchNumber} />
              </div>
            )}

            {/* تفاصيل الجهاز */}
            {itemType === 'medical_device' && medicalDevice && (
              <div className="card flex flex-col gap-1 divide-y divide-gray-50">
                <h2 className="pb-2 text-sm font-bold text-gray-800">تفاصيل الجهاز</h2>
                <DetailRow label="الماركة"         value={medicalDevice.brand} />
                <DetailRow label="الموديل"         value={medicalDevice.model} />
                <DetailRow label="الحالة"          value={CONDITION_LABELS[medicalDevice.condition] || medicalDevice.condition} />
                <DetailRow label="الشركة المصنّعة" value={medicalDevice.manufacturer} />
              </div>
            )}

            {/* الموقع */}
            {loc?.displayLabel && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <span className="font-medium">{loc.displayLabel}</span>
              </div>
            )}

            {description && (
              <div className="card">
                <h2 className="mb-2 text-sm font-bold text-gray-800">ملاحظات المتبرع</h2>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{description}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                {donor?.name?.charAt(0) || '؟'}
              </div>
              <p className="text-xs text-gray-400">
                بواسطة <span className="font-medium text-gray-500">{donor?.name || 'مجهول'}</span> في{' '}
                {new Date(createdAt).toLocaleDateString('ar-EG')}
              </p>
            </div>

            {/* تنبيهات الفئة */}
            <div className="flex flex-wrap gap-2">
              {category?.requiresPrescription && (
                <span className="badge bg-amber-50 text-amber-700">
                  <svg className="h-3 w-3 me-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  يستلزم وصفة طبية
                </span>
              )}
              {category?.requiresColdChain && (
                <span className="badge bg-blue-50 text-blue-700">
                  يتطلب تبريداً
                </span>
              )}
              {category?.isNgoOnly && (
                <span className="badge bg-purple-50 text-purple-700">
                  توزيع عبر المنظمات فقط
                </span>
              )}
            </div>

            {/* أزرار المالك */}
            {isOwner && (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                {isDraft && (
                  <Button variant="primary" isLoading={isActioning} onClick={handleSubmit} className="w-full">
                    إرسال للمراجعة
                  </Button>
                )}
                {isDraft && (
                  <Link to={`/donations/${id}/edit`}>
                    <Button variant="secondary" className="w-full">تعديل التبرع</Button>
                  </Link>
                )}
                {isCancellable && (
                  <Button variant="danger" isLoading={isActioning} onClick={handleCancel} className="w-full">
                    إلغاء التبرع
                  </Button>
                )}
              </div>
            )}

            {/* زر الطلب للمستفيدين */}
            {canRequest && (
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                {!requestSubmitted ? (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => { setActionError(''); setShowNeedModal(true); }}
                  >
                    {itemType === 'medicine' ? 'أحتاج هذا الدواء' : 'أحتاج هذا الجهاز'}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Alert
                      variant="success"
                      message="تم إرسال طلبك بنجاح. بانتظار موافقة المتبرع."
                    />
                    <Link to="/my-requests">
                      <Button variant="secondary" className="w-full">متابعة طلباتي</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {!isOwner && ['AVAILABLE', 'REQUESTED'].includes(status) && isAuthenticated && user?.role !== ROLES.BENEFICIARY && (
              <p className="text-center text-xs text-gray-400 pt-2">
                يمكن للمستفيدين فقط طلب التبرعات.
              </p>
            )}

            {!isOwner && ['AVAILABLE', 'REQUESTED'].includes(status) && !isAuthenticated && (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <p className="text-center text-xs text-gray-500">
                  سجّل الدخول كمستفيد لطلب هذا العنصر.
                </p>
                <Link to="/login" state={{ from: `/donations/${id}` }}>
                  <Button variant="primary" className="w-full">تسجيل الدخول</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <NeedItemModal
        donation={donation}
        isOpen={showNeedModal}
        onClose={() => { if (!isActioning) setShowNeedModal(false); }}
        onSubmit={handleRequestSubmit}
        isSubmitting={isActioning}
        error={actionError}
      />
    </div>
  );
}

export default DonationDetailPage;
