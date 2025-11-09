'use client';

import { Eye, Edit, Mail, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumn, DataTableRowAction } from '@/components/shared/DataTable';
import type { UserListDto } from '@/types/user';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Active: 'default',
  Inactive: 'secondary',
  Pending: 'outline',
  Suspended: 'destructive',
};

interface StaffTableProps {
  data: UserListDto[];
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
  onView: (user: UserListDto) => void;
  onEdit: (user: UserListDto) => void;
}

export default function StaffTable({
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
}: StaffTableProps) {
  const t = useTranslations('staff');

  const columns: DataTableColumn<UserListDto>[] = [
    {
      key: 'fullName',
      label: t('columns.name'),
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{user.fullName}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: t('columns.status'),
      sortable: true,
      render: (user) => (
        <Badge variant={statusColors[user.status] || 'default'}>{t(`status.${user.status}` as any)}</Badge>
      ),
    },
    {
      key: 'roleCount',
      label: t('columns.roles'),
      render: (user) => (
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {user.roleCount} {user.roleCount === 1 ? t('labels.role') : t('labels.roles')}
          </span>
        </div>
      ),
    },
    {
      key: 'lastLoginAt',
      label: t('columns.lastLogin'),
      sortable: true,
      render: (user) => user.lastLoginAt ? (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">{t('labels.neverLoggedIn')}</span>
      ),
    },
  ];

  const rowActions: DataTableRowAction<UserListDto>[] = [
    { label: t('actions.view'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: onView },
    { label: t('actions.edit'), icon: <Edit className="h-4 w-4 mr-2" />, onClick: onEdit },
  ];

  return (
    <DataTable<UserListDto>
      data={data}
      columns={columns}
      keyExtractor={(user) => user.id}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      rowActions={rowActions}
      loading={loading}
      emptyMessage={t('empty.list')}
    />
  );
}
