'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { warehouseService } from '@/services/warehouseService';
import WarehouseForm from '@/components/warehouses/WarehouseForm';
import type { WarehouseDto, UpdateWarehouseDto } from '@/types/warehouse';

export default function EditWarehousePage({
  params: paramsPromise,
}: {
  params: Promise<{ warehouseId: string; locale: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('warehouses');
  const tCommon = useTranslations('common');
  const [warehouse, setWarehouse] = useState<WarehouseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadWarehouse = async () => {
      setLoading(true);
      try {
        const data = await warehouseService.getWarehouseById(params.warehouseId);
        setWarehouse(data);
      } catch (error: any) {
        toast({
          title: tCommon('messages.error'),
          description: error.response?.data?.error || t('toasts.loadError'),
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/warehouses`);
      } finally {
        setLoading(false);
      }
    };

    loadWarehouse();
  }, [params.warehouseId, params.locale, router, toast, t, tCommon]);

  const handleSubmit = async (data: UpdateWarehouseDto) => {
    setIsSubmitting(true);
    try {
      await warehouseService.updateWarehouse(params.warehouseId, data);
      toast({ title: tCommon('messages.success'), description: t('toasts.updateSuccess') });
      router.push(`/${params.locale}/dashboard/warehouses/${params.warehouseId}`);
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
    router.push(`/${params.locale}/dashboard/warehouses/${params.warehouseId}`);
  };

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!warehouse) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('form.editTitle', { name: warehouse.name })}</h1>
        <p className="text-muted-foreground">{t('form.editDescription')}</p>
      </div>

      <WarehouseForm
        initialData={warehouse}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEdit
      />
    </div>
  );
}

