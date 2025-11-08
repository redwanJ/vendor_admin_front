'use client';

import { Eye, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableBulkAction, DataTableColumn, DataTableRowAction } from '@/components/shared/DataTable';
import type { ServiceListDto } from '@/types/service';
import { useTranslations } from 'next-intl';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Draft: 'secondary',
  PendingApproval: 'outline',
  Active: 'default',
  Inactive: 'outline',
  Archived: 'destructive',
};

interface ServicesTableProps {
  data: ServiceListDto[];
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
  // sorting
  sortBy: string;
  sortDescending: boolean;
  onSort: (column: string, descending: boolean) => void;
  // search
  onSearch: (term: string) => void;
  // actions
  onView: (service: ServiceListDto) => void;
  onEdit: (service: ServiceListDto) => void;
  onDelete: (service: ServiceListDto) => void;
  onBulkDelete: (ids: string[]) => void;
}

export default function ServicesTable({
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
  sortBy,
  sortDescending,
  onSort,
  onSearch,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
}: ServicesTableProps) {
  const t = useTranslations('services');
  const columns: DataTableColumn<ServiceListDto>[] = [
    {
      key: 'image',
      label: t('columns.image'),
      render: (service) => (
        <div className="w-16 h-16 relative rounded overflow-hidden bg-muted flex items-center justify-center">
          {service.primaryImageUrl ? (
            <img
              src={service.primaryImageUrl}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No image</span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: t('columns.service'),
      sortable: true,
      render: (service) => (
        <div className="flex flex-col">
          <span className="font-medium">{service.name}</span>
          <span className="text-xs text-muted-foreground">{service.shortDescription}</span>
        </div>
      ),
    },
    { key: 'serviceType', label: t('columns.type'), render: (service) => service.serviceType.name },
    { key: 'category', label: t('columns.category'), render: (service) => service.category?.name || '-' },
    {
      key: 'basePrice',
      label: t('columns.price'),
      sortable: true,
      render: (service) => (
        <div className="flex flex-col">
          <span className="font-medium">{service.currency} {service.basePrice.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">{service.pricingModel}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: t('columns.status'),
      sortable: true,
      render: (service) => <Badge variant={statusColors[service.status] || 'default'}>{service.status}</Badge>,
    },
    { key: 'isFeatured', label: t('columns.featured'), render: (service) => (service.isFeatured ? '✓' : ''), className: 'text-center' },
    {
      key: 'updatedAt',
      label: t('columns.updated'),
      sortable: true,
      render: (service) => (service.updatedAt ? new Date(service.updatedAt).toLocaleDateString() : '-'),
    },
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: t('actions.deleteSelected'), icon: <Trash className="h-4 w-4 mr-2" />, onClick: onBulkDelete, variant: 'destructive' },
  ];

  const rowActions: DataTableRowAction<ServiceListDto>[] = [
    { label: t('actions.view'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: onView },
    { label: t('actions.edit'), icon: <Edit className="h-4 w-4 mr-2" />, onClick: onEdit },
    { label: t('actions.delete'), icon: <Trash className="h-4 w-4 mr-2" />, onClick: onDelete, variant: 'destructive' },
  ];

  return (
    <DataTable<ServiceListDto>
      data={data}
      columns={columns}
      keyExtractor={(service) => service.id}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchable
      searchPlaceholder={t('searchPlaceholder')}
      onSearch={onSearch}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      bulkActions={bulkActions}
      rowActions={rowActions}
      sortBy={sortBy}
      sortDescending={sortDescending}
      onSort={onSort}
      loading={loading}
      emptyMessage={t('empty.list')}
    />
  );
}
