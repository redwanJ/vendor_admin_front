import { api } from '@/lib/axios';
import type { ServiceTypeLookup, CategoryLookup } from '@/types/service';
import type { WarehouseLookup, LocationLookup, VariantLookup } from '@/types/lookups';
import type { CourierLookup } from '@/types/lookups';

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

  /**
   * Get warehouses lookup (tenant-scoped)
   */
  async getWarehouses(search?: string, limit: number = 20): Promise<WarehouseLookup[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', String(limit));
    const response = await api.get<WarehouseLookup[]>(`/lookups/warehouses?${params.toString()}`);
    return response.data;
  },

  /**
   * Get locations lookup (tenant-scoped), optionally filtered by warehouse
   */
  async getLocations(warehouseId?: string, search?: string, limit: number = 50): Promise<LocationLookup[]> {
    const params = new URLSearchParams();
    if (warehouseId) params.append('warehouseId', warehouseId);
    if (search) params.append('search', search);
    if (limit) params.append('limit', String(limit));
    const response = await api.get<LocationLookup[]>(`/lookups/locations?${params.toString()}`);
    return response.data;
  },

  /**
   * Get couriers lookup (global), supports search/limit
   */
  async getCouriers(search?: string, limit: number = 50): Promise<CourierLookup[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', String(limit));
    const response = await api.get<CourierLookup[]>(`/lookups/couriers?${params.toString()}`);
    return response.data;
  },

  /**
   * Get variants lookup (tenant-scoped), supports search by SKU, barcode, or product name
   */
  async getVariants(search?: string, limit: number = 50): Promise<VariantLookup[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', String(limit));
    const response = await api.get<VariantLookup[]>(`/lookups/variants?${params.toString()}`);
    return response.data;
  },
};
