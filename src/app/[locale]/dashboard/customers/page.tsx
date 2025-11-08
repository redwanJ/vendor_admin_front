'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { useConfirmDialog } from '@/components/shared/ConfirmDialog';
import { customerService } from '@/services/customerService';
import type { CustomerListDto, CustomerType, CustomerStatus } from '@/types/customer';
import CustomersHeader from '@/components/customers/CustomersHeader';
import CustomersFilters from '@/components/customers/CustomersFilters';
import CustomersTable from '@/components/customers/CustomersTable';

export default function CustomersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { toast } = useToast();
  const { confirm, dialog } = useConfirmDialog();
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');

  const [customers, setCustomers] = useState<CustomerListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state - using arrays for multi-select
  const [selectedCustomerTypes, setSelectedCustomerTypes] = useState<CustomerType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<CustomerStatus[]>([]);

  // Load customers
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await customerService.getCustomers({
        customerTypes: selectedCustomerTypes.length > 0 ? selectedCustomerTypes : undefined,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        page: currentPage,
        pageSize,
      });

      setCustomers(result.items);
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
  }, [currentPage, pageSize, selectedCustomerTypes, selectedStatuses, toast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Filter handlers
  const handleCustomerTypeChange = useCallback((values: string[]) => {
    setSelectedCustomerTypes(values as CustomerType[]);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((values: string[]) => {
    setSelectedStatuses(values as CustomerStatus[]);
    setCurrentPage(1);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await customerService.deleteCustomer(id);
      toast({
        title: tCommon('messages.success'),
        description: t('toasts.deleteSuccess'),
      });
      loadCustomers();
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description:
          error.response?.data?.error || t('toasts.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    await confirm({
      title: t('confirm.bulkDeleteTitle'),
      description: t('confirm.bulkDelete', { count: ids.length }),
      confirmText: t('actions.deleteSelected'),
      cancelText: tCommon('actions.cancel'),
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await Promise.all(ids.map(id => customerService.deleteCustomer(id)));
          toast({
            title: tCommon('messages.success'),
            description: t('toasts.bulkDeleteSuccess', { count: ids.length }),
          });
          setSelectedIds([]);
          loadCustomers();
        } catch (error: any) {
          toast({
            title: tCommon('messages.error'),
            description: error?.message || t('toasts.bulkDeleteError'),
            variant: 'destructive',
          });
          throw error;
        }
      },
    });
  };

  // Filter options
  const customerTypeOptions = [
    { label: t('types.Individual'), value: 'Individual' },
    { label: t('types.Business'), value: 'Business' },
    { label: t('types.EventPlanner'), value: 'EventPlanner' },
  ];

  const statusOptions = [
    { label: t('status.Active'), value: 'Active' },
    { label: t('status.Inactive'), value: 'Inactive' },
    { label: t('status.Blocked'), value: 'Blocked' },
    { label: t('status.Archived'), value: 'Archived' },
  ];

  // Show skeleton on initial load
  if (loading && customers.length === 0 && totalCount === 0) {
    return (
      <div className="space-y-6">
        <CustomersHeader onAdd={() => router.push(`/${locale}/dashboard/customers/new`)} />
        <ApiKeyListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CustomersHeader onAdd={() => router.push(`/${locale}/dashboard/customers/new`)} />

      <CustomersFilters
        customerTypeOptions={customerTypeOptions}
        statusOptions={statusOptions}
        selectedCustomerTypes={selectedCustomerTypes}
        selectedStatuses={selectedStatuses}
        onCustomerTypeChange={handleCustomerTypeChange}
        onStatusChange={handleStatusChange}
        onClearAll={() => {
          setSelectedCustomerTypes([]);
          setSelectedStatuses([]);
          setCurrentPage(1);
        }}
      />

      <CustomersTable
        data={customers}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={(customer) => router.push(`/${locale}/dashboard/customers/${customer.id}`)}
        onEdit={(customer) => router.push(`/${locale}/dashboard/customers/${customer.id}/edit`)}
        onDelete={async (customer) => {
          await confirm({
            title: t('confirm.deleteTitle'),
            description: t('confirm.delete', { name: customer.fullName }),
            confirmText: tCommon('actions.delete'),
            cancelText: tCommon('actions.cancel'),
            variant: 'destructive',
            onConfirm: async () => {
              await handleDelete(customer.id);
            },
          });
        }}
        onBulkDelete={handleBulkDelete}
      />
      {dialog}
    </div>
  );
}
