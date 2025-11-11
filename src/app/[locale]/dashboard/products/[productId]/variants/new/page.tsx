'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { variantService } from '@/services/variantService';
import VariantForm from '@/components/variants/VariantForm';
import type { CreateVariantDto, UpdateVariantDto } from '@/types/variant';

export default function NewVariantPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const productId = params?.productId as string;
  const { toast } = useToast();
  const t = useTranslations('variants');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateVariantDto | UpdateVariantDto) => {
    setIsSubmitting(true);
    try {
      const result = await variantService.createVariant(data as CreateVariantDto);
      toast({
        title: tCommon('messages.success'),
        description: t('toasts.createSuccess'),
      });
      router.push(`/${locale}/dashboard/products/${productId}/variants`);
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
    router.push(`/${locale}/dashboard/products/${productId}/variants`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('actions.add')}</h1>
        <p className="text-muted-foreground">{t('form.newDescription')}</p>
      </div>

      <VariantForm
        productId={productId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
