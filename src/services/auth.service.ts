import { apiService } from './api.service';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import type { User } from '@/types';
import type { LoginFormData } from '@/validations/auth.schema';

interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

/**
 * Authentication service
 */
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginFormData): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      this.setTokens(response.data.token, response.data.refreshToken);
      this.setUser(response.data.user);
    }

    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<RegisterResponse> {
    const response = await apiService.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    if (response.success && response.data) {
      this.setTokens(response.data.token);
      this.setUser(response.data.user);
    }

    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const response = await apiService.post<{ token: string }>(
      API_ENDPOINTS.AUTH.REFRESH
    );

    if (response.success && response.data) {
      this.setTokens(response.data.token);
      return response.data.token;
    }

    throw new Error('Failed to refresh token');
  }

  /**
   * Store tokens in local storage
   */
  private setTokens(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  }

  /**
   * Store user in local storage
   */
  private setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
