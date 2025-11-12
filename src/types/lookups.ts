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

