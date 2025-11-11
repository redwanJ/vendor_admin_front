'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { productService } from '@/services/productService';
import ProductForm from '@/components/products/ProductForm';
import type { ProductDto, UpdateProductDto } from '@/types/product';

export default function EditProductPage({
  params: paramsPromise,
}: {
  params: Promise<{ productId: string; locale: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(params.productId);
        setProduct(data);
      } catch (error: any) {
        toast({
          title: tCommon('messages.error'),
          description: error.response?.data?.error || t('toasts.loadError'),
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/products`);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.productId, params.locale, router, toast, t, tCommon]);

  const handleSubmit = async (data: UpdateProductDto) => {
    setIsSubmitting(true);
    try {
      await productService.updateProduct(params.productId, data);
      toast({
        title: tCommon('messages.success'),
        description: t('toasts.updateSuccess'),
      });
      router.push(`/${params.locale}/dashboard/products/${params.productId}`);
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
    router.push(`/${params.locale}/dashboard/products/${params.productId}`);
  };

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('form.editTitle', { name: product.name })}</h1>
        <p className="text-muted-foreground">{t('form.editDescription')}</p>
      </div>

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEdit
      />
    </div>
  );
}
