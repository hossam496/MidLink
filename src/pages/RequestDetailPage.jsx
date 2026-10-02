import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  getRequest,
  approveRequest,
  rejectRequest,
  markDistributed,
  cancelRequest,
} from '@/services/requestService';
import RequestStatusBadge from '@/components/common/RequestStatusBadge';
import ContactCard        from '@/components/requests/ContactCard';
import LoadingSpinner     from '@/components/common/LoadingSpinner';
import Alert              from '@/components/common/Alert';
import Button             from '@/components/common/Button';
import useAuth            from '@/hooks/useAuth';
import { ROLES }          from '@/config/constants';

const REJECTION_PRESETS = [
  { value: 'Item already reserved',          label: 'العنصر محجوز بالفعل' },
  { value: 'Requester information incomplete', label: 'معلومات الطالب غير مكتملة' },
  { value: 'Cannot arrange delivery',        label: 'تعذر ترتيب التسليم' },
  { value: 'other',                          label: 'سبب آخر' },
];

function itemNameFromDonation(donation) {
  if (!donation) return 'عنصر غير معروف';
  return donation.itemType === 'medicine'
    ? donation.medicine?.name
    : donation.medicalDevice?.deviceType;
}

function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest]       = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  const [showReject, setShowReject] = useState(false);
  const [rejectPreset, setRejectPreset] = useState(REJECTION_PRESETS[0].value);
  const [rejectNote, setRejectNote] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getRequest(id);
      setRequest(data.request);
    } catch (err) {
      setError(err.message || 'تعذر تحميل الطلب.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const isDonor =
    user?.role === ROLES.DONOR &&
    (request?.donor === user?._id ||
      request?.donor?._id === user?._id ||
      request?.donation?.donor?._id === user?._id ||
      request?.donation?.donor === user?._id);

  const isBeneficiary =
    user?.role === ROLES.BENEFICIARY &&
    (request?.beneficiary?._id === user?._id || request?.beneficiary === user?._id);

  const isPrivileged = user?.role === ROLES.ADMIN || user?.role === ROLES.NGO;

  async function handleApprove() {
    if (!window.confirm('هل تريد الموافقة على هذا الطلب وحجز العنصر؟')) return;
    setIsActioning(true);
    setActionError('');
    try {
      await approveRequest(id);
      await load();
    } catch (err) {
      setActionError(err.message || 'فشلت الموافقة.');
    } finally {
      setIsActioning(false);
    }
  }

  async function handleReject(e) {
    e.preventDefault();
    const reason =
      rejectPreset === 'other'
        ? rejectNote.trim()
        : rejectNote.trim()
          ? `${rejectPreset}: ${rejectNote.trim()}`
          : rejectPreset;

    if (!reason) {
      setActionError('يرجى تحديد سبب الرفض.');
      return;
    }

    setIsActioning(true);
    setActionError('');
    try {
      await rejectRequest(id, reason);
      setShowReject(false);
      await load();
    } catch (err) {
      setActionError(err.message || 'فشل الرفض.');
    } finally {
      setIsActioning(false);
    }
  }

  async function handleDistribute() {
    if (!window.confirm('هل تم تسليم العنصر للمستفيد؟')) return;
    setIsActioning(true);
    setActionError('');
    try {
      await markDistributed(id);
      await load();
    } catch (err) {
      setActionError(err.message || 'فشل تأكيد التسليم.');
    } finally {
      setIsActioning(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('هل تريد إلغاء هذا الطلب؟')) return;
    setIsActioning(true);
    setActionError('');
    try {
      await cancelRequest(id);
      await load();
    } catch (err) {
      setActionError(err.message || 'فشل الإلغاء.');
    } finally {
      setIsActioning(false);
    }
  }

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4">
        <Alert variant="error" message={error} />
        <Button variant="secondary" onClick={() => navigate(-1)}>رجوع</Button>
      </div>
    );
  }

  const donation = request.donation;
  const itemName = itemNameFromDonation(donation);
  const snapshot = request.requesterSnapshot || {};
  const status = request.status;

  const showRequesterContact = (isDonor || isPrivileged) && status !== 'CANCELLED';
  const showDonorContact =
    (isBeneficiary || isPrivileged) &&
    ['RESERVED', 'DISTRIBUTED', 'APPROVED'].includes(status);

  const donorContact = request.donorContact || (
    donation?.donor && typeof donation.donor === 'object'
      ? {
          fullName: donation.donor.name,
          phone:    donation.donor.phone,
          email:    donation.donor.email,
        }
      : null
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link
            to={isDonor ? '/received-requests' : '/my-requests'}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-600"
          >
            <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            رجوع
          </Link>
          <RequestStatusBadge status={status} />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 animate-fade-in flex flex-col gap-5">
        {actionError && <Alert variant="error" message={actionError} />}

        {/* Item */}
        <section className="card">
          <h1 className="text-lg font-bold text-gray-900 mb-1">تفاصيل الطلب</h1>
          <p className="text-sm text-gray-500 mb-4">
            {new Date(request.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-400 mb-1">العنصر المطلوب</p>
            <Link
              to={`/donations/${donation?._id}`}
              className="text-base font-bold text-primary-700 hover:text-primary-800"
            >
              {itemName}
            </Link>
            {donation?.category?.name && (
              <p className="text-xs text-gray-500 mt-1">{donation.category.name}</p>
            )}
            {donation?.location?.displayLabel && (
              <p className="text-xs text-gray-500 mt-1">{donation.location.displayLabel}</p>
            )}
          </div>

          {request.requestReason && (
            <div className="mt-4 rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 mb-1">سبب الطلب / الرسالة</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {request.requestReason}
              </p>
            </div>
          )}

          {request.rejectionReason && (
            <Alert variant="error" message={`سبب الرفض: ${request.rejectionReason}`} className="mt-4" />
          )}

          {status === 'PENDING' && (
            <p className="mt-4 text-sm text-amber-700 font-medium">🟡 بانتظار موافقة المتبرع</p>
          )}
          {status === 'RESERVED' && (
            <p className="mt-4 text-sm text-emerald-700 font-medium">🟢 تم قبول الطلب — العنصر محجوز</p>
          )}
          {status === 'DISTRIBUTED' && (
            <p className="mt-4 text-sm text-teal-700 font-medium">🔵 تم تسليم التبرع بنجاح</p>
          )}
          {status === 'REJECTED' && (
            <p className="mt-4 text-sm text-red-700 font-medium">🔴 لم تتم الموافقة على الطلب</p>
          )}
        </section>

        {/* Requester contact (donor view) */}
        {showRequesterContact && (
          <ContactCard
            title="بيانات الطالب"
            fullName={snapshot.fullName || request.beneficiary?.name}
            phone={snapshot.phone || request.beneficiary?.phone}
            email={snapshot.email || request.beneficiary?.email}
            displayLabel={snapshot.displayLabel}
          />
        )}

        {/* Donor contact (beneficiary after approval) */}
        {showDonorContact && donorContact && (
          <ContactCard
            title="بيانات المتبرع"
            fullName={donorContact.fullName}
            phone={donorContact.phone}
            email={donorContact.email}
          />
        )}

        {/* Donor actions */}
        {(isDonor || isPrivileged) && status === 'PENDING' && !showReject && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="danger" className="w-full" onClick={() => setShowReject(true)} disabled={isActioning}>
              رفض الطلب
            </Button>
            <Button variant="primary" className="w-full" isLoading={isActioning} onClick={handleApprove}>
              الموافقة على الطلب
            </Button>
          </div>
        )}

        {(isDonor || isPrivileged) && showReject && (
          <form onSubmit={handleReject} className="card flex flex-col gap-3">
            <h3 className="font-bold text-gray-900">سبب الرفض</h3>
            <div className="flex flex-col gap-2">
              {REJECTION_PRESETS.map((p) => (
                <label key={p.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="rejectPreset"
                    value={p.value}
                    checked={rejectPreset === p.value}
                    onChange={() => setRejectPreset(p.value)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="ملاحظة إضافية (اختياري)"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              maxLength={500}
              required={rejectPreset === 'other'}
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="w-full" onClick={() => setShowReject(false)}>
                إلغاء
              </Button>
              <Button type="submit" variant="danger" className="w-full" isLoading={isActioning}>
                تأكيد الرفض
              </Button>
            </div>
          </form>
        )}

        {(isDonor || isPrivileged) && status === 'RESERVED' && (
          <Button variant="primary" className="w-full" isLoading={isActioning} onClick={handleDistribute}>
            تأكيد التسليم
          </Button>
        )}

        {/* Beneficiary cancel */}
        {isBeneficiary && ['PENDING', 'APPROVED', 'RESERVED'].includes(status) && (
          <Button variant="danger" className="w-full" isLoading={isActioning} onClick={handleCancel}>
            إلغاء الطلب
          </Button>
        )}
      </div>
    </div>
  );
}

export default RequestDetailPage;
