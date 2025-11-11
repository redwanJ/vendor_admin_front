import { api } from '@/lib/axios';
import type {
  ProductDto,
  ProductListDto,
  CreateProductDto,
  UpdateProductDto,
  PaginatedProductList,
  ProductFilters,
} from '@/types/product';

/**
 * Service for Product management operations
 */
export const productService = {
  /**
   * Get all products for the current vendor
   * Supports pagination and filtering
   */
  async getProducts(filters?: ProductFilters): Promise<PaginatedProductList> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get<PaginatedProductList>(
      `/vendor/products${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Get a specific product by ID
   */
  async getProductById(productId: string): Promise<ProductDto> {
    const response = await api.get<ProductDto>(`/vendor/products/${productId}`);
    return response.data;
  },

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDto): Promise<ProductDto> {
    const response = await api.post<ProductDto>('/vendor/products', data);
    return response.data;
  },

  /**
   * Update an existing product
   */
  async updateProduct(productId: string, data: UpdateProductDto): Promise<ProductDto> {
    const response = await api.put<ProductDto>(`/vendor/products/${productId}`, data);
    return response.data;
  },

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/vendor/products/${productId}`);
    return response.data;
  },
};
