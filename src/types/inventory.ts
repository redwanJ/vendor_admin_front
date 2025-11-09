// Reservation Status
export type ReservationStatus = 'Pending' | 'Confirmed' | 'InUse' | 'Completed' | 'Cancelled' | 'NoShow';

// Reservation Type
export type ReservationType = 'SoftHold' | 'Booking' | 'Maintenance' | 'Blocked';

// Full reservation details
export interface ReservationDto {
  id: string;
  serviceId: string;
  serviceName: string;
  startDate: string;
  endDate: string;
  quantityReserved: number;
  status: ReservationStatus;
  type: ReservationType;
  bookingId?: string;
  customerId?: string;
  customerName?: string;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Simplified reservation for list views
export interface ReservationListDto {
  id: string;
  serviceId: string;
  serviceName: string;
  startDate: string;
  endDate: string;
  quantityReserved: number;
  status: ReservationStatus;
  type: ReservationType;
  customerName?: string;
  expiresAt?: string;
  isExpired: boolean;
}

// Create reservation DTO
export interface CreateReservationDto {
  serviceId: string;
  startDate: string;
  endDate: string;
  quantityReserved: number;
  type: ReservationType;
  bookingId?: string;
  customerId?: string;
  expiresAt?: string;
  notes?: string;
}

// Update reservation DTO
export interface UpdateReservationDto {
  startDate: string;
  endDate: string;
  quantityReserved: number;
  notes?: string;
}

// Update reservation status DTO
export interface UpdateReservationStatusDto {
  status: ReservationStatus;
}

// Block inventory DTO
export interface BlockInventoryDto {
  serviceId: string;
  startDate: string;
  endDate: string;
  quantityBlocked: number;
  type: 'Maintenance' | 'Blocked';
  reason?: string;
}

// Availability result
export interface AvailabilityResultDto {
  isAvailable: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  checkedStartDate: string;
  checkedEndDate: string;
  message?: string;
  conflicts: ConflictingReservationDto[];
}

// Conflicting reservation info
export interface ConflictingReservationDto {
  reservationId: string;
  startDate: string;
  endDate: string;
  quantityReserved: number;
  status: string;
}

// Availability slot for calendar
export interface AvailabilitySlotDto {
  slotStart: string;
  slotEnd: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  isFullyBooked: boolean;
}

// Paginated reservation list
export interface PaginatedReservationList {
  items: ReservationListDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Reservation filters
export interface ReservationFilters {
  serviceId?: string;
  statuses?: ReservationStatus[];
  types?: ReservationType[];
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  customerId?: string;
  includeExpired?: boolean;
  page?: number;
  pageSize?: number;
}

// Service with inventory info (extended from service types)
export interface InventoryServiceDto {
  id: string;
  name: string;
  slug: string;
  kind: 'Rental';
  inventoryQuantity: number;
  rentalPeriodUnit: 'Hour' | 'Day' | 'Week' | 'Month';
  minimumRentalPeriod: number;
  depositAmount?: number;
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  allowSimultaneousBookings: boolean;
  status: string;
  featuredImageUrl?: string;
}
