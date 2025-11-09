// Service-related types

import { BaseLookup } from "./api";
import { ServiceKind, RentalConfiguration } from "./rental";

export type PricingModel = 'FixedPrice' | 'PerPerson' | 'PerHour' | 'PerDay' | 'Custom';
export type ServiceStatus = 'Draft' | 'PendingApproval' | 'Active' | 'Inactive' | 'Archived';

export interface ServiceTypeLookup extends BaseLookup {
  // Add service-type specific properties here if needed
}

export interface CategoryLookup extends BaseLookup {
  // Add category-specific properties here if needed
}

export interface TenantLookup extends BaseLookup {
  // Add tenant-specific properties here if needed
}

export interface AddressDto {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface ServiceListDto {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  kind: ServiceKind;
  serviceType: ServiceTypeLookup;
  category?: CategoryLookup;
  basePrice: number;
  currency: string;
  pricingModel: string;
  primaryImageUrl?: string;
  status: string;
  isFeatured: boolean;
  updatedAt?: string;
}

export interface ServiceDto {
  id: string;
  tenant: TenantLookup;
  serviceType: ServiceTypeLookup;
  category?: CategoryLookup;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  kind: ServiceKind;
  rentalConfiguration?: RentalConfiguration;
  basePrice: number;
  currency: string;
  pricingModel: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  durationMinutes?: number;
  setupTimeMinutes?: number;
  teardownTimeMinutes?: number;
  leadTimeDays?: number;
  maxAdvanceBookingDays?: number;
  location?: AddressDto;
  primaryImageUrl?: string;
  galleryImages: string[];
  features: string[];
  customFields: Record<string, string>;
  availabilityRules: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  status: string;
  isFeatured: boolean;
  featuredOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateServiceDto {
  serviceTypeId: string;
  categoryId?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  kind: ServiceKind;
  rentalConfiguration?: RentalConfiguration;
  basePrice: number;
  currency: string;
  pricingModel: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  durationMinutes?: number;
  setupTimeMinutes?: number;
  teardownTimeMinutes?: number;
  leadTimeDays?: number;
  maxAdvanceBookingDays?: number;
  location?: AddressDto;
  primaryImageUrl?: string;
  galleryImages?: string[];
  features?: string[];
  customFields?: Record<string, string>;
  availabilityRules?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export interface UpdateServiceDto extends Omit<CreateServiceDto, 'serviceTypeId'> {}

export interface ServiceFilters {
  page?: number;
  pageSize?: number;
  serviceTypeIds?: string[];  // Changed to array for multi-select
  categoryIds?: string[];     // Changed to array for multi-select
  statuses?: ServiceStatus[];  // Changed to array for multi-select
  isFeatured?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
