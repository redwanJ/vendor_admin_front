'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { useConfirmDialog } from '@/components/shared/ConfirmDialog';
import { warehouseService } from '@/services/warehouseService';
import type { WarehouseListDto } from '@/types/warehouse';
import WarehousesHeader from '@/components/warehouses/WarehousesHeader';
import WarehousesFilters from '@/components/warehouses/WarehousesFilters';
import WarehousesTable from '@/components/warehouses/WarehousesTable';

export default function WarehousesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { toast } = useToast();
  const { confirm, dialog } = useConfirmDialog();
  const t = useTranslations('warehouses');
  const tCommon = useTranslations('common');

  const [warehouses, setWarehouses] = useState<WarehouseListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state (client-side since API returns full list)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await warehouseService.getWarehouses();
      setWarehouses(result);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error?.response?.data?.error || t('toasts.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t, tCommon]);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return warehouses;
    return warehouses.filter((w) =>
      [w.name, w.code].some((v) => v?.toLowerCase().includes(term))
    );
  }, [warehouses, searchTerm]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

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
          await warehouseService.deleteWarehouse(id);
          toast({ title: tCommon('messages.success'), description: t('toasts.deleteSuccess') });
          await loadWarehouses();
        } catch (error: any) {
          toast({
            title: tCommon('messages.error'),
            description: error?.response?.data?.error || t('toasts.deleteError'),
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
          await Promise.all(ids.map((id) => warehouseService.deleteWarehouse(id)));
          toast({ title: tCommon('messages.success'), description: t('toasts.bulkDeleteSuccess', { count: ids.length }) });
          setSelectedIds([]);
          await loadWarehouses();
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

  if (loading && warehouses.length === 0) {
    return (
      <div className="space-y-6">
        <WarehousesHeader onAdd={() => router.push(`/${locale}/dashboard/warehouses/new`)} />
        <ApiKeyListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dialog}
      <WarehousesHeader onAdd={() => router.push(`/${locale}/dashboard/warehouses/new`)} />

      <WarehousesFilters searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      <WarehousesTable
        data={paginated}
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
        onView={(wh) => router.push(`/${locale}/dashboard/warehouses/${wh.id}`)}
        onEdit={(wh) => router.push(`/${locale}/dashboard/warehouses/${wh.id}/edit`)}
        onDelete={(wh) => handleDelete(wh.id)}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
}

