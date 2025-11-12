import { api } from '@/lib/axios';
import type {
  WarehouseDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from '@/types/warehouse';
import type { WarehouseLocationDto } from '@/types/warehouse';

export const warehouseService = {
  async getWarehouses(): Promise<WarehouseDto[]> {
    const response = await api.get<WarehouseDto[]>('/vendor/warehouses');
    return response.data;
  },

  async getWarehouseById(id: string): Promise<WarehouseDto> {
    const response = await api.get<WarehouseDto>(`/vendor/warehouses/${id}`);
    return response.data;
  },

  async createWarehouse(data: CreateWarehouseDto): Promise<WarehouseDto> {
    const response = await api.post<WarehouseDto>('/vendor/warehouses', data);
    return response.data;
  },

  async updateWarehouse(id: string, data: UpdateWarehouseDto): Promise<WarehouseDto> {
    const response = await api.put<WarehouseDto>(`/vendor/warehouses/${id}`, data);
    return response.data;
  },

  async deleteWarehouse(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/vendor/warehouses/${id}`);
    return response.data;
  },

  async getWarehouseLocations(warehouseId: string): Promise<WarehouseLocationDto[]> {
    const response = await api.get<WarehouseLocationDto[]>(`/vendor/warehouses/${warehouseId}/locations`);
    return response.data;
  },
};
