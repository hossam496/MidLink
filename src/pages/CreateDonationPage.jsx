import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { listCategories, createDonation, submitDonation } from '@/services/donationService';
import { medicineDetailsSchema, deviceDetailsSchema, locationSchema, imagesSchema } from '@/validations/donationSchemas';
import FormField      from '@/components/common/FormField';
import Input          from '@/components/common/Input';
import Button         from '@/components/common/Button';
import Alert          from '@/components/common/Alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const STEPS = ['التفاصيل', 'الموقع', 'الصور والإرسال'];

function StepIndicator({ currentStep }) {
  return (
    <nav aria-label="خطوات النموذج" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((label, index) => {
          const stepNum  = index + 1;
          const isDone   = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <li key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300
                    ${isDone   ? 'bg-primary-600 text-white shadow-sm'
                    : isActive ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-sm'
                    :            'bg-gray-100 text-gray-400'}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isDone ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : stepNum}
                </div>
                <span className={`mt-2 text-xs font-medium ${isActive ? 'font-bold text-primary-700' : isDone ? 'text-primary-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`mx-2 mb-6 h-0.5 flex-1 rounded-full transition-colors duration-300 ${isDone ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function DetailsStep({ categories, initialValues = {}, onNext }) {
  const [itemType, setItemType] = useState(initialValues.itemType || 'medicine');

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: async (values) => {
      const activeSchema = itemType === 'medicine' ? medicineDetailsSchema : deviceDetailsSchema;
      try {
        const validated = await activeSchema.validate(
          { ...values, itemType },
          { abortEarly: false }
        );
        return { values: validated, errors: {} };
      } catch (yupError) {
        const formErrors = {};
        if (yupError.inner && yupError.inner.length > 0) {
          yupError.inner.forEach((err) => {
            if (err.path && !formErrors[err.path]) {
              formErrors[err.path] = {
                type: err.type || 'validation',
                message: err.message,
              };
            }
          });
        } else if (yupError.path) {
          formErrors[yupError.path] = {
            type: yupError.type || 'validation',
            message: yupError.message,
          };
        }
        return { values: {}, errors: formErrors };
      }
    },
    defaultValues: {
      itemType: initialValues.itemType || 'medicine',
      categoryId: initialValues.categoryId || '',
      name: initialValues.name || '',
      expiryDate: initialValues.expiryDate || '',
      quantity: initialValues.quantity ?? '',
      activeIngredients: initialValues.activeIngredients || '',
      manufacturer: initialValues.manufacturer || '',
      deviceType: initialValues.deviceType || '',
      condition: initialValues.condition || '',
      brand: initialValues.brand || '',
      description: initialValues.description || '',
    },
  });

  function handleItemTypeChange(type) {
    setItemType(type);
    setValue('itemType', type);
    setValue('categoryId', '');
    clearErrors();
  }

  const onSubmit = (data) => {
    onNext({ ...data, itemType });
  };

  const onError = (formErrors) => {
    console.warn('DetailsStep validation errors:', formErrors);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="flex flex-col gap-5">
      <div>
        <p className="mb-3 text-sm font-bold text-gray-800">ماذا تريد التبرع به؟</p>
        <div className="flex gap-3">
          {[
            { value: 'medicine', label: 'دواء', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
            { value: 'medical_device', label: 'جهاز طبي', icon: 'M11.42 15.17l-5.25-5.25m13.66 0l-5.25 5.25m-7.17-1.79c-.34-.34-.52-.8-.52-1.27V4.5c0-.47.18-.93.52-1.27a1.794 1.794 0 012.54 0l3.99 3.99 3.99-3.99a1.794 1.794 0 012.54 0c.34.34.52.8.52 1.27v8.36c0 .47-.18.93-.52 1.27l-5.78 5.78a1.794 1.794 0 01-2.54 0l-5.78-5.78z' },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleItemTypeChange(value)}
              className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 py-4 text-sm font-semibold transition-all
                ${itemType === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300'}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </button>
          ))}
        </div>
      </div>

      <FormField id="categoryId" label="التصنيف" required error={errors.categoryId?.message}>
        <select
          id="categoryId"
          className={`${errors.categoryId ? 'input-error' : 'input'} bg-white text-gray-800`}
          {...register('categoryId')}
        >
          <option value="">اختر تصنيفاً...</option>
          {categories.filter((c) => c.itemType === itemType).map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </FormField>

      {itemType === 'medicine' && (
        <>
          <FormField id="name" label="اسم الدواء" required error={errors.name?.message}>
            <Input id="name" type="text" placeholder="مثال: باراسيتامول 500 مغ" hasError={!!errors.name} {...register('name')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="expiryDate" label="تاريخ الانتهاء" required error={errors.expiryDate?.message}>
              <Input id="expiryDate" type="date" hasError={!!errors.expiryDate} {...register('expiryDate')} />
            </FormField>
            <FormField id="quantity" label="الكمية" error={errors.quantity?.message}>
              <Input id="quantity" type="number" min="1" placeholder="مثال: 30" hasError={!!errors.quantity} {...register('quantity')} />
            </FormField>
          </div>
          <FormField id="activeIngredients" label="المواد الفعّالة" error={errors.activeIngredients?.message}>
            <Input id="activeIngredients" type="text" placeholder="مثال: باراسيتامول" hasError={!!errors.activeIngredients} {...register('activeIngredients')} />
          </FormField>
          <FormField id="manufacturer" label="الشركة المصنّعة" error={errors.manufacturer?.message}>
            <Input id="manufacturer" type="text" hasError={!!errors.manufacturer} {...register('manufacturer')} />
          </FormField>
        </>
      )}

      {itemType === 'medical_device' && (
        <>
          <FormField id="deviceType" label="نوع الجهاز" required error={errors.deviceType?.message}>
            <Input id="deviceType" type="text" placeholder="مثال: كرسي متحرك، جهاز ضغط" hasError={!!errors.deviceType} {...register('deviceType')} />
          </FormField>
          <FormField id="condition" label="الحالة" required error={errors.condition?.message}>
            <select
              id="condition"
              className={`${errors.condition ? 'input-error' : 'input'} bg-white text-gray-800`}
              {...register('condition')}
            >
              <option value="">اختر الحالة...</option>
              <option value="new">جديد</option>
              <option value="good">جيد — مستعمل ويعمل بشكل كامل</option>
              <option value="fair">مقبول — يظهر بعض الاهتراء</option>
              <option value="needs_repair">يحتاج إصلاحاً بسيطاً</option>
            </select>
          </FormField>
          <FormField id="brand" label="الماركة" error={errors.brand?.message}>
            <Input id="brand" type="text" hasError={!!errors.brand} {...register('brand')} />
          </FormField>
        </>
      )}

      <FormField id="description" label="ملاحظات إضافية" error={errors.description?.message}>
        <textarea
          id="description"
          rows={3}
          className="input bg-white text-gray-800 resize-none"
          placeholder="أضف أي ملاحظات تساعد المستفيد"
          {...register('description')}
        />
      </FormField>

      {Object.keys(errors).length > 0 && (
        <Alert
          variant="error"
          message={`يرجى مراجعة الحقول: ${Object.entries(errors)
            .map(([k, v]) => `${k} (${v?.message || v?.type || 'خطأ'})`)
            .join(' — ')}`}
        />
      )}

      <Button type="submit" variant="primary" className="mt-2 w-full py-3 gap-1.5">
        التالي: الموقع
        <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </Button>
    </form>
  );
}

function LocationStep({ initialValues = {}, onNext, onBack }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(locationSchema),
    defaultValues: {
      latitude: initialValues.latitude ?? '',
      longitude: initialValues.longitude ?? '',
      locationLabel: initialValues.locationLabel || '',
    },
  });

  function handleDetectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude',  position.coords.latitude,  { shouldValidate: true });
        setValue('longitude', position.coords.longitude, { shouldValidate: true });
      },
      () => {}
    );
  }

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="flex flex-col gap-5">
      <div className="rounded-xl bg-primary-50/50 p-4">
        <p className="text-sm text-primary-700 leading-relaxed">
          نحتفظ بموقع تقريبي لمساعدة المستفيدين القريبين على إيجاد تبرعك.
          عنوانك الدقيق لن يُعرض للعموم.
        </p>
      </div>

      <Button type="button" variant="secondary" onClick={handleDetectLocation} className="w-full gap-2">
        <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        استخدام موقعي الحالي
      </Button>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="latitude" label="خط العرض" required error={errors.latitude?.message}>
          <Input id="latitude" type="number" step="any" hasError={!!errors.latitude} {...register('latitude')} />
        </FormField>
        <FormField id="longitude" label="خط الطول" required error={errors.longitude?.message}>
          <Input id="longitude" type="number" step="any" hasError={!!errors.longitude} {...register('longitude')} />
        </FormField>
      </div>

      <FormField id="locationLabel" label="المنطقة / المدينة (تُعرض للعموم)" error={errors.locationLabel?.message}>
        <Input id="locationLabel" type="text" placeholder="مثال: وسط القاهرة" hasError={!!errors.locationLabel} {...register('locationLabel')} />
      </FormField>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1 gap-1.5">
          <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          رجوع
        </Button>
        <Button type="submit" variant="primary" className="flex-1 gap-1.5">
          التالي: الصور
          <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Button>
      </div>
    </form>
  );
}

