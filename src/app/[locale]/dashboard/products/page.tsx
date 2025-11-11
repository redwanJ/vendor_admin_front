'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { useConfirmDialog } from '@/components/shared/ConfirmDialog';
import { productService } from '@/services/productService';
import type { ProductListDto } from '@/types/product';
import ProductsHeader from '@/components/products/ProductsHeader';
import ProductsFilters from '@/components/products/ProductsFilters';
import ProductsTable from '@/components/products/ProductsTable';

export default function ProductsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { toast } = useToast();
  const { confirm, dialog } = useConfirmDialog();
  const t = useTranslations('products');
  const tCommon = useTranslations('common');

  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productService.getProducts({
        search: searchTerm || undefined,
        page: currentPage,
        pageSize,
      });

      setProducts(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || t('toasts.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, toast, t, tCommon]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleDelete = async (id: string) => {
    await confirm({
      title: t('confirm.deleteTitle'),
      description: t('confirm.delete'),
      confirmText: t('actions.delete'),
      cancelText: tCommon('actions.cancel'),
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await productService.deleteProduct(id);
          toast({
            title: tCommon('messages.success'),
            description: t('toasts.deleteSuccess'),
          });
          loadProducts();
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
          await Promise.all(ids.map((id) => productService.deleteProduct(id)));
          toast({
            title: tCommon('messages.success'),
            description: t('toasts.bulkDeleteSuccess', { count: ids.length }),
          });
          setSelectedIds([]);
          loadProducts();
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
  if (loading && products.length === 0 && totalCount === 0) {
    return (
      <div className="space-y-6">
        <ProductsHeader onAdd={() => router.push(`/${locale}/dashboard/products/new`)} />
        <ApiKeyListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dialog}
      <ProductsHeader onAdd={() => router.push(`/${locale}/dashboard/products/new`)} />

      <ProductsFilters searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      <ProductsTable
        data={products}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={(product) => router.push(`/${locale}/dashboard/products/${product.id}`)}
        onEdit={(product) => router.push(`/${locale}/dashboard/products/${product.id}/edit`)}
        onDelete={(product) => handleDelete(product.id)}
        onBulkDelete={handleBulkDelete}
        onManageVariants={(product) => router.push(`/${locale}/dashboard/products/${product.id}/variants`)}
      />
    </div>
  );
}
