import { api } from '@/lib/axios';
import type {
  ServiceDto,
  ServiceListDto,
  CreateServiceDto,
  UpdateServiceDto,
  ServiceFilters,
  PagedResult,
} from '@/types/service';

export const serviceService = {
  /**
   * Get paginated list of services
   */
  async getServices(filters?: ServiceFilters): Promise<PagedResult<ServiceListDto>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.serviceTypeId) params.append('serviceTypeId', filters.serviceTypeId);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortDescending !== undefined) params.append('sortDescending', filters.sortDescending.toString());

    const response = await api.get<PagedResult<ServiceListDto>>(`/vendor/services?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single service by ID
   */
  async getServiceById(serviceId: string): Promise<ServiceDto> {
    const response = await api.get<ServiceDto>(`/vendor/services/${serviceId}`);
    return response.data;
  },

  /**
   * Create a new service
   */
  async createService(data: CreateServiceDto): Promise<ServiceDto> {
    const response = await api.post<ServiceDto>('/vendor/services', data);
    return response.data;
  },

  /**
   * Update an existing service
   */
  async updateService(serviceId: string, data: UpdateServiceDto): Promise<ServiceDto> {
    const response = await api.put<ServiceDto>(`/vendor/services/${serviceId}`, data);
    return response.data;
  },

  /**
   * Delete a service (soft delete)
   */
  async deleteService(serviceId: string): Promise<void> {
    await api.delete(`/vendor/services/${serviceId}`);
  },

  /**
   * Bulk delete services
   */
  async bulkDeleteServices(serviceIds: string[]): Promise<void> {
    await Promise.all(serviceIds.map(id => this.deleteService(id)));
  },
};
