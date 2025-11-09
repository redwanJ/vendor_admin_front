import type { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get current locale from URL
const getCurrentLocale = (): string => {
  if (typeof window === 'undefined') return 'en';
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const locale = pathSegments[0];
  return ['en', 'am'].includes(locale) ? locale : 'en';
};

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: 'An error occurred',
        statusCode: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.detail || errorData.message || errorData.title || error.message;
        error.errors = errorData.errors;
      } catch {
        error.message = `HTTP Error ${response.status}: ${response.statusText}`;
      }

      // Handle 401 - redirect to login (but not during login/register)
      if (response.status === 401 && typeof window !== 'undefined') {
        const isAuthEndpoint = response.url.includes('/auth/login') || response.url.includes('/auth/register');
        const currentPath = window.location.pathname;
        const isOnLoginPage = currentPath.includes('/login');

        // Only redirect if we're not logging in and not already on login page
        if (!isAuthEndpoint && !isOnLoginPage) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          const locale = getCurrentLocale();
          window.location.href = `/${locale}/login`;
        }
      }

      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
