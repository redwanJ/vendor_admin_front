/**
 * User Status
 */
export type UserStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';

/**
 * User Role DTO
 */
export interface UserRoleDto {
  roleId: string;
  roleName: string;
  assignedAt: string;
  expiresAt?: string;
  isExpired: boolean;
}

/**
 * User DTO for read operations (complete details)
 */
export interface UserDto {
  id: string;
  tenantId: string;
  authId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status: string;
  lastLoginAt?: string;
  roles: UserRoleDto[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * User List Item DTO (lightweight for list views)
 */
export interface UserListDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  status: string;
  lastLoginAt?: string;
  roleCount: number;
}

/**
 * Update User DTO
 */
export interface UpdateUserDto {
  email: string;
  fullName: string;
  avatarUrl?: string;
}

/**
 * Assign Role DTO
 */
export interface AssignRoleDto {
  roleId: string;
  expiresAt?: string;
}

/**
 * Invite Staff DTO (for creating new staff members)
 */
export interface InviteStaffDto {
  email: string;
  fullName: string;
  roleId: string;
  phoneNumber?: string;
}

/**
 * Paginated User List Response
 */
export interface PaginatedUserList {
  items: UserListDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * User Filters
 */
export interface UserFilters {
  searchTerm?: string;
  statuses?: string[];
  page?: number;
  pageSize?: number;
}
