import { api } from '@/lib/axios';
import type {
  ServiceDto,
  ServiceListDto,
  CreateServiceDto,
  UpdateServiceDto,
  ServiceFilters,
  PagedResult,
} from '@/types/service';
import type {
  CheckAvailabilityRequest,
  AvailabilityResult,
  AvailabilitySlot,
} from '@/types/rental';

export const serviceService = {
  /**
   * Get paginated list of services
   * Supports multi-select filtering
   */
  async getServices(filters?: ServiceFilters): Promise<PagedResult<ServiceListDto>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    // Multi-select filters - append multiple values
    if (filters?.serviceTypeIds && filters.serviceTypeIds.length > 0) {
      filters.serviceTypeIds.forEach(id => params.append('serviceTypeIds', id));
    }
    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      filters.categoryIds.forEach(id => params.append('categoryIds', id));
    }
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }

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

  /**
   * Check availability for a rental service
   * Verifies if requested quantity is available for the specified date range
   */
  async checkAvailability(
    serviceId: string,
    request: CheckAvailabilityRequest
  ): Promise<AvailabilityResult> {
    const response = await api.post<AvailabilityResult>(
      `/vendor/services/${serviceId}/check-availability`,
      request
    );
    return response.data;
  },

  /**
   * Get availability breakdown for a rental service
   * Returns slot-by-slot availability for calendar visualization
   */
  async getAvailabilityBreakdown(
    serviceId: string,
    rangeStart: string,
    rangeEnd: string
  ): Promise<AvailabilitySlot[]> {
    const response = await api.get<AvailabilitySlot[]>(
      `/vendor/services/${serviceId}/availability-breakdown`,
      { params: { rangeStart, rangeEnd } }
    );
    return response.data;
  },
};
