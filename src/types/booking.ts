export type BookingStatus = 'Draft' | 'PendingPayment' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow';
export type PaymentStatus = 'Pending' | 'PartiallyPaid' | 'Paid' | 'Refunded' | 'Failed';
export type PaymentMethod = 'Cash' | 'CreditCard' | 'BankTransfer' | 'MobileMoney' | 'Other';

export interface BookingDto {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  eventDate?: string;
  eventLocation?: string;
  specialRequests?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  items: BookingItemDto[];
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingListDto {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  eventDate?: string;
  totalAmount: number;
  paidAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface BookingItemDto {
  id: string;
  serviceId: string;
  serviceName: string;
  startDate: string;
  endDate: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tax: number;
  total: number;
  inventoryReservationId?: string;
  notes?: string;
}

export interface CreateBookingDto {
  customerId: string;
  eventDate?: string;
  eventLocation?: string;
  specialRequests?: string;
  items: CreateBookingItemDto[];
}

export interface CreateBookingItemDto {
  serviceId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  notes?: string;
}

export interface ConfirmPaymentDto {
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
}

export interface UpdateBookingDto {
  eventDate?: string;
  eventLocation?: string;
  specialRequests?: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
}

export interface CancelBookingDto {
  reason: string;
}

export interface BookingFilters {
  statuses?: BookingStatus[];
  paymentStatuses?: PaymentStatus[];
  customerId?: string;
  eventDateFrom?: string;
  eventDateTo?: string;
  createdFrom?: string;
  createdTo?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedBookingList {
  items: BookingListDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
