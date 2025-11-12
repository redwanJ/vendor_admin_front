'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';
import StockHeader from '@/components/stock/StockHeader';
import StockFilters from '@/components/stock/StockFilters';
import StockTable from '@/components/stock/StockTable';
import { stockService } from '@/services/stockService';
import type { StockListItemDto } from '@/types/stock';

export default function StockListPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('inventory.stockList');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  const [items, setItems] = useState<StockListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [search, setSearch] = useState('');
  const [warehouseIds, setWarehouseIds] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await stockService.getStockList({
        search: search || undefined,
        warehouseIds: warehouseIds.length ? warehouseIds : undefined,
        locationIds: locationIds.length ? locationIds : undefined,
        page: currentPage,
        pageSize,
      });
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error?.response?.data?.error || t('toasts.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [search, warehouseIds, locationIds, currentPage, pageSize, toast, t, tCommon]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && items.length === 0) {
    return (
      <div className="space-y-6">
        <StockHeader />
        <ApiKeyListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StockHeader />
      <StockFilters
        search={search}
        warehouseIds={warehouseIds}
        locationIds={locationIds}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
        onWarehouseIdsChange={(ids) => { setWarehouseIds(ids); setCurrentPage(1); }}
        onLocationIdsChange={(ids) => { setLocationIds(ids); setCurrentPage(1); }}
      />

      <StockTable
        data={items}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        onViewVariant={(item) => router.push(`/${locale}/dashboard/products/${item.productId}/variants/${item.variantId}`)}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
}
