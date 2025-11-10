'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { useConfirmDialog } from '@/components/shared/ConfirmDialog';
import { bookingService } from '@/services/bookingService';
import type { BookingListDto, BookingStatus, PaymentStatus } from '@/types/booking';
import BookingsHeader from '@/components/bookings/BookingsHeader';
import BookingsFilters from '@/components/bookings/BookingsFilters';
import BookingsTable from '@/components/bookings/BookingsTable';

export default function BookingsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { toast } = useToast();
  const { confirm, dialog } = useConfirmDialog();
  const t = useTranslations('bookings');
  const tCommon = useTranslations('common');

  const [bookings, setBookings] = useState<BookingListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state - using arrays for multi-select
  const [selectedStatuses, setSelectedStatuses] = useState<BookingStatus[]>([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<PaymentStatus[]>([]);

  // Load bookings
  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const result = await bookingService.getBookings({
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        paymentStatuses: selectedPaymentStatuses.length > 0 ? selectedPaymentStatuses : undefined,
        page: currentPage,
        pageSize,
      });

      setBookings(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description:
          error.response?.data?.error || t('toasts.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedStatuses, selectedPaymentStatuses, toast]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Filter handlers
  const handleStatusChange = useCallback((values: string[]) => {
    setSelectedStatuses(values as BookingStatus[]);
    setCurrentPage(1);
  }, []);

  const handlePaymentStatusChange = useCallback((values: string[]) => {
    setSelectedPaymentStatuses(values as PaymentStatus[]);
    setCurrentPage(1);
  }, []);

  const handleCancel = async (id: string, reason: string) => {
    try {
      await bookingService.cancelBooking(id, { reason });
      toast({
        title: tCommon('messages.success'),
        description: t('toasts.cancelSuccess'),
      });
      loadBookings();
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description:
          error.response?.data?.error || t('toasts.cancelError'),
        variant: 'destructive',
      });
    }
  };

  const handleBulkCancel = async (ids: string[]) => {
    await confirm({
      title: t('confirm.bulkCancelTitle'),
      description: t('confirm.bulkCancel', { count: ids.length }),
      confirmText: t('actions.cancelSelected'),
      cancelText: tCommon('actions.cancel'),
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await Promise.all(ids.map(id => bookingService.cancelBooking(id, { reason: 'Bulk cancellation' })));
          toast({
            title: tCommon('messages.success'),
            description: t('toasts.bulkCancelSuccess', { count: ids.length }),
          });
          setSelectedIds([]);
          loadBookings();
        } catch (error: any) {
          toast({
            title: tCommon('messages.error'),
            description: error?.message || t('toasts.bulkCancelError'),
            variant: 'destructive',
          });
          throw error;
        }
      },
    });
  };

  const handleConfirmPayment = async (booking: BookingListDto) => {
    // TODO: Open payment confirmation dialog
    // For now, just navigate to booking detail where payment can be confirmed
    router.push(`/${locale}/dashboard/bookings/${booking.id}`);
  };

  // Filter options
  const statusOptions = [
    { label: t('status.Draft'), value: 'Draft' },
    { label: t('status.PendingPayment'), value: 'PendingPayment' },
    { label: t('status.Confirmed'), value: 'Confirmed' },
    { label: t('status.InProgress'), value: 'InProgress' },
    { label: t('status.Completed'), value: 'Completed' },
    { label: t('status.Cancelled'), value: 'Cancelled' },
    { label: t('status.NoShow'), value: 'NoShow' },
  ];

  const paymentStatusOptions = [
    { label: t('paymentStatus.Pending'), value: 'Pending' },
    { label: t('paymentStatus.PartiallyPaid'), value: 'PartiallyPaid' },
    { label: t('paymentStatus.Paid'), value: 'Paid' },
    { label: t('paymentStatus.Refunded'), value: 'Refunded' },
    { label: t('paymentStatus.Failed'), value: 'Failed' },
  ];

  // Show skeleton on initial load
  if (loading && bookings.length === 0 && totalCount === 0) {
    return (
      <div className="space-y-6">
        <BookingsHeader onAdd={() => router.push(`/${locale}/dashboard/bookings/new`)} />
        <ApiKeyListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BookingsHeader onAdd={() => router.push(`/${locale}/dashboard/bookings/new`)} />

      <BookingsFilters
        statusOptions={statusOptions}
        paymentStatusOptions={paymentStatusOptions}
        selectedStatuses={selectedStatuses}
        selectedPaymentStatuses={selectedPaymentStatuses}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        onClearAll={() => {
          setSelectedStatuses([]);
          setSelectedPaymentStatuses([]);
          setCurrentPage(1);
        }}
      />

      <BookingsTable
        data={bookings}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={(booking) => router.push(`/${locale}/dashboard/bookings/${booking.id}`)}
        onEdit={(booking) => router.push(`/${locale}/dashboard/bookings/${booking.id}/edit`)}
        onCancel={async (booking) => {
          await confirm({
            title: t('confirm.cancelTitle'),
            description: t('confirm.cancel', { number: booking.bookingNumber }),
            confirmText: t('actions.cancel'),
            cancelText: tCommon('actions.goBack'),
            variant: 'destructive',
            onConfirm: async () => {
              await handleCancel(booking.id, 'Cancelled by user');
            },
          });
        }}
        onConfirmPayment={handleConfirmPayment}
        onBulkCancel={handleBulkCancel}
      />
      {dialog}
    </div>
  );
}
