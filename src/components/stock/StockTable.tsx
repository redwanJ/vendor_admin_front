'use client';

import { Eye } from 'lucide-react';
import { DataTable, DataTableColumn, DataTableRowAction } from '@/components/shared/DataTable';
import type { StockListItemDto } from '@/types/stock';
import { useTranslations } from 'next-intl';

interface StockTableProps {
  data: StockListItemDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewVariant: (item: StockListItemDto) => void;
  // selection
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export default function StockTable({
  data,
  loading,
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  onViewVariant,
  selectedIds = [],
  onSelectionChange,
}: StockTableProps) {
  const t = useTranslations('inventory.stockList');

  const columns: DataTableColumn<StockListItemDto>[] = [
    { key: 'sku', label: t('columns.sku'), sortable: true },
    { key: 'warehouseCode', label: t('columns.warehouse'), sortable: true, render: (i) => `${i.warehouseCode}` },
    { key: 'locationCode', label: t('columns.location'), sortable: true, render: (i) => `${i.locationCode}` },
    { key: 'onHandQty', label: t('columns.onHand'), sortable: true },
    { key: 'reservedQty', label: t('columns.reserved'), sortable: true },
    { key: 'availableQty', label: t('columns.available'), sortable: true },
  ];

  const rowActions: DataTableRowAction<StockListItemDto>[] = [
    { label: t('actions.viewVariant'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: onViewVariant },
  ];

  return (
    <DataTable<StockListItemDto>
      data={data}
      columns={columns}
      keyExtractor={(item) => `${item.variantId}-${item.locationId}`}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      loading={loading}
      emptyMessage={t('empty.list')}
      rowActions={rowActions}
    />
  );
}
