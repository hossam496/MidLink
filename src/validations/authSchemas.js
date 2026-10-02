import * as yup from 'yup';
import { ROLES } from '@/config/constants';

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2,  'يجب أن يكون الاسم حرفين على الأقل')
    .max(80, 'يجب ألا يتجاوز الاسم 80 حرفاً')
    .required('الاسم مطلوب'),

  email: yup
    .string()
    .trim()
    .email('يرجى إدخال بريد إلكتروني صحيح')
    .required('البريد الإلكتروني مطلوب'),

  password: yup
    .string()
    .min(8,  'يجب أن تكون كلمة المرور 8 أحرف على الأقل')
    .matches(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير')
    .matches(/[a-z]/, 'يجب أن تحتوي كلمة المرور على حرف صغير')
    .matches(/\d/,    'يجب أن تحتوي كلمة المرور على رقم')
    .required('كلمة المرور مطلوبة'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'كلمتا المرور غير متطابقتين')
    .required('يرجى تأكيد كلمة المرور'),

  role: yup
    .string()
    .oneOf([ROLES.DONOR, ROLES.BENEFICIARY], 'يرجى اختيار دور صحيح')
    .required('يرجى اختيار الدور'),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('يرجى إدخال بريد إلكتروني صحيح')
    .required('البريد الإلكتروني مطلوب'),

  password: yup
    .string()
    .required('كلمة المرور مطلوبة'),
});
