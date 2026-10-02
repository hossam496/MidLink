const STATUS_CONFIG = {
  PENDING:     { label: 'قيد الانتظار', style: 'bg-amber-50  text-amber-700',   dot: 'bg-amber-500'  },
  APPROVED:    { label: 'موافق عليه',   style: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500'},
  RESERVED:    { label: 'محجوز',        style: 'bg-purple-50 text-purple-700',  dot: 'bg-purple-500' },
  DISTRIBUTED: { label: 'تم الاستلام', style: 'bg-teal-50   text-teal-700',    dot: 'bg-teal-500'   },
  REJECTED:    { label: 'مرفوض',       style: 'bg-red-50    text-red-700',     dot: 'bg-red-500'    },
  CANCELLED:   { label: 'ملغي',        style: 'bg-gray-50   text-gray-500',    dot: 'bg-gray-400'   },
  EXPIRED:     { label: 'منتهي',       style: 'bg-orange-50 text-orange-700',  dot: 'bg-orange-500' },
};

function RequestStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, style: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${config.style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default RequestStatusBadge;
