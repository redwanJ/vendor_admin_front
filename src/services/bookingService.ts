import { api } from '@/lib/axios';
import type {
  BookingDto,
  BookingListDto,
  CreateBookingDto,
  UpdateBookingDto,
  UpdateBookingStatusDto,
  ConfirmPaymentDto,
  CancelBookingDto,
  PagedBookingList,
  BookingFilters,
} from '@/types/booking';

/**
 * Service for Booking and Checkout management operations
 */
export const bookingService = {
  /**
   * Get all bookings for the current vendor with filtering
   * Supports multi-select filtering for statuses and payment statuses
   */
  async getBookings(filters?: BookingFilters): Promise<PagedBookingList> {
    const params = new URLSearchParams();

    // Multi-select filters - append multiple values
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }
    if (filters?.paymentStatuses && filters.paymentStatuses.length > 0) {
      filters.paymentStatuses.forEach(status => params.append('paymentStatuses', status));
    }

    // Single-value filters
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.eventDateFrom) params.append('eventDateFrom', filters.eventDateFrom);
    if (filters?.eventDateTo) params.append('eventDateTo', filters.eventDateTo);
    if (filters?.createdFrom) params.append('createdFrom', filters.createdFrom);
    if (filters?.createdTo) params.append('createdTo', filters.createdTo);
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get<PagedBookingList>(
      `/vendor/bookings${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Get a specific booking by ID
   */
  async getBookingById(bookingId: string): Promise<BookingDto> {
    const response = await api.get<BookingDto>(`/vendor/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingDto): Promise<BookingDto> {
    const response = await api.post<BookingDto>('/vendor/bookings', data);
    return response.data;
  },

  /**
   * Update booking details
   */
  async updateBooking(
    bookingId: string,
    data: UpdateBookingDto
  ): Promise<BookingDto> {
    const response = await api.put<BookingDto>(
      `/vendor/bookings/${bookingId}`,
      data
    );
    return response.data;
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    data: UpdateBookingStatusDto
  ): Promise<BookingDto> {
    const response = await api.patch<BookingDto>(
      `/vendor/bookings/${bookingId}/status`,
      data
    );
    return response.data;
  },

  /**
   * Confirm payment for a booking
   */
  async confirmPayment(
    bookingId: string,
    data: ConfirmPaymentDto
  ): Promise<BookingDto> {
    const response = await api.post<BookingDto>(
      `/vendor/bookings/${bookingId}/confirm-payment`,
      data
    );
    return response.data;
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    data: CancelBookingDto
  ): Promise<BookingDto> {
    const response = await api.post<BookingDto>(
      `/vendor/bookings/${bookingId}/cancel`,
      data
    );
    return response.data;
  },
};
