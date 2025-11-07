import { api } from '@/lib/axios';
import type { ServiceTypeLookup, CategoryLookup } from '@/types/service';

export const lookupService = {
  /**
   * Get service types for lookup/dropdown
   */
  async getServiceTypes(search?: string): Promise<ServiceTypeLookup[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const response = await api.get<ServiceTypeLookup[]>(`/lookups/service-types?${params.toString()}`);
    return response.data;
  },

  /**
   * Get categories for lookup/dropdown
   */
  async getCategories(search?: string): Promise<CategoryLookup[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const response = await api.get<CategoryLookup[]>(`/lookups/categories?${params.toString()}`);
    return response.data;
  },
};
