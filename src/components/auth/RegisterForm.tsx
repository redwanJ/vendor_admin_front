'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import { toFormikValidationSchema } from '@/lib/formik-zod-adapter';
import { registerSchema, type RegisterFormData } from '@/validations/auth.schema';
import { FormField } from '../forms/FormField';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RegisterFormProps {
  onSubmit: (values: RegisterFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const t = useTranslations('auth.register');
  const locale = useLocale();

  const initialValues: RegisterFormData = {
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessSlug: '',
    phoneNumber: '',
    address: '',
  };

  return (
    <Card className="w-full max-w-2xl border shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription className="text-base">{t('description')}</CardDescription>
      </CardHeader>
      <Formik
        initialValues={initialValues}
        validate={toFormikValidationSchema(registerSchema)}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-0">
            <CardContent className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Personal Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="email"
                    label={t('email')}
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    autoComplete="email"
                  />
                  <FormField
                    name="fullName"
                    label={t('fullName')}
                    type="text"
                    placeholder={t('fullNamePlaceholder')}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Business Information Section */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Business Information
                </div>
                <FormField
                  name="businessName"
                  label={t('businessName')}
                  type="text"
                  placeholder={t('businessNamePlaceholder')}
                  autoComplete="organization"
                />
                <FormField
                  name="businessSlug"
                  label={t('businessSlug')}
                  type="text"
                  placeholder={t('businessSlugPlaceholder')}
                  helperText={t('businessSlugHint')}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="phoneNumber"
                    label={t('phoneNumber')}
                    type="tel"
                    placeholder={t('phoneNumberPlaceholder')}
                    autoComplete="tel"
                  />
                  <FormField
                    name="address"
                    label={t('address')}
                    type="text"
                    placeholder={t('addressPlaceholder')}
                    autoComplete="street-address"
                  />
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Security
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="password"
                    label={t('password')}
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    autoComplete="new-password"
                    helperText="At least 8 characters with uppercase, lowercase, and numbers"
                  />
                  <FormField
                    name="confirmPassword"
                    label={t('confirmPassword')}
                    type="password"
                    placeholder={t('confirmPasswordPlaceholder')}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? t('submitting') : t('submit')}
              </Button>

              <div className="border-t pt-4 text-center text-sm text-muted-foreground">
                <span>{t('hasAccount')} </span>
                <Link
                  href={`/${locale}/login`}
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  {t('signIn')}
                </Link>
              </div>
            </CardFooter>
          </Form>
        )}
      </Formik>
    </Card>
  );
}
