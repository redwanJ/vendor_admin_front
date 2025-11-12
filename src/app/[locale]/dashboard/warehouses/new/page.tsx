'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { warehouseService } from '@/services/warehouseService';
import WarehouseForm from '@/components/warehouses/WarehouseForm';
import type { CreateWarehouseDto, UpdateWarehouseDto } from '@/types/warehouse';

export default function NewWarehousePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { toast } = useToast();
  const t = useTranslations('warehouses');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateWarehouseDto | UpdateWarehouseDto) => {
    setIsSubmitting(true);
    try {
      const result = await warehouseService.createWarehouse(data as CreateWarehouseDto);
      toast({ title: tCommon('messages.success'), description: t('toasts.createSuccess') });
      router.push(`/${locale}/dashboard/warehouses/${result.id}`);
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
    router.push(`/${locale}/dashboard/warehouses`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('actions.add')}</h1>
        <p className="text-muted-foreground">{t('form.newDescription')}</p>
      </div>

      <WarehouseForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
    </div>
  );
}

