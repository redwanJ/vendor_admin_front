/**
 * Customer Type
 */
export type CustomerType = 'Individual' | 'Business' | 'EventPlanner';

/**
 * Customer Status
 */
export type CustomerStatus = 'Active' | 'Inactive' | 'Blocked' | 'Archived';

/**
 * Address DTO
 */
export interface AddressDto {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Customer DTO for read operations
 */
export interface CustomerDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  alternatePhone?: string;
  address?: AddressDto;
  customerType: string;
  status: string;
  notes?: string;
  tags?: string[];
  preferredContactMethod?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedInUrl?: string;
  companyName?: string;
  taxIdNumber?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Customer List Item DTO
 */
export interface CustomerListDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  customerType: string;
  status: string;
  tags?: string[];
  createdAt: string;
}

/**
 * Create Customer DTO
 */
export interface CreateCustomerDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  alternatePhone?: string;
  address?: AddressDto;
  customerType: CustomerType;
  notes?: string;
  tags?: string[];
  preferredContactMethod?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedInUrl?: string;
  companyName?: string;
  taxIdNumber?: string;
}

/**
 * Update Customer DTO
 */
export interface UpdateCustomerDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  alternatePhone?: string;
  address?: AddressDto;
  notes?: string;
  tags?: string[];
  preferredContactMethod?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedInUrl?: string;
  companyName?: string;
  taxIdNumber?: string;
}

/**
 * Paginated Customer List Response
 */
export interface PaginatedCustomerList {
  items: CustomerListDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Customer Filters - supports multi-select
 */
export interface CustomerFilters {
  customerTypes?: CustomerType[];
  statuses?: CustomerStatus[];
  tags?: string[];
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}
