import { api } from '@/lib/axios';
import type { CreateLocationDto, UpdateLocationDto, WarehouseLocationDto } from '@/types/warehouse';

export const locationService = {
  async createLocation(data: CreateLocationDto): Promise<WarehouseLocationDto> {
    const response = await api.post<WarehouseLocationDto>('/vendor/locations', data);
    return response.data;
  },

  async updateLocation(id: string, data: UpdateLocationDto): Promise<WarehouseLocationDto> {
    const response = await api.put<WarehouseLocationDto>(`/vendor/locations/${id}`, data);
    return response.data;
  },

  async deleteLocation(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/vendor/locations/${id}`);
    return response.data;
  },
};

