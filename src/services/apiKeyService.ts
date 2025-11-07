import { api } from '@/lib/axios';
import type {
  ApiKeyDto,
  ApiKeyListDto,
  CreateApiKeyDto,
  UpdateApiKeyDto,
  ApiKeyCreatedDto,
  PaginatedApiKeyList,
  ApiKeyFilters,
} from '@/types/apiKey';

/**
 * Service for API Key management operations
 */
export const apiKeyService = {
  /**
   * Get all API keys for the current vendor
   * Supports multi-select filtering
   */
  async getApiKeys(filters?: ApiKeyFilters): Promise<PaginatedApiKeyList> {
    const params = new URLSearchParams();

    // Multi-select filters - append multiple values
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }
    if (filters?.tiers && filters.tiers.length > 0) {
      filters.tiers.forEach(tier => params.append('tiers', tier));
    }
    if (filters?.environments && filters.environments.length > 0) {
      filters.environments.forEach(env => params.append('environments', env));
    }

    if (filters?.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get<PaginatedApiKeyList>(
      `/vendor/api-keys${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Get a specific API key by ID
   */
  async getApiKeyById(apiKeyId: string): Promise<ApiKeyDto> {
    const response = await api.get<ApiKeyDto>(`/vendor/api-keys/${apiKeyId}`);
    return response.data;
  },

  /**
   * Create a new API key
   * WARNING: The plain-text key is only returned once!
   */
  async createApiKey(data: CreateApiKeyDto): Promise<ApiKeyCreatedDto> {
    const response = await api.post<ApiKeyCreatedDto>('/vendor/api-keys', data);
    return response.data;
  },

  /**
   * Update an existing API key
   */
  async updateApiKey(apiKeyId: string, data: UpdateApiKeyDto): Promise<ApiKeyDto> {
    const response = await api.put<ApiKeyDto>(`/vendor/api-keys/${apiKeyId}`, data);
    return response.data;
  },

  /**
   * Revoke an API key
   */
  async revokeApiKey(apiKeyId: string): Promise<void> {
    await api.post(`/vendor/api-keys/${apiKeyId}/revoke`);
  },

  /**
   * Delete an API key
   */
  async deleteApiKey(apiKeyId: string): Promise<void> {
    await api.delete(`/vendor/api-keys/${apiKeyId}`);
  },
};
