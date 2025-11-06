'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import { toFormikValidationSchema } from '@/lib/formik-zod-adapter';
import { loginSchema, type LoginFormData } from '@/validations/auth.schema';
import { FormField } from './FormField';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface LoginFormProps {
  onSubmit: (values: LoginFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const t = useTranslations('auth.login');
  const locale = useLocale();

  const initialValues: LoginFormData = {
    email: '',
    password: '',
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <Formik
        initialValues={initialValues}
        validate={toFormikValidationSchema(loginSchema)}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <CardContent className="space-y-4">
              <FormField
                name="email"
                label={t('email')}
                type="email"
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
              />
              <FormField
                name="password"
                label={t('password')}
                type="password"
                placeholder={t('passwordPlaceholder')}
                autoComplete="current-password"
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? t('submitting') : t('submit')}
              </Button>

              <div className="space-y-2 text-center text-sm">
                <div className="text-muted-foreground">
                  <Link href={`/${locale}/forgot-password`} className="hover:text-primary transition-colors">
                    {t('forgotPassword')}
                  </Link>
                </div>

                <div className="border-t pt-4 text-muted-foreground">
                  <span>{t('noAccount')} </span>
                  <Link
                    href={`/${locale}/register`}
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    {t('signUp')}
                  </Link>
                </div>
              </div>
            </CardFooter>
          </Form>
        )}
      </Formik>
    </Card>
  );
}
