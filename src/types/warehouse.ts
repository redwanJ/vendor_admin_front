export interface AddressDto {
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface WarehouseDto {
  id: string;
  name: string;
  code: string;
  address?: AddressDto | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface CreateWarehouseDto {
  name: string;
  code: string;
  isDefault?: boolean;
  address?: AddressDto | null;
}

export interface UpdateWarehouseDto {
  name: string;
  code: string;
  isDefault?: boolean;
  isActive?: boolean;
  address?: AddressDto | null;
}

// For list views we can reuse WarehouseDto shape
export type WarehouseListDto = WarehouseDto;

export interface WarehouseLocationDto {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  type?: string | null;
  isActive: boolean;
}

export interface CreateLocationDto {
  warehouseId: string;
  name: string;
  code: string;
  type?: string | null;
}

export interface UpdateLocationDto {
  name: string;
  code: string;
  type?: string | null;
  isActive?: boolean;
}
