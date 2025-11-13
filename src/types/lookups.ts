export interface WarehouseLookup {
  id: string;
  code: string;
  name: string;
}

export interface LocationLookup {
  id: string;
  warehouseId: string;
  code: string;
  name: string;
  type?: string;
}

export interface CourierLookup {
  id: string;
  code: string;
  name: string;
  trackingUrlTemplate?: string;
}

export interface VariantLookup {
  id: string;
  sku: string;
  barcode?: string;
  productId: string;
  productName: string;
}
