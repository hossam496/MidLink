const STATUS_CONFIG = {
  DRAFT:        { label: 'مسودة',          style: 'bg-gray-100    text-gray-600',    dot: 'bg-gray-400'   },
  SUBMITTED:    { label: 'مُرسَل',          style: 'bg-blue-50     text-blue-700',    dot: 'bg-blue-500'   },
  UNDER_REVIEW: { label: 'قيد المراجعة',   style: 'bg-amber-50    text-amber-700',   dot: 'bg-amber-500'  },
  APPROVED:     { label: 'موافق عليه',     style: 'bg-emerald-50  text-emerald-700', dot: 'bg-emerald-500'},
  AVAILABLE:    { label: 'متاح',           style: 'bg-green-50    text-green-700',   dot: 'bg-green-500'  },
  REQUESTED:    { label: 'مطلوب',          style: 'bg-indigo-50   text-indigo-700',  dot: 'bg-indigo-500' },
  RESERVED:     { label: 'محجوز',          style: 'bg-purple-50   text-purple-700',  dot: 'bg-purple-500' },
  DISTRIBUTED:  { label: 'تم التوزيع',    style: 'bg-teal-50     text-teal-700',    dot: 'bg-teal-500'   },
  REJECTED:     { label: 'مرفوض',         style: 'bg-red-50      text-red-700',     dot: 'bg-red-500'    },
  EXPIRED:      { label: 'منتهي الصلاحية', style: 'bg-orange-50   text-orange-700',  dot: 'bg-orange-500' },
  CANCELLED:    { label: 'ملغي',           style: 'bg-gray-50     text-gray-500',    dot: 'bg-gray-400'   },
  FLAGGED:      { label: 'مُبلَّغ عنه',   style: 'bg-rose-50     text-rose-700',    dot: 'bg-rose-500'   },
};

function DonationStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, style: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${config.style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default DonationStatusBadge;
