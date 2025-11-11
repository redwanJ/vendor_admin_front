import { api } from '@/lib/axios';
import type {
  VariantDto,
  CreateVariantDto,
  UpdateVariantDto,
  VariantFilters,
} from '@/types/variant';

/**
 * Service for Variant management operations
 */
export const variantService = {
  /**
   * Get a specific variant by ID
   */
  async getVariantById(variantId: string): Promise<VariantDto> {
    const response = await api.get<VariantDto>(`/vendor/variants/${variantId}`);
    return response.data;
  },

  /**
   * Get all variants for a specific product
   */
  async getVariantsByProduct(productId: string): Promise<VariantDto[]> {
    const response = await api.get<VariantDto[]>(`/vendor/products/${productId}/variants`);
    return response.data;
  },

  /**
   * Create a new variant
   */
  async createVariant(data: CreateVariantDto): Promise<VariantDto> {
    const response = await api.post<VariantDto>('/vendor/variants', data);
    return response.data;
  },

  /**
   * Update an existing variant
   */
  async updateVariant(variantId: string, data: UpdateVariantDto): Promise<VariantDto> {
    const response = await api.put<VariantDto>(`/vendor/variants/${variantId}`, data);
    return response.data;
  },

  /**
   * Delete a variant
   */
  async deleteVariant(variantId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/vendor/variants/${variantId}`);
    return response.data;
  },
};
