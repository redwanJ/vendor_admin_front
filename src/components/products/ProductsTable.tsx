'use client';

import { Eye, Edit, Trash2, Package, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableBulkAction, DataTableColumn, DataTableRowAction } from '@/components/shared/DataTable';
import type { ProductListDto } from '@/types/product';
import { useTranslations } from 'next-intl';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Draft: 'outline',
  Active: 'default',
  Inactive: 'secondary',
  Archived: 'destructive',
};

interface ProductsTableProps {
  data: ProductListDto[];
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
  onView: (product: ProductListDto) => void;
  onEdit: (product: ProductListDto) => void;
  onDelete: (product: ProductListDto) => void;
  onBulkDelete: (ids: string[]) => void;
  onManageVariants?: (product: ProductListDto) => void;
}

export default function ProductsTable({
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
  onManageVariants,
}: ProductsTableProps) {
  const t = useTranslations('products');

  const columns: DataTableColumn<ProductListDto>[] = [
    {
      key: 'name',
      label: t('columns.name'),
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            <span className="text-xs text-muted-foreground">{product.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: t('columns.status'),
      sortable: true,
      render: (product) => (
        <Badge variant={statusColors[product.status] || 'default'}>
          {t(`status.${product.status}` as any)}
        </Badge>
      ),
    },
    {
      key: 'tags',
      label: t('columns.tags'),
      render: (product) => {
        if (!product.tags || product.tags.trim() === '') {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        const tagArray = product.tags.split(',').map((t) => t.trim()).filter(Boolean);
        return tagArray.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tagArray.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {tagArray.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{tagArray.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
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

  const rowActions: DataTableRowAction<ProductListDto>[] = [
    { label: t('actions.view'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: onView },
    { label: t('actions.edit'), icon: <Edit className="h-4 w-4 mr-2" />, onClick: onEdit },
    ...(onManageVariants
      ? [
          {
            label: t('actions.manageVariants'),
            icon: <Package className="h-4 w-4 mr-2" />,
            onClick: onManageVariants,
          },
        ]
      : []),
    {
      label: t('actions.delete'),
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: onDelete,
      variant: 'destructive' as const,
    },
  ];

  return (
    <DataTable<ProductListDto>
      data={data}
      columns={columns}
      keyExtractor={(product) => product.id}
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
