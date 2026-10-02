import * as yup from 'yup';

// ─── الخطوة 1: تفاصيل العنصر ─────────────────────────────────────────────────

export const medicineDetailsSchema = yup.object({
  categoryId: yup.string().required('التصنيف مطلوب'),
  itemType:   yup.string().oneOf(['medicine']).required(),

  name: yup
    .string()
    .trim()
    .max(200, 'يجب ألا يتجاوز اسم الدواء 200 حرف')
    .required('اسم الدواء مطلوب'),

  expiryDate: yup
    .date()
    .transform((val, orig) => {
      if (!orig) return null;
      if (orig instanceof Date) return orig;
      const parsed = new Date(orig);
      return isNaN(parsed.getTime()) ? new Date('invalid') : parsed;
    })
    .typeError('يرجى إدخال تاريخ صحيح')
    .min(new Date(new Date().setHours(0, 0, 0, 0)), 'انتهت صلاحية هذا الدواء')
    .required('تاريخ انتهاء الصلاحية مطلوب'),

  quantity: yup
    .number()
    .transform((val, orig) => (orig === '' || orig === null || isNaN(val) ? null : val))
    .typeError('الكمية يجب أن تكون رقماً')
    .integer('الكمية يجب أن تكون عدداً صحيحاً')
    .min(1, 'الكمية يجب أن تكون 1 على الأقل')
    .nullable(),

  activeIngredients: yup
    .string()
    .trim()
    .max(500, 'يجب ألا تتجاوز المواد الفعّالة 500 حرف')
    .nullable()
    .transform((val) => (val === '' ? null : val)),

  manufacturer: yup
    .string()
    .trim()
    .max(200, 'يجب ألا يتجاوز اسم الشركة 200 حرف')
    .nullable()
    .transform((val) => (val === '' ? null : val)),

  description: yup
    .string()
    .trim()
    .max(2000, 'يجب ألا تتجاوز الملاحظات 2000 حرف')
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});

export const deviceDetailsSchema = yup.object({
  categoryId: yup.string().required('التصنيف مطلوب'),
  itemType:   yup.string().oneOf(['medical_device']).required(),

  deviceType: yup
    .string()
    .trim()
    .max(200, 'يجب ألا يتجاوز نوع الجهاز 200 حرف')
    .required('نوع الجهاز مطلوب'),

  condition: yup
    .string()
    .oneOf(['new', 'good', 'fair', 'needs_repair'], 'يرجى اختيار الحالة')
    .required('حالة الجهاز مطلوبة'),

  brand: yup
    .string()
    .trim()
    .max(100, 'يجب ألا يتجاوز اسم الماركة 100 حرف')
    .nullable()
    .transform((val) => (val === '' ? null : val)),

  description: yup
    .string()
    .trim()
    .max(2000, 'يجب ألا تتجاوز الملاحظات 2000 حرف')
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});

// ─── الخطوة 2: الموقع ────────────────────────────────────────────────────────

export const locationSchema = yup.object({
  longitude: yup
    .number()
    .typeError('خط الطول مطلوب')
    .min(-180, 'خط الطول غير صحيح')
    .max(180,  'خط الطول غير صحيح')
    .required('خط الطول مطلوب'),

  latitude: yup
    .number()
    .typeError('خط العرض مطلوب')
    .min(-90, 'خط العرض غير صحيح')
    .max(90,  'خط العرض غير صحيح')
    .required('خط العرض مطلوب'),

  locationLabel: yup
    .string().trim()
    .max(200, 'يجب ألا يتجاوز اسم المنطقة 200 حرف'),
});

// ─── الخطوة 3: الصور ─────────────────────────────────────────────────────────

export const imagesSchema = yup.object({
  images: yup
    .mixed()
    .test('at-least-one',  'يرجى رفع صورة واحدة على الأقل', (v) => v && v.length > 0)
    .test('max-five',      'الحد الأقصى 5 صور',             (v) => !v || v.length <= 5)
    .test('valid-types',   'يُسمح فقط بصور JPEG أو PNG أو WebP', (v) => {
      if (!v) return true;
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      return Array.from(v).every((f) => allowed.includes(f.type));
    })
    .test('max-size', 'يجب أن يكون حجم كل صورة أقل من 5 ميغابايت', (v) => {
      if (!v) return true;
      return Array.from(v).every((f) => f.size <= 5 * 1024 * 1024);
    }),
});
