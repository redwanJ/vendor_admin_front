'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { authService } from '@/lib/auth.service';
import { useToast } from '@/hooks/use-toast';
import type { RegisterFormData } from '@/validations/auth.schema';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Remove confirmPassword from the data before sending
      const { confirmPassword, ...registrationData } = values;

      const response = await authService.register(registrationData);

      toast({
        title: 'Account Created',
        description: `Your account has been created successfully. You can now log in with your email ${response.email}.`,
      });

      // Redirect to login page with success message
      router.push(`/login?registered=true&email=${encodeURIComponent(response.email)}`);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.';

      toast({
        title: 'Registration Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
