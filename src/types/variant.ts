/**
 * Variant DTO for read operations
 */
export interface VariantDto {
  id: string;
  productId: string;
  sku: string;
  barcode?: string;
  options: string; // JSON string
  price: number;
  currency: string;
  cost?: number;
  costCurrency?: string;
  trackInventory: boolean;
  isActive: boolean;
}

/**
 * Create Variant DTO
 */
export interface CreateVariantDto {
  productId: string;
  sku: string;
  price: number;
  currency?: string;
  barcode?: string;
  optionsJson?: string;
  cost?: number;
  costCurrency?: string;
  trackInventory?: boolean;
}

/**
 * Update Variant DTO
 */
export interface UpdateVariantDto {
  sku: string;
  barcode?: string;
  optionsJson?: string;
  price: number;
  currency?: string;
  cost?: number;
  costCurrency?: string;
  trackInventory?: boolean;
  isActive?: boolean;
}

/**
 * Variant Filters
 */
export interface VariantFilters {
  productId?: string;
  searchTerm?: string;
  isActive?: boolean;
}
