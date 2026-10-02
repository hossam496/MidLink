import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from '@/hooks/useAuth';
import { registerSchema } from '@/validations/authSchemas';
import { ROLES } from '@/config/constants';
import FormField from '@/components/common/FormField';
import Input     from '@/components/common/Input';
import Button    from '@/components/common/Button';
import Alert     from '@/components/common/Alert';

function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError,    setServerError]    = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver:      yupResolver(registerSchema),
    defaultValues: { role: ROLES.DONOR },
  });

  async function onSubmit(data) {
    setServerError('');
    setSuccessMessage('');
    try {
      await registerUser(data);
      setSuccessMessage('تم إنشاء الحساب بنجاح! سيتم تحويلك لتسجيل الدخول...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setServerError(error.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-12">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-50/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ميدلينك</h1>
          <p className="mt-2 text-sm text-gray-500">
            التبرع الطبي الآمن، بكل سهولة
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            إنشاء حساب جديد
          </h2>

          {serverError    && <Alert variant="error"   message={serverError}    className="mb-5" />}
          {successMessage && <Alert variant="success" message={successMessage} className="mb-5" />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

            <FormField id="name" label="الاسم الكامل" required error={errors.name?.message}>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="أدخل اسمك الكامل"
                hasError={!!errors.name}
                {...register('name')}
              />
            </FormField>

            <FormField id="email" label="البريد الإلكتروني" required error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                hasError={!!errors.email}
                {...register('email')}
              />
            </FormField>

            <FormField
              id="password"
              label="كلمة المرور"
              required
              error={errors.password?.message}
              hint="8 أحرف على الأقل تتضمن حرفاً كبيراً وصغيراً ورقماً"
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                hasError={!!errors.password}
                {...register('password')}
              />
            </FormField>

            <FormField
              id="confirmPassword"
              label="تأكيد كلمة المرور"
              required
              error={errors.confirmPassword?.message}
            >
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                hasError={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
            </FormField>

            <FormField id="role" label="أريد أن" required error={errors.role?.message}>
              <select
                id="role"
                className={`${errors.role ? 'input-error' : 'input'} bg-white text-gray-800`}
                {...register('role')}
              >
                <option value={ROLES.DONOR}>أتبرع بأدوية أو أجهزة طبية</option>
                <option value={ROLES.BENEFICIARY}>أطلب أدوية أو أجهزة طبية</option>
              </select>
            </FormField>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="mt-1 w-full py-3"
            >
              إنشاء الحساب
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">أو</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              سجّل دخولك
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
