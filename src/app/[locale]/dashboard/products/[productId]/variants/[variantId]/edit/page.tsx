'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { variantService } from '@/services/variantService';
import VariantForm from '@/components/variants/VariantForm';
import type { VariantDto, UpdateVariantDto } from '@/types/variant';

export default function EditVariantPage({
  params: paramsPromise,
}: {
  params: Promise<{ variantId: string; productId: string; locale: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('variants');
  const tCommon = useTranslations('common');
  const [variant, setVariant] = useState<VariantDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadVariant = async () => {
      setLoading(true);
      try {
        const data = await variantService.getVariantById(params.variantId);
        setVariant(data);
      } catch (error: any) {
        toast({
          title: tCommon('messages.error'),
          description: error.response?.data?.error || t('toasts.loadError'),
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/products/${params.productId}/variants`);
      } finally {
        setLoading(false);
      }
    };

    loadVariant();
  }, [params.variantId, params.productId, params.locale, router, toast, t, tCommon]);

  const handleSubmit = async (data: UpdateVariantDto) => {
    setIsSubmitting(true);
    try {
      await variantService.updateVariant(params.variantId, data);
      toast({
        title: tCommon('messages.success'),
        description: t('toasts.updateSuccess'),
      });
      router.push(`/${params.locale}/dashboard/products/${params.productId}/variants`);
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
    router.push(`/${params.locale}/dashboard/products/${params.productId}/variants`);
  };

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!variant) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('form.editTitle', { sku: variant.sku })}
        </h1>
        <p className="text-muted-foreground">{t('form.editDescription')}</p>
      </div>

      <VariantForm
        initialData={variant}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEdit
      />
    </div>
  );
}
