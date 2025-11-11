'use client';

import { Eye, Edit, Trash2, Package, DollarSign, Barcode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableBulkAction, DataTableColumn, DataTableRowAction } from '@/components/shared/DataTable';
import type { VariantDto } from '@/types/variant';
import { useTranslations } from 'next-intl';

interface VariantsTableProps {
  data: VariantDto[];
  loading: boolean;
  // selection
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  // actions
  onView: (variant: VariantDto) => void;
  onEdit: (variant: VariantDto) => void;
  onDelete: (variant: VariantDto) => void;
  onBulkDelete: (ids: string[]) => void;
}

export default function VariantsTable({
  data,
  loading,
  selectedIds,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
}: VariantsTableProps) {
  const t = useTranslations('variants');

  const columns: DataTableColumn<VariantDto>[] = [
    {
      key: 'sku',
      label: t('columns.sku'),
      sortable: true,
      render: (variant) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">{variant.sku}</span>
            {variant.barcode && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Barcode className="h-3 w-3" />
                {variant.barcode}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'options',
      label: t('columns.options'),
      render: (variant) => {
        try {
          const options = JSON.parse(variant.options);
          const optionEntries = Object.entries(options);
          if (optionEntries.length === 0) {
            return <span className="text-sm text-muted-foreground">-</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {optionEntries.slice(0, 2).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}: {String(value)}
                </Badge>
              ))}
              {optionEntries.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{optionEntries.length - 2}
                </Badge>
              )}
            </div>
          );
        } catch {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
      },
    },
    {
      key: 'price',
      label: t('columns.price'),
      sortable: true,
      render: (variant) => (
        <span className="font-medium flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {variant.price.toFixed(2)} {variant.currency}
        </span>
      ),
    },
    {
      key: 'cost',
      label: t('columns.cost'),
      render: (variant) =>
        variant.cost ? (
          <span className="text-sm">
            {variant.cost.toFixed(2)} {variant.costCurrency || variant.currency}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: 'trackInventory',
      label: t('columns.trackInventory'),
      render: (variant) => (
        <Badge variant={variant.trackInventory ? 'default' : 'secondary'}>
          {variant.trackInventory ? t('status.tracked') : t('status.notTracked')}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: t('columns.status'),
      sortable: true,
      render: (variant) => (
        <Badge variant={variant.isActive ? 'default' : 'secondary'}>
          {variant.isActive ? t('status.active') : t('status.inactive')}
        </Badge>
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

  const rowActions: DataTableRowAction<VariantDto>[] = [
    { label: t('actions.view'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: onView },
    { label: t('actions.edit'), icon: <Edit className="h-4 w-4 mr-2" />, onClick: onEdit },
    {
      label: t('actions.delete'),
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: onDelete,
      variant: 'destructive',
    },
  ];

  return (
    <DataTable<VariantDto>
      data={data}
      columns={columns}
      keyExtractor={(variant) => variant.id}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      bulkActions={bulkActions}
      rowActions={rowActions}
      loading={loading}
      emptyMessage={t('empty.list')}
      currentPage={1}
      totalPages={1}
      pageSize={data.length}
      totalCount={data.length}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
    />
  );
}
