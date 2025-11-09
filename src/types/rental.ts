/**
 * Types for Rental Services and Inventory Management
 * Matches backend DTOs for type safety
 */

export type ServiceKind = 'Standard' | 'Rental' | 'Package';

export type RentalPeriodUnit = 'Hour' | 'Day' | 'Week' | 'Month';

/**
 * Rental configuration for rental services.
 * Only present when service kind is "Rental".
 */
export interface RentalConfiguration {
  inventoryQuantity: number;
  rentalPeriodUnit: RentalPeriodUnit;
  minimumRentalPeriod: number;
  depositAmount?: number;
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  allowSimultaneousBookings: boolean;
}

/**
 * Request for checking service availability.
 */
export interface CheckAvailabilityRequest {
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  requestedQuantity: number;
  excludeReservationId?: string;
}

/**
 * Conflicting reservation information.
 */
export interface ConflictingReservation {
  reservationId: string;
  startDate: string;
  endDate: string;
  quantityReserved: number;
  status: string;
}

/**
 * Result of availability check.
 */
export interface AvailabilityResult {
  isAvailable: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  checkedStartDate: string;
  checkedEndDate: string;
  message?: string;
  conflicts: ConflictingReservation[];
}

/**
 * Availability slot for calendar views.
 */
export interface AvailabilitySlot {
  slotStart: string;
  slotEnd: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  isFullyBooked: boolean;
}

/**
 * Reservation status enum.
 */
export type ReservationStatus =
  | 'Pending'
  | 'Confirmed'
  | 'InUse'
  | 'Completed'
  | 'Cancelled'
  | 'NoShow';

/**
 * Reservation type enum.
 */
export type ReservationType =
  | 'SoftHold'
  | 'Booking'
  | 'Maintenance'
  | 'Blocked';

/**
 * Reservation DTO.
 */
export interface Reservation {
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
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
