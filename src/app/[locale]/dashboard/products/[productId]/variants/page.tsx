'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { useConfirmDialog } from '@/components/shared/ConfirmDialog';
import { variantService } from '@/services/variantService';
import type { VariantDto } from '@/types/variant';
import VariantsHeader from '@/components/variants/VariantsHeader';
import VariantsTable from '@/components/variants/VariantsTable';

export default function ProductVariantsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const productId = params?.productId as string;
  const { toast } = useToast();
  const { confirm, dialog } = useConfirmDialog();
  const t = useTranslations('variants');
  const tCommon = useTranslations('common');

  const [variants, setVariants] = useState<VariantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Load variants
  const loadVariants = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const result = await variantService.getVariantsByProduct(productId);
      setVariants(result);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || t('toasts.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [productId, toast, t, tCommon]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  const handleDelete = async (id: string) => {
    await confirm({
      title: t('confirm.deleteTitle'),
      description: t('confirm.delete'),
      confirmText: t('actions.delete'),
      cancelText: tCommon('actions.cancel'),
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await variantService.deleteVariant(id);
          toast({
            title: tCommon('messages.success'),
            description: t('toasts.deleteSuccess'),
          });
          loadVariants();
        } catch (error: any) {
          toast({
            title: tCommon('messages.error'),
            description: error.response?.data?.error || t('toasts.deleteError'),
            variant: 'destructive',
          });
          throw error;
        }
      },
    });
  };

  const handleBulkDelete = async (ids: string[]) => {
    await confirm({
      title: t('confirm.bulkDeleteTitle'),
      description: t('confirm.bulkDelete', { count: ids.length }),
      confirmText: t('actions.deleteSelected'),
      cancelText: tCommon('actions.cancel'),
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await Promise.all(ids.map((id) => variantService.deleteVariant(id)));
          toast({
            title: tCommon('messages.success'),
            description: t('toasts.bulkDeleteSuccess', { count: ids.length }),
          });
          setSelectedIds([]);
          loadVariants();
        } catch (error: any) {
          toast({
            title: tCommon('messages.error'),
            description: error?.message || t('toasts.bulkDeleteError'),
            variant: 'destructive',
          });
          throw error;
        }
      },
    });
  };

  // Show skeleton on initial load
  if (loading && variants.length === 0) {
    return (
      <div className="space-y-6">
        <VariantsHeader
          onAdd={() => router.push(`/${locale}/dashboard/products/${productId}/variants/new`)}
        />
        <ApiKeyListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dialog}
      <VariantsHeader
        onAdd={() => router.push(`/${locale}/dashboard/products/${productId}/variants/new`)}
      />

      <VariantsTable
        data={variants}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={(variant) => router.push(`/${locale}/dashboard/products/${productId}/variants/${variant.id}`)}
        onEdit={(variant) =>
          router.push(`/${locale}/dashboard/products/${productId}/variants/${variant.id}/edit`)
        }
        onDelete={(variant) => handleDelete(variant.id)}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
}
