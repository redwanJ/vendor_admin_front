import { api } from '@/lib/axios';
import type {
  CustomerDto,
  CustomerListDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  PaginatedCustomerList,
  CustomerFilters,
} from '@/types/customer';

/**
 * Service for Customer management operations
 */
export const customerService = {
  /**
   * Get all customers for the current vendor
   * Supports multi-select filtering
   */
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedCustomerList> {
    const params = new URLSearchParams();

    // Multi-select filters - append multiple values
    if (filters?.customerTypes && filters.customerTypes.length > 0) {
      filters.customerTypes.forEach(type => params.append('customerTypes', type));
    }
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }
    if (filters?.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get<PaginatedCustomerList>(
      `/vendor/customers${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Get a specific customer by ID
   */
  async getCustomerById(customerId: string): Promise<CustomerDto> {
    const response = await api.get<CustomerDto>(`/vendor/customers/${customerId}`);
    return response.data;
  },

  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerDto): Promise<{ id: string }> {
    const response = await api.post<{ id: string }>('/vendor/customers', data);
    return response.data;
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(customerId: string, data: UpdateCustomerDto): Promise<{ success: boolean }> {
    const response = await api.put<{ success: boolean }>(`/vendor/customers/${customerId}`, data);
    return response.data;
  },

  /**
   * Delete a customer (soft delete - archives)
   */
  async deleteCustomer(customerId: string): Promise<void> {
    await api.delete(`/vendor/customers/${customerId}`);
  },
};
