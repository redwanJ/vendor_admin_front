'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { customerService } from '@/services/customerService';
import CustomerForm from '@/components/customers/CustomerForm';
import type { CustomerDto, UpdateCustomerDto } from '@/types/customer';

export default function EditCustomerPage({ params: paramsPromise }: { params: Promise<{ id: string; locale: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true);
      try {
        const data = await customerService.getCustomerById(params.id);
        setCustomer(data);
      } catch (error: any) {
        toast({
          title: tCommon('messages.error'),
          description: error.response?.data?.error || t('toasts.loadError'),
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/customers`);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [params.id, params.locale, router, toast]);

  const handleSubmit = async (data: UpdateCustomerDto) => {
    setIsSubmitting(true);
    try {
      await customerService.updateCustomer(params.id, data);
      toast({
        title: tCommon('messages.success'),
        description: t('toasts.updateSuccess'),
      });
      router.push(`/${params.locale}/dashboard/customers/${params.id}`);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || t('toasts.updateError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${params.locale}/dashboard/customers/${params.id}`);
  };

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('form.editTitle', { name: customer.fullName })}</h1>
        <p className="text-muted-foreground">{t('form.editDescription')}</p>
      </div>

      <CustomerForm
        initialData={customer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEdit
      />
    </div>
  );
}
