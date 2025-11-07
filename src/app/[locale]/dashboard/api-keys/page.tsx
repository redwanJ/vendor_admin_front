'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, Eye, Edit, XCircle, Ban } from 'lucide-react';
import { DataTable, DataTableColumn, DataTableFilter, DataTableBulkAction, DataTableRowAction } from '@/components/shared/DataTable';
import { MultiSelectFilter, MultiSelectFilterBadges } from '@/components/shared/MultiSelectFilter';
import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiKeyService } from '@/services/apiKeyService';
import type { ApiKeyListDto, ApiKeyStatus, ApiKeyTier, ApiKeyFilters } from '@/types/apiKey';

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

export default function ApiKeysPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { toast } = useToast();

  const [apiKeys, setApiKeys] = useState<ApiKeyListDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state - using arrays for multi-select
  const [selectedStatuses, setSelectedStatuses] = useState<ApiKeyStatus[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<ApiKeyTier[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);

  // Load API keys
  const loadApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiKeyService.getApiKeys({
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        tiers: selectedTiers.length > 0 ? selectedTiers : undefined,
        environments: selectedEnvironments.length > 0 ? selectedEnvironments : undefined,
        pageNumber: currentPage,
        pageSize,
      });

      setApiKeys(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedStatuses, selectedTiers, selectedEnvironments, toast]);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  // Filter handlers
  const handleStatusChange = useCallback((values: string[]) => {
    setSelectedStatuses(values as ApiKeyStatus[]);
    setCurrentPage(1);
  }, []);

  const handleTierChange = useCallback((values: string[]) => {
    setSelectedTiers(values as ApiKeyTier[]);
    setCurrentPage(1);
  }, []);

  const handleEnvironmentChange = useCallback((values: string[]) => {
    setSelectedEnvironments(values);
    setCurrentPage(1);
  }, []);

  const handleRevoke = async (apiKey: ApiKeyListDto) => {
    if (!confirm(`Are you sure you want to revoke "${apiKey.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiKeyService.revokeApiKey(apiKey.id);
      toast({
        title: 'Success',
        description: 'API key revoked successfully',
      });
      loadApiKeys();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to revoke API key',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiKeyService.deleteApiKey(id);
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
      loadApiKeys();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  // Table columns
  const columns: DataTableColumn<ApiKeyListDto>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (apiKey) => (
        <div className="flex flex-col">
          <span className="font-medium">{apiKey.name}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {apiKey.keyPrefix}...
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (apiKey) => (
        <Badge variant={statusColors[apiKey.status] || 'default'}>
          {apiKey.status}
        </Badge>
      ),
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (apiKey) => (
        <Badge variant={tierColors[apiKey.tier] || 'default'}>
          {apiKey.tier}
        </Badge>
      ),
    },
    {
      key: 'environment',
      label: 'Environment',
      render: (apiKey) => (
        <span className="text-sm">{apiKey.environment}</span>
      ),
    },
    {
      key: 'lastUsedAt',
      label: 'Last Used',
      render: (apiKey) => apiKey.lastUsedAt
        ? new Date(apiKey.lastUsedAt).toLocaleDateString()
        : 'Never',
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (apiKey) => new Date(apiKey.createdAt).toLocaleDateString(),
    },
  ];

  // Filter options
  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Revoked', value: 'Revoked' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Suspended', value: 'Suspended' },
  ];

  const tierOptions = [
    { label: 'Public', value: 'Public' },
    { label: 'Basic', value: 'Basic' },
    { label: 'Premium', value: 'Premium' },
  ];

  const environmentOptions = [
    { label: 'Production', value: 'production' },
    { label: 'Staging', value: 'staging' },
    { label: 'Development', value: 'development' },
  ];

  // Row actions
  const rowActions: DataTableRowAction<ApiKeyListDto>[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (apiKey) => router.push(`/${locale}/dashboard/api-keys/${apiKey.id}`),
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: (apiKey) => router.push(`/${locale}/dashboard/api-keys/${apiKey.id}/edit`),
    },
    {
      label: 'Revoke',
      icon: <Ban className="h-4 w-4 mr-2" />,
      onClick: handleRevoke,
      variant: 'destructive',
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: async (apiKey) => {
        if (confirm(`Are you sure you want to delete "${apiKey.name}"?`)) {
          await handleDelete(apiKey.id);
        }
      },
      variant: 'destructive',
    },
  ];

  // Show skeleton on initial load
  if (loading && apiKeys.length === 0 && totalCount === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">
              Manage API keys for accessing your services programmatically
            </p>
          </div>
          <Button onClick={() => router.push(`/${locale}/dashboard/api-keys/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>

        <ApiKeyListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for accessing your services programmatically
          </p>
        </div>
        <Button onClick={() => router.push(`/${locale}/dashboard/api-keys/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Multi-Select Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <MultiSelectFilter
          label="Status"
          options={statusOptions}
          selectedValues={selectedStatuses}
          onChange={handleStatusChange}
          placeholder="All Statuses"
        />
        <MultiSelectFilter
          label="Tier"
          options={tierOptions}
          selectedValues={selectedTiers}
          onChange={handleTierChange}
          placeholder="All Tiers"
        />
        <MultiSelectFilter
          label="Environment"
          options={environmentOptions}
          selectedValues={selectedEnvironments}
          onChange={handleEnvironmentChange}
          placeholder="All Environments"
        />
      </div>

      {/* Active Filters Display */}
      {(selectedStatuses.length > 0 || selectedTiers.length > 0 || selectedEnvironments.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <MultiSelectFilterBadges
            selectedValues={selectedStatuses}
            options={statusOptions}
            onRemove={(value) => handleStatusChange(selectedStatuses.filter(v => v !== value))}
          />
          <MultiSelectFilterBadges
            selectedValues={selectedTiers}
            options={tierOptions}
            onRemove={(value) => handleTierChange(selectedTiers.filter(v => v !== value))}
          />
          <MultiSelectFilterBadges
            selectedValues={selectedEnvironments}
            options={environmentOptions}
            onRemove={(value) => handleEnvironmentChange(selectedEnvironments.filter(v => v !== value))}
          />
          {(selectedStatuses.length > 0 || selectedTiers.length > 0 || selectedEnvironments.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStatuses([]);
                setSelectedTiers([]);
                setSelectedEnvironments([]);
                setCurrentPage(1);
              }}
              className="h-7"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={apiKeys}
        columns={columns}
        keyExtractor={(apiKey) => apiKey.id}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        rowActions={rowActions}
        loading={loading}
        emptyMessage="No API keys found. Create your first API key to get started."
      />
    </div>
  );
}