function ImagesStep({ onSubmit, onBack, isSubmitting, error }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(imagesSchema),
  });
  const watchedFiles = watch('images');
  const previews = watchedFiles ? Array.from(watchedFiles).map((f) => URL.createObjectURL(f)) : [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {error && <Alert variant="error" message={error} />}

      <FormField
        id="images"
        label="صور العنصر"
        required
        error={errors.images?.message}
        hint="أرفق 1-5 صور (JPEG أو PNG أو WebP، الحد الأقصى 5 ميغابايت لكل صورة)"
      >
        <div className="relative">
          <input
            id="images"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="input file:me-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-700 hover:file:bg-primary-100 file:transition-colors file:cursor-pointer"
            {...register('images')}
          />
        </div>
      </FormField>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <img key={i} src={src} alt={`معاينة ${i + 1}`} className="aspect-square w-full rounded-xl object-cover shadow-card" />
          ))}
        </div>
      )}

      <Alert variant="info" message="بعد الإرسال، سيتم مراجعة تبرعك قبل أن يصبح متاحاً للعموم." />

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1 gap-1.5" disabled={isSubmitting}>
          <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          رجوع
        </Button>
        <Button type="submit" variant="primary" className="flex-1 gap-1.5" isLoading={isSubmitting}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          إرسال التبرع
        </Button>
      </div>
    </form>
  );
}

