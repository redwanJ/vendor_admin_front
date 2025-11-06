'use client';

import * as React from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LoginForm } from '@/components/forms/LoginForm';
import { authService } from '@/lib/auth.service';
import { useToast } from '@/hooks/use-toast';
import type { LoginFormData } from '@/validations/auth.schema';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();
  const t = useTranslations('auth.errors');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (values: LoginFormData & { rememberMe?: boolean }) => {
    setIsLoading(true);
    try {
      // Login first
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      // Fetch user info from /me endpoint
      const user = await authService.getCurrentUser();

      // Handle remember me functionality
      if (values.rememberMe) {
        localStorage.setItem('rememberEmail', values.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      toast({
        title: 'Success',
        description: 'You have been logged in successfully.',
      });

      // Redirect to dashboard with locale
      const redirectUrl = searchParams.get('from') || `/${locale}/dashboard`;
      router.push(redirectUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email if available
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      // Pre-fill would require adjusting form initial values
      // This is handled by the form component if needed
    }
  }, []);

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
