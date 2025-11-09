import { api } from '@/lib/axios';
import type {
  ReservationDto,
  ReservationListDto,
  CreateReservationDto,
  UpdateReservationDto,
  UpdateReservationStatusDto,
  BlockInventoryDto,
  AvailabilityResultDto,
  AvailabilitySlotDto,
  PaginatedReservationList,
  ReservationFilters,
} from '@/types/inventory';

/**
 * Service for Inventory and Reservation management operations
 */
export const inventoryService = {
  /**
   * Get all reservations for the current vendor with filtering
   */
  async getReservations(filters?: ReservationFilters): Promise<PaginatedReservationList> {
    const params = new URLSearchParams();

    if (filters?.serviceId) params.append('serviceId', filters.serviceId);

    // Multi-select filters
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }

    if (filters?.types && filters.types.length > 0) {
      filters.types.forEach(type => params.append('types', type));
    }

    if (filters?.startDateFrom) params.append('startDateFrom', filters.startDateFrom);
    if (filters?.startDateTo) params.append('startDateTo', filters.startDateTo);
    if (filters?.endDateFrom) params.append('endDateFrom', filters.endDateFrom);
    if (filters?.endDateTo) params.append('endDateTo', filters.endDateTo);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.includeExpired !== undefined) {
      params.append('includeExpired', filters.includeExpired.toString());
    }
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get<PaginatedReservationList>(
      `/vendor/inventory/reservations${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Get a specific reservation by ID
   */
  async getReservationById(reservationId: string): Promise<ReservationDto> {
    const response = await api.get<ReservationDto>(
      `/vendor/inventory/reservations/${reservationId}`
    );
    return response.data;
  },

  /**
   * Create a new reservation
   */
  async createReservation(data: CreateReservationDto): Promise<ReservationDto> {
    const response = await api.post<ReservationDto>(
      '/vendor/inventory/reservations',
      data
    );
    return response.data;
  },

  /**
   * Update an existing reservation's details
   */
  async updateReservation(
    reservationId: string,
    data: UpdateReservationDto
  ): Promise<ReservationDto> {
    const response = await api.put<ReservationDto>(
      `/vendor/inventory/reservations/${reservationId}`,
      data
    );
    return response.data;
  },

  /**
   * Update a reservation's status
   */
  async updateReservationStatus(
    reservationId: string,
    data: UpdateReservationStatusDto
  ): Promise<ReservationDto> {
    const response = await api.patch<ReservationDto>(
      `/vendor/inventory/reservations/${reservationId}/status`,
      data
    );
    return response.data;
  },

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/vendor/inventory/reservations/${reservationId}`
    );
    return response.data;
  },

  /**
   * Check availability for a service
   */
  async checkAvailability(
    serviceId: string,
    startDate: string,
    endDate: string,
    quantity: number = 1,
    excludeReservationId?: string
  ): Promise<AvailabilityResultDto> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      quantity: quantity.toString(),
    });

    if (excludeReservationId) {
      params.append('excludeReservationId', excludeReservationId);
    }

    const response = await api.get<AvailabilityResultDto>(
      `/vendor/inventory/services/${serviceId}/availability?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get availability breakdown for calendar view
   */
  async getAvailabilityCalendar(
    serviceId: string,
    rangeStart: string,
    rangeEnd: string
  ): Promise<AvailabilitySlotDto[]> {
    const params = new URLSearchParams({
      rangeStart,
      rangeEnd,
    });

    const response = await api.get<AvailabilitySlotDto[]>(
      `/vendor/inventory/services/${serviceId}/calendar?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Block inventory for maintenance or manual blocking
   */
  async blockInventory(
    serviceId: string,
    data: BlockInventoryDto
  ): Promise<ReservationDto> {
    const response = await api.post<ReservationDto>(
      `/vendor/inventory/services/${serviceId}/block`,
      data
    );
    return response.data;
  },
};
