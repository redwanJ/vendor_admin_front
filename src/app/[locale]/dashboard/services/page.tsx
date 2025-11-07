'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { DataTable, DataTableColumn, DataTableFilter, DataTableBulkAction } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import { lookupService } from '@/services/lookupService';
import type { ServiceListDto, ServiceStatus, ServiceFilters } from '@/types/service';
import type { ServiceTypeLookup, CategoryLookup } from '@/types/service';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Draft: 'secondary',
  Active: 'default',
  Inactive: 'outline',
  Archived: 'destructive',
};

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();

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

  // Filter state
  const [filters, setFilters] = useState<ServiceFilters>({
    searchTerm: '',
    status: undefined,
    serviceTypeId: undefined,
    categoryId: undefined,
    sortBy: 'UpdatedAt',
    sortDescending: true,
  });

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
        ...filters,
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
  }, [currentPage, pageSize, filters, toast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Handlers
  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filterKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value || undefined,
    }));
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((column: string, descending: boolean) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortDescending: descending,
    }));
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

  // Table filters
  const tableFilters: DataTableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Archived', value: 'Archived' },
      ],
    },
    {
      key: 'serviceTypeId',
      label: 'Service Type',
      type: 'select',
      options: serviceTypes.map(st => ({ label: st.name, value: st.id })),
    },
    {
      key: 'categoryId',
      label: 'Category',
      type: 'select',
      options: categories.map(c => ({ label: c.name, value: c.id })),
    },
  ];

  // Bulk actions
  const bulkActions: DataTableBulkAction[] = [
    {
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: handleBulkDelete,
      variant: 'destructive',
    },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">
              Manage your services and offerings
            </p>
          </div>
          <Button onClick={() => router.push('/en/dashboard/services/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={services}
          columns={columns}
          keyExtractor={(service) => service.id}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          searchable
          searchPlaceholder="Search services..."
          onSearch={handleSearch}
          filters={tableFilters}
          onFilterChange={handleFilterChange}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          bulkActions={bulkActions}
          sortBy={filters.sortBy}
          sortDescending={filters.sortDescending}
          onSort={handleSort}
          loading={loading}
          emptyMessage="No services found. Create your first service to get started."
        />
    </div>
  );
}
