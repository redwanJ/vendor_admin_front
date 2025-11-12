/**
 * Stock by Location DTO
 */
export interface StockByLocationDto {
  locationId: string;
  locationCode: string;
  locationType?: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
}

/**
 * Stock Movement Type
 */
export type StockMovementType = 'Adjust' | 'Receive' | 'Ship' | 'Transfer' | 'Reserve' | 'Release';

/**
 * Stock Movement DTO
 */
export interface StockMovementDto {
  id: string;
  variantId: string;
  fromLocationId?: string;
  toLocationId?: string;
  quantity: number;
  type: StockMovementType;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  performedAt: string;
}

/**
 * Adjust Stock DTO
 */
export interface AdjustStockDto {
  variantId: string;
  locationId: string;
  quantityDelta: number;
  reason?: string;
}

/**
 * Receive Stock DTO
 */
export interface ReceiveStockDto {
  variantId: string;
  toLocationId: string;
  quantity: number;
  reason?: string;
}

/**
 * Ship Stock DTO
 */
export interface ShipStockDto {
  variantId: string;
  fromLocationId: string;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
}

/**
 * Transfer Stock DTO
 */
export interface TransferStockDto {
  variantId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  reason?: string;
}

/**
 * Mark Damaged DTO
 */
export interface MarkDamagedDto {
  variantId: string;
  fromLocationId: string;
  quantity: number;
  reason?: string;
}

// Stock List (variant-location flattened)
export interface StockListItemDto {
  productId: string;
  variantId: string;
  sku: string;
  barcode?: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  locationId: string;
  locationCode: string;
  locationType?: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
}

export interface PaginatedStockList {
  items: StockListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StockListFilters {
  search?: string;
  warehouseIds?: string[];
  locationIds?: string[];
  page?: number;
  pageSize?: number;
}
