'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { customerService } from '@/services/customerService';
import CustomerForm from '@/components/customers/CustomerForm';
import type { CreateCustomerDto } from '@/types/customer';

export default function NewCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { toast } = useToast();
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateCustomerDto) => {
    setIsSubmitting(true);
    try {
      const result = await customerService.createCustomer(data);
      toast({
        title: tCommon('messages.success'),
        description: t('toasts.createSuccess'),
      });
      router.push(`/${locale}/dashboard/customers/${result.id}`);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || t('toasts.createError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/dashboard/customers`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('actions.add')}</h1>
        <p className="text-muted-foreground">{t('form.newDescription')}</p>
      </div>

      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
