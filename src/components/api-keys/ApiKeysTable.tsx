'use client';

import { Eye, Edit, Ban, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableBulkAction, DataTableColumn, DataTableRowAction } from '@/components/shared/DataTable';
import type { ApiKeyListDto } from '@/types/apiKey';
import { useTranslations } from 'next-intl';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Active: 'default',
  Revoked: 'destructive',
  Expired: 'secondary',
  Suspended: 'outline',
};

const tierColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Public: 'secondary',
  Basic: 'default',
  Premium: 'default',
};

interface ApiKeysTableProps {
  data: ApiKeyListDto[];
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
  onView: (apiKey: ApiKeyListDto) => void;
  onEdit: (apiKey: ApiKeyListDto) => void;
  onRevoke: (apiKey: ApiKeyListDto) => void;
  onDelete: (apiKey: ApiKeyListDto) => void;
  onBulkRevoke: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
}

export default function ApiKeysTable({
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
  onRevoke,
  onDelete,
  onBulkRevoke,
  onBulkDelete,
}: ApiKeysTableProps) {
  const t = useTranslations('apiKeys');
  const columns: DataTableColumn<ApiKeyListDto>[] = [
    {
      key: 'name',
      label: t('columns.name'),
      sortable: true,
      render: (apiKey) => (
        <div className="flex flex-col">
          <span className="font-medium">{apiKey.name}</span>
          <span className="text-xs text-muted-foreground font-mono">{apiKey.keyPrefix}...</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: t('columns.status'),
      sortable: true,
      render: (apiKey) => (
        <Badge variant={statusColors[apiKey.status] || 'default'}>{apiKey.status}</Badge>
      ),
    },
    {
      key: 'tier',
      label: t('columns.tier'),
      render: (apiKey) => <Badge variant={tierColors[apiKey.tier] || 'default'}>{apiKey.tier}</Badge>,
    },
    {
      key: 'environment',
      label: t('columns.environment'),
      render: (apiKey) => <span className="text-sm">{apiKey.environment}</span>,
    },
    {
      key: 'lastUsedAt',
      label: t('columns.lastUsed'),
      render: (apiKey) => (apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleDateString() : 'Never'),
    },
    {
      key: 'createdAt',
      label: t('columns.created'),
      sortable: true,
      render: (apiKey) => new Date(apiKey.createdAt).toLocaleDateString(),
    },
  ];

  const bulkActions: DataTableBulkAction[] = [
    { label: t('actions.revokeSelected'), icon: <Ban className="h-4 w-4 mr-2" />, onClick: onBulkRevoke, variant: 'destructive' },
    { label: t('actions.deleteSelected'), icon: <Trash2 className="h-4 w-4 mr-2" />, onClick: onBulkDelete, variant: 'destructive' },
  ];

  const rowActions: DataTableRowAction<ApiKeyListDto>[] = [
    { label: t('actions.view'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: onView },
    { label: t('actions.edit'), icon: <Edit className="h-4 w-4 mr-2" />, onClick: onEdit },
    { label: t('actions.revoke'), icon: <Ban className="h-4 w-4 mr-2" />, onClick: onRevoke, variant: 'destructive' },
    { label: t('actions.delete'), icon: <Trash2 className="h-4 w-4 mr-2" />, onClick: onDelete, variant: 'destructive' },
  ];

  return (
    <DataTable<ApiKeyListDto>
      data={data}
      columns={columns}
      keyExtractor={(apiKey) => apiKey.id}
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