function CreateDonationPage() {
  const navigate = useNavigate();
  const [step,         setStep]         = useState(1);
  const [categories,   setCategories]   = useState([]);
  const [formData,     setFormData]     = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState('');
  const [loadingCats,  setLoadingCats]  = useState(true);

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  function handleDetailsNext(data)  { setFormData((prev) => ({ ...prev, ...data })); setStep(2); }
  function handleLocationNext(data) { setFormData((prev) => ({ ...prev, ...data })); setStep(3); }

  async function handleImagesSubmit(data) {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('categoryId', formData.categoryId);
      fd.append('itemType',   formData.itemType);
      fd.append('longitude',  formData.longitude);
      fd.append('latitude',   formData.latitude);
      if (formData.locationLabel) fd.append('locationLabel', formData.locationLabel);
      if (formData.description)   fd.append('description',   formData.description);

      if (formData.itemType === 'medicine') {
        const medName = formData.name || formData.medicine?.name || formData['medicine.name'] || '';
        fd.append('medicine[name]', medName);

        const exp = formData.expiryDate || formData.medicine?.expiryDate || formData['medicine.expiryDate'];
        const expStr = exp instanceof Date ? exp.toISOString().split('T')[0] : (exp || '');
        fd.append('medicine[expiryDate]', expStr);

        const activeIng = formData.activeIngredients || formData.medicine?.activeIngredients || formData['medicine.activeIngredients'];
        if (activeIng) fd.append('medicine[activeIngredients]', activeIng);

        const qty = formData.quantity || formData.medicine?.quantity || formData['medicine.quantity'];
        if (qty) fd.append('medicine[quantity]', String(qty));

        const mfg = formData.manufacturer || formData.medicine?.manufacturer || formData['medicine.manufacturer'];
        if (mfg) fd.append('medicine[manufacturer]', mfg);
      } else if (formData.itemType === 'medical_device') {
        const devType = formData.deviceType || formData.medicalDevice?.deviceType || formData['medicalDevice.deviceType'] || '';
        fd.append('medicalDevice[deviceType]', devType);

        const cond = formData.condition || formData.medicalDevice?.condition || formData['medicalDevice.condition'] || '';
        fd.append('medicalDevice[condition]', cond);

        const brand = formData.brand || formData.medicalDevice?.brand || formData['medicalDevice.brand'];
        if (brand) fd.append('medicalDevice[brand]', brand);
      }

      Array.from(data.images).forEach((file) => fd.append('images', file));

      const { donation } = await createDonation(fd);
      await submitDonation(donation._id);
      navigate(`/donations/${donation._id}`, { state: { submitted: true } });
    } catch (error) {
      setSubmitError(error.message || 'فشل الإرسال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadingCats) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-surface-50 px-4 py-8">
      <div className="mx-auto max-w-xl animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">إنشاء تبرع جديد</h1>
          <p className="mt-1 text-sm text-gray-500">
            شارك الأدوية أو الأجهزة الطبية التي لم تعد تحتاجها
          </p>
        </div>
        <div className="card p-6 sm:p-8">
          <StepIndicator currentStep={step} />
          {step === 1 && <DetailsStep categories={categories} initialValues={formData} onNext={handleDetailsNext} />}
          {step === 2 && <LocationStep initialValues={formData} onNext={handleLocationNext} onBack={() => setStep(1)} />}
          {step === 3 && <ImagesStep onSubmit={handleImagesSubmit} onBack={() => setStep(2)} isSubmitting={isSubmitting} error={submitError} />}
        </div>
      </div>
    </div>
  );
}

export default CreateDonationPage;
