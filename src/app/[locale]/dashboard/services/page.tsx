'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Eye, Edit, Trash } from 'lucide-react';
import { DataTable, DataTableColumn, DataTableFilter, DataTableBulkAction, DataTableRowAction } from '@/components/shared/DataTable';
import { MultiSelectFilter, MultiSelectFilterBadges } from '@/components/shared/MultiSelectFilter';
import ServicesHeader from '@/components/services/ServicesHeader';
import ServicesFilters from '@/components/services/ServicesFilters';
import ServicesTable from '@/components/services/ServicesTable';
import { ServiceListSkeleton } from '@/components/shared/ServiceSkeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import { lookupService } from '@/services/lookupService';
import type { ServiceListDto, ServiceStatus, ServiceFilters } from '@/types/service';
import type { ServiceTypeLookup, CategoryLookup } from '@/types/service';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Draft: 'secondary',
  PendingApproval: 'outline',
  Active: 'default',
  Inactive: 'outline',
  Archived: 'destructive',
};

export default function ServicesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { toast } = useToast();
  const t = useTranslations('services');

  const [services, setServices] = useState<ServiceListDto[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeLookup[]>([]);
  const [categories, setCategories] = useState<CategoryLookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state - using arrays for multi-select
  const [selectedStatuses, setSelectedStatuses] = useState<ServiceStatus[]>([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('UpdatedAt');
  const [sortDescending, setSortDescending] = useState(true);

  // Load lookups
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [serviceTypesData, categoriesData] = await Promise.all([
          lookupService.getServiceTypes(),
          lookupService.getCategories(),
        ]);
        setServiceTypes(serviceTypesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load lookups:', error);
      }
    };
    loadLookups();
  }, []);

  // Load services
  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const result = await serviceService.getServices({
        page: currentPage,
        pageSize,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        serviceTypeIds: selectedServiceTypes.length > 0 ? selectedServiceTypes : undefined,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        searchTerm: searchTerm || undefined,
        sortBy,
        sortDescending,
      });

      setServices(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedStatuses, selectedServiceTypes, selectedCategories, searchTerm, sortBy, sortDescending, toast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Filter handlers
  const handleStatusChange = useCallback((values: string[]) => {
    setSelectedStatuses(values as ServiceStatus[]);
    setCurrentPage(1);
  }, []);

  const handleServiceTypeChange = useCallback((values: string[]) => {
    setSelectedServiceTypes(values);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((values: string[]) => {
    setSelectedCategories(values);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((column: string, descending: boolean) => {
    setSortBy(column);
    setSortDescending(descending);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await serviceService.deleteService(id);
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
      loadServices();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete service',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await serviceService.bulkDeleteServices(ids);
      toast({
        title: 'Success',
        description: `${ids.length} service(s) deleted successfully`,
      });
      setSelectedIds([]);
      loadServices();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete services',
        variant: 'destructive',
      });
    }
  };

  // Table columns
  const columns: DataTableColumn<ServiceListDto>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (service) => (
        <div className="flex flex-col">
          <span className="font-medium">{service.name}</span>
          {service.shortDescription && (
            <span className="text-sm text-muted-foreground line-clamp-1">
              {service.shortDescription}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'serviceType',
      label: 'Type',
      render: (service) => service.serviceType.name,
    },
    {
      key: 'category',
      label: 'Category',
      render: (service) => service.category?.name || '-',
    },
    {
      key: 'basePrice',
      label: 'Price',
      sortable: true,
      render: (service) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {service.currency} {service.basePrice.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">{service.pricingModel}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (service) => (
        <Badge variant={statusColors[service.status] || 'default'}>
          {service.status}
        </Badge>
      ),
    },
    {
      key: 'isFeatured',
      label: 'Featured',
      render: (service) => (service.isFeatured ? '⭐' : ''),
      className: 'text-center',
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (service) => service.updatedAt
        ? new Date(service.updatedAt).toLocaleDateString()
        : '-',
    },
  ];

  // Filter options
  const statusOptions = [
    { label: 'Draft', value: 'Draft' },
    { label: 'Pending Approval', value: 'PendingApproval' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Archived', value: 'Archived' },
  ];

  const serviceTypeOptions = serviceTypes.map(st => ({ label: st.name, value: st.id }));
  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));

  // Bulk actions
  const bulkActions: DataTableBulkAction[] = [
    {
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: handleBulkDelete,
      variant: 'destructive',
    },
  ];

  // Row actions
  const rowActions: DataTableRowAction<ServiceListDto>[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (service) => router.push(`/${locale}/dashboard/services/${service.id}`),
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: (service) => router.push(`/${locale}/dashboard/services/${service.id}/edit`),
    },
    {
      label: 'Delete',
      icon: <Trash className="h-4 w-4 mr-2" />,
      onClick: async (service) => {
        if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
          await handleDelete(service.id);
        }
      },
      variant: 'destructive',
    },
  ];

  // Show skeleton on initial load
  if (loading && services.length === 0 && totalCount === 0) {
    return (
      <div className="space-y-6">
        <ServicesHeader onAdd={() => router.push(`/${locale}/dashboard/services/new`)} />

        <ServiceListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServicesHeader onAdd={() => router.push(`/${locale}/dashboard/services/new`)} />

      <ServicesFilters
        statusOptions={statusOptions}
        serviceTypeOptions={serviceTypeOptions}
        categoryOptions={categoryOptions}
        selectedStatuses={selectedStatuses}
        selectedServiceTypes={selectedServiceTypes}
        selectedCategories={selectedCategories}
        onStatusChange={handleStatusChange}
        onServiceTypeChange={handleServiceTypeChange}
        onCategoryChange={handleCategoryChange}
        onClearAll={() => {
          setSelectedStatuses([]);
          setSelectedServiceTypes([]);
          setSelectedCategories([]);
          setCurrentPage(1);
        }}
      />

      <ServicesTable
        data={services}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortBy={sortBy}
        sortDescending={sortDescending}
        onSort={handleSort}
        onSearch={handleSearch}
        onView={(service) => router.push(`/${locale}/dashboard/services/${service.id}`)}
        onEdit={(service) => router.push(`/${locale}/dashboard/services/${service.id}/edit`)}
        onDelete={async (service) => {
          if (confirm(t('confirm.delete', { name: service.name }))) {
            await handleDelete(service.id);
          }
        }}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
}
