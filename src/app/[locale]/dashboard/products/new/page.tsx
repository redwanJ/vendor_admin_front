'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/productService';
import ProductForm from '@/components/products/ProductForm';
import type { CreateProductDto, UpdateProductDto } from '@/types/product';

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { toast } = useToast();
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    setIsSubmitting(true);
    try {
      const result = await productService.createProduct(data as CreateProductDto);
      toast({
        title: tCommon('messages.success'),
        description: t('toasts.createSuccess'),
      });
      router.push(`/${locale}/dashboard/products/${result.id}`);
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
    router.push(`/${locale}/dashboard/products`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('actions.add')}</h1>
        <p className="text-muted-foreground">{t('form.newDescription')}</p>
      </div>

      <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
    </div>
  );
}
