/**
 * Product Status
 */
export type ProductStatus = 'Draft' | 'Active' | 'Inactive' | 'Archived';

/**
 * Product DTO for detailed read operations
 */
export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  categoryId?: string;
  description?: string;
  attributes: string; // JSON string
  images: string; // JSON string (array)
  tags: string; // Comma-separated or string
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Product List Item DTO (for list views)
 */
export interface ProductListDto {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  tags: string;
}

/**
 * Create Product DTO
 */
export interface CreateProductDto {
  name: string;
  slug?: string;
  categoryId?: string;
  description?: string;
  attributesJson?: string;
  imagesJson?: string;
  tags?: string;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Update Product DTO
 */
export interface UpdateProductDto {
  name: string;
  slug: string;
  categoryId?: string;
  description?: string;
  attributesJson?: string;
  imagesJson?: string;
  tags?: string;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Paginated Product List Response
 */
export interface PaginatedProductList {
  items: ProductListDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Product Filters
 */
export interface ProductFilters {
  statuses?: ProductStatus[];
  search?: string;
  page?: number;
  pageSize?: number;
}
