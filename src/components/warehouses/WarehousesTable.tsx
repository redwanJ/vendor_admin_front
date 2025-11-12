'use client';

import { Eye, Edit, Trash2, Building2, CheckCircle2, CircleOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableBulkAction, DataTableColumn, DataTableRowAction } from '@/components/shared/DataTable';
import type { WarehouseListDto } from '@/types/warehouse';
import { useTranslations } from 'next-intl';

interface WarehousesTableProps {
  data: WarehouseListDto[];
  loading: boolean;
  // pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  // selection
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  // actions
  onView: (warehouse: WarehouseListDto) => void;
  onEdit: (warehouse: WarehouseListDto) => void;
  onDelete: (warehouse: WarehouseListDto) => void;
  onBulkDelete: (ids: string[]) => void;
}

export default function WarehousesTable({
  data,
  loading,
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  selectedIds,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
}: WarehousesTableProps) {
  const t = useTranslations('warehouses');
  const tCommon = useTranslations('common');

  const columns: DataTableColumn<WarehouseListDto>[] = [
    {
      key: 'name',
      label: t('columns.name'),
      sortable: true,
      render: (wh) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">{wh.name}</span>
            <span className="text-xs text-muted-foreground">{wh.code}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'isDefault',
      label: t('columns.default'),
      sortable: true,
      render: (wh) => (
        wh.isDefault ? (
          <Badge variant="secondary">{t('badges.default')}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: 'isActive',
      label: t('columns.status'),
      sortable: true,
      render: (wh) => (
        wh.isActive ? (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> {tCommon('status.active')}
          </Badge>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-1">
            <CircleOff className="h-3 w-3" /> {tCommon('status.inactive')}
          </Badge>
        )
      ),
    },
  ];

  const bulkActions: DataTableBulkAction[] = [
    {
      label: t('actions.deleteSelected'),
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: onBulkDelete,
      variant: 'destructive',
    },
  ];

  const rowActions: DataTableRowAction<WarehouseListDto>[] = [
    { label: t('actions.view'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: onView },
    { label: t('actions.edit'), icon: <Edit className="h-4 w-4 mr-2" />, onClick: onEdit },
    {
      label: t('actions.delete'),
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: onDelete,
      variant: 'destructive' as const,
    },
  ];

  return (
    <DataTable<WarehouseListDto>
      data={data}
      columns={columns}
      keyExtractor={(wh) => wh.id}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      bulkActions={bulkActions}
      rowActions={rowActions}
      loading={loading}
      emptyMessage={t('empty.list')}
    />
  );
}

