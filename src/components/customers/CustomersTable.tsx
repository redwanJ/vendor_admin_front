'use client';

import { Eye, Edit, Trash2, Mail, Phone, Building, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableBulkAction, DataTableColumn, DataTableRowAction } from '@/components/shared/DataTable';
import type { CustomerListDto } from '@/types/customer';
import { useTranslations } from 'next-intl';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Active: 'default',
  Inactive: 'secondary',
  Blocked: 'destructive',
  Archived: 'outline',
};

const customerTypeIcons: Record<string, any> = {
  Individual: User,
  Business: Building,
  EventPlanner: User,
};

interface CustomersTableProps {
  data: CustomerListDto[];
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
  onView: (customer: CustomerListDto) => void;
  onEdit: (customer: CustomerListDto) => void;
  onDelete: (customer: CustomerListDto) => void;
  onBulkDelete: (ids: string[]) => void;
}

export default function CustomersTable({
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
}: CustomersTableProps) {
  const t = useTranslations('customers');

  const columns: DataTableColumn<CustomerListDto>[] = [
    {
      key: 'fullName',
      label: t('columns.name'),
      sortable: true,
      render: (customer) => {
        const Icon = customerTypeIcons[customer.customerType] || User;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">{customer.fullName}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {customer.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phoneNumber',
      label: t('columns.phone'),
      render: (customer) => customer.phoneNumber ? (
        <span className="text-sm flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {customer.phoneNumber}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      ),
    },
    {
      key: 'customerType',
      label: t('columns.type'),
      render: (customer) => (
        <Badge variant="outline">{t(`types.${customer.customerType}` as any)}</Badge>
      ),
    },
    {
      key: 'status',
      label: t('columns.status'),
      sortable: true,
      render: (customer) => (
        <Badge variant={statusColors[customer.status] || 'default'}>{t(`status.${customer.status}` as any)}</Badge>
      ),
    },
    {
      key: 'tags',
      label: t('columns.tags'),
      render: (customer) => customer.tags && customer.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {customer.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {customer.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{customer.tags.length - 2}
            </Badge>
          )}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      ),
    },
    {
      key: 'createdAt',
      label: t('columns.created'),
      sortable: true,
      render: (customer) => new Date(customer.createdAt).toLocaleDateString(),
    },
  ];

  const bulkActions: DataTableBulkAction[] = [
    {
      label: t('actions.deleteSelected'),
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: onBulkDelete,
      variant: 'destructive'
    },
  ];

  const rowActions: DataTableRowAction<CustomerListDto>[] = [
    { label: t('actions.view'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: onView },
    { label: t('actions.edit'), icon: <Edit className="h-4 w-4 mr-2" />, onClick: onEdit },
    { label: t('actions.delete'), icon: <Trash2 className="h-4 w-4 mr-2" />, onClick: onDelete, variant: 'destructive' },
  ];

  return (
    <DataTable<CustomerListDto>
      data={data}
      columns={columns}
      keyExtractor={(customer) => customer.id}
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
