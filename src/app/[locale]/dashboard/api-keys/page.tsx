'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
//
import { ApiKeyListSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { useConfirmDialog } from '@/components/shared/ConfirmDialog';
import { apiKeyService } from '@/services/apiKeyService';
import type { ApiKeyListDto, ApiKeyStatus, ApiKeyTier } from '@/types/apiKey';
import ApiKeysHeader from '@/components/api-keys/ApiKeysHeader';
import ApiKeysFilters from '@/components/api-keys/ApiKeysFilters';
import ApiKeysTable from '@/components/api-keys/ApiKeysTable';

// colors are handled in ApiKeysTable

export default function ApiKeysPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { toast } = useToast();
  const { confirm, dialog } = useConfirmDialog();
  const t = useTranslations('apiKeys');

  const [apiKeys, setApiKeys] = useState<ApiKeyListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    await confirm({
      title: 'Revoke API Key',
      description: `Are you sure you want to revoke "${apiKey.name}"? This will immediately stop all applications using this key.`,
      confirmText: 'Revoke',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
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
            description: error?.message || 'Failed to revoke API key',
            variant: 'destructive',
          });
          throw error;
        }
      },
    });
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

  const handleBulkDelete = async (ids: string[]) => {
    await confirm({
      title: 'Delete API Keys',
      description: `Are you sure you want to delete ${ids.length} API key(s)? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await Promise.all(ids.map(id => apiKeyService.deleteApiKey(id)));
          toast({
            title: 'Success',
            description: `${ids.length} API key(s) deleted successfully`,
          });
          setSelectedIds([]);
          loadApiKeys();
        } catch (error: any) {
          toast({
            title: 'Error',
            description: error?.message || 'Failed to delete API keys',
            variant: 'destructive',
          });
          throw error;
        }
      },
    });
  };

  const handleBulkRevoke = async (ids: string[]) => {
    await confirm({
      title: 'Revoke API Keys',
      description: `Are you sure you want to revoke ${ids.length} API key(s)? This will immediately stop all applications using these keys.`,
      confirmText: 'Revoke All',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await Promise.all(ids.map(id => apiKeyService.revokeApiKey(id)));
          toast({
            title: 'Success',
            description: `${ids.length} API key(s) revoked successfully`,
          });
          setSelectedIds([]);
          loadApiKeys();
        } catch (error: any) {
          toast({
            title: 'Error',
            description: error?.message || 'Failed to revoke API keys',
            variant: 'destructive',
          });
          throw error;
        }
      },
    });
  };

  // Table columns are encapsulated in ApiKeysTable

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

  // Bulk actions handled in ApiKeysTable via callbacks

  // Row actions handled in ApiKeysTable via callbacks

  // Show skeleton on initial load
  if (loading && apiKeys.length === 0 && totalCount === 0) {
    return (
      <div className="space-y-6">
        <ApiKeysHeader onAdd={() => router.push(`/${locale}/dashboard/api-keys/new`)} />
        <ApiKeyListSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApiKeysHeader onAdd={() => router.push(`/${locale}/dashboard/api-keys/new`)} />

      <ApiKeysFilters
        statusOptions={statusOptions}
        tierOptions={tierOptions}
        environmentOptions={environmentOptions}
        selectedStatuses={selectedStatuses}
        selectedTiers={selectedTiers}
        selectedEnvironments={selectedEnvironments}
        onStatusChange={handleStatusChange}
        onTierChange={handleTierChange}
        onEnvironmentChange={handleEnvironmentChange}
        onClearAll={() => {
          setSelectedStatuses([]);
          setSelectedTiers([]);
          setSelectedEnvironments([]);
          setCurrentPage(1);
        }}
      />

      <ApiKeysTable
        data={apiKeys}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onView={(apiKey) => router.push(`/${locale}/dashboard/api-keys/${apiKey.id}`)}
        onEdit={(apiKey) => router.push(`/${locale}/dashboard/api-keys/${apiKey.id}/edit`)}
        onRevoke={handleRevoke}
        onDelete={async (apiKey) => {
          await confirm({
            title: 'Delete API Key',
            description: `Are you sure you want to delete "${apiKey.name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'destructive',
            onConfirm: async () => {
              await handleDelete(apiKey.id);
            },
          });
        }}
        onBulkRevoke={handleBulkRevoke}
        onBulkDelete={handleBulkDelete}
      />
      {dialog}
    </div>
  );
}
