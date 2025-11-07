/**
 * API Key Status
 */
export type ApiKeyStatus = 'Active' | 'Revoked' | 'Expired' | 'Suspended';

/**
 * API Key Tier
 */
export type ApiKeyTier = 'Public' | 'Basic' | 'Premium';

/**
 * API Key DTO for read operations
 */
export interface ApiKeyDto {
  id: string;
  name: string;
  keyPrefix: string;
  status: ApiKeyStatus;
  tier: ApiKeyTier;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  scopes: string[];
  allowedIps: string[];
  allowedOrigins: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  revokedAt?: string;
  description?: string;
  environment: string;
  createdAt: string;
  createdBy: string;
}

/**
 * API Key List Item DTO
 */
export interface ApiKeyListDto {
  id: string;
  name: string;
  keyPrefix: string;
  status: ApiKeyStatus;
  tier: ApiKeyTier;
  environment: string;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

/**
 * Create API Key DTO
 */
export interface CreateApiKeyDto {
  name: string;
  tier: ApiKeyTier;
  scopes?: string[];
  expiresAt?: string;
  description?: string;
  environment?: string;
  allowedIps?: string[];
  allowedOrigins?: string[];
}

/**
 * API Key Created Response
 */
export interface ApiKeyCreatedDto {
  id: string;
  name: string;
  plainTextKey: string;
  keyPrefix: string;
  tier: ApiKeyTier;
  environment: string;
  createdAt: string;
  warning: string;
}

/**
 * Update API Key DTO
 */
export interface UpdateApiKeyDto {
  name?: string;
  description?: string;
  scopes?: string[];
  allowedIps?: string[];
  allowedOrigins?: string[];
  expiresAt?: string;
}

/**
 * Paginated API Key List Response
 */
export interface PaginatedApiKeyList {
  items: ApiKeyListDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API Key Filters - supports multi-select
 */
export interface ApiKeyFilters {
  statuses?: ApiKeyStatus[];
  tiers?: ApiKeyTier[];
  environments?: string[];
  pageNumber?: number;
  pageSize?: number;
}
