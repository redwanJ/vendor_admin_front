import { api } from '@/lib/axios';
import type {
  UserDto,
  UserListDto,
  UpdateUserDto,
  AssignRoleDto,
  InviteStaffDto,
  PaginatedUserList,
  UserFilters,
} from '@/types/user';

/**
 * Service for User/Staff management operations
 */
export const usersService = {
  /**
   * Get all users (staff) for the current vendor
   */
  async getUsers(filters?: UserFilters): Promise<PaginatedUserList> {
    const params = new URLSearchParams();

    // Multi-select filters - append multiple values
    if (filters?.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => params.append('statuses', status));
    }

    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get<PaginatedUserList>(
      `/vendor/users${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Get a specific user by ID
   */
  async getUserById(userId: string): Promise<UserDto> {
    const response = await api.get<UserDto>(`/vendor/users/${userId}`);
    return response.data;
  },

  /**
   * Update a user's profile
   */
  async updateUser(userId: string, data: UpdateUserDto): Promise<{ success: boolean }> {
    const response = await api.put<{ success: boolean }>(`/vendor/users/${userId}`, data);
    return response.data;
  },

  /**
   * Assign a role to a user
   */
  async assignRole(userId: string, data: AssignRoleDto): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>(`/vendor/users/${userId}/roles`, data);
    return response.data;
  },

  /**
   * Invite a new staff member (to be implemented with Keycloak integration)
   */
  async inviteStaff(data: InviteStaffDto): Promise<{ userId: string }> {
    const response = await api.post<{ userId: string }>('/vendor/users/invite', data);
    return response.data;
  },
};
