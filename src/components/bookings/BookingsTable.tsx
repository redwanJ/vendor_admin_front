'use client';

import { Eye, Edit, Trash2, CreditCard, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableBulkAction, DataTableColumn, DataTableRowAction } from '@/components/shared/DataTable';
import type { BookingListDto, BookingStatus, PaymentStatus } from '@/types/booking';
import { useTranslations } from 'next-intl';

const statusColors: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Draft: 'outline',
  PendingPayment: 'secondary',
  Confirmed: 'default',
  InProgress: 'default',
  Completed: 'default',
  Cancelled: 'destructive',
  NoShow: 'destructive',
};

const paymentStatusColors: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Pending: 'outline',
  PartiallyPaid: 'secondary',
  Paid: 'default',
  Refunded: 'secondary',
  Failed: 'destructive',
};

interface BookingsTableProps {
  data: BookingListDto[];
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
  onView: (booking: BookingListDto) => void;
  onEdit: (booking: BookingListDto) => void;
  onCancel: (booking: BookingListDto) => void;
  onConfirmPayment: (booking: BookingListDto) => void;
  onBulkCancel: (ids: string[]) => void;
}

export default function BookingsTable({
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
  onCancel,
  onConfirmPayment,
  onBulkCancel,
}: BookingsTableProps) {
  const t = useTranslations('bookings');

  const columns: DataTableColumn<BookingListDto>[] = [
    {
      key: 'bookingNumber',
      label: t('columns.bookingNumber'),
      sortable: true,
      render: (booking) => (
        <span className="font-mono font-medium">{booking.bookingNumber}</span>
      ),
    },
    {
      key: 'customerName',
      label: t('columns.customer'),
      sortable: true,
      render: (booking) => (
        <div className="flex flex-col">
          <span className="font-medium">{booking.customerName}</span>
          <span className="text-xs text-muted-foreground">{booking.customerEmail}</span>
        </div>
      ),
    },
    {
      key: 'eventDate',
      label: t('columns.eventDate'),
      sortable: true,
      render: (booking) => booking.eventDate ? (
        new Date(booking.eventDate).toLocaleDateString()
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      ),
    },
    {
      key: 'itemCount',
      label: t('columns.items'),
      render: (booking) => (
        <Badge variant="outline">{booking.itemCount}</Badge>
      ),
    },
    {
      key: 'status',
      label: t('columns.status'),
      sortable: true,
      render: (booking) => (
        <Badge variant={statusColors[booking.status]}>{t(`status.${booking.status}` as any)}</Badge>
      ),
    },
    {
      key: 'paymentStatus',
      label: t('columns.paymentStatus'),
      sortable: true,
      render: (booking) => (
        <Badge variant={paymentStatusColors[booking.paymentStatus]}>{t(`paymentStatus.${booking.paymentStatus}` as any)}</Badge>
      ),
    },
    {
      key: 'totalAmount',
      label: t('columns.total'),
      sortable: true,
      render: (booking) => (
        <div className="flex flex-col">
          <span className="font-medium">${booking.totalAmount.toFixed(2)}</span>
          {booking.paidAmount > 0 && (
            <span className="text-xs text-muted-foreground">
              ${booking.paidAmount.toFixed(2)} {t('paid')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: t('columns.created'),
      sortable: true,
      render: (booking) => new Date(booking.createdAt).toLocaleDateString(),
    },
  ];

  const bulkActions: DataTableBulkAction[] = [
    {
      label: t('actions.cancelSelected'),
      icon: <XCircle className="h-4 w-4 mr-2" />,
      onClick: onBulkCancel,
      variant: 'destructive'
    },
  ];

  const rowActions: DataTableRowAction<BookingListDto>[] = [
    { label: t('actions.view'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: onView },
    {
      label: t('actions.confirmPayment'),
      icon: <CreditCard className="h-4 w-4 mr-2" />,
      onClick: onConfirmPayment,
    },
    {
      label: t('actions.cancel'),
      icon: <XCircle className="h-4 w-4 mr-2" />,
      onClick: onCancel,
      variant: 'destructive',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      // Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      // Selection
      selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      // Actions
      rowActions={rowActions}
      bulkActions={bulkActions}
      // Row ID
      keyExtractor={(booking) => booking.id}
    />
  );
}
