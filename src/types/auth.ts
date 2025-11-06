export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterVendorData {
  email: string;
  fullName: string;
  password: string;
  businessName: string;
  businessSlug: string;
  phoneNumber: string;
  address?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
  tenant: Tenant;
}

export interface User {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  status: 'Active' | 'Suspended' | 'Pending';
  tenant: Tenant;
  roles: string[];
  permissions: string[];
}

export interface Tenant {
  tenantId: string;
  businessName: string;
  businessSlug: string;
  status: 'Active' | 'Suspended' | 'Trial' | 'Expired';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
