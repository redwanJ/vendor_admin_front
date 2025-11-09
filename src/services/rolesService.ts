import { api } from '@/lib/axios';

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
}

/**
 * Service for Role management operations
 */
export const rolesService = {
  /**
   * Get all roles available for assignment
   */
  async getRoles(includeSystemRoles: boolean = true): Promise<RoleDto[]> {
    const response = await api.get<RoleDto[]>(
      `/vendor/roles${includeSystemRoles ? '?includeSystemRoles=true' : ''}`
    );
    return response.data;
  },
};
