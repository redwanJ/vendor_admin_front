import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  setError,
  selectAuth,
} from '@/store/slices/authSlice';
import { authService } from '@/lib/auth.service';
import { ROUTES } from '@/constants';
import type { LoginFormData } from '@/validations/auth.schema';

/**
 * Custom hook for authentication operations
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector(selectAuth);

  /**
   * Login user
   */
  const login = useCallback(
    async (credentials: LoginFormData) => {
      try {
        dispatch(setLoading(true));
        const response = await authService.login(credentials);

        dispatch(
          setCredentials({
            user: response.user,
            token: response.accessToken,
            refreshToken: response.refreshToken,
          })
        );

        router.push(ROUTES.DASHBOARD);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Login failed';
        dispatch(setError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, router]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch(logoutAction());
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      dispatch(logoutAction());
      router.push(ROUTES.LOGIN);
    }
  }, [dispatch, router]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return auth.isAuthenticated || authService.isAuthenticated();
  }, [auth.isAuthenticated]);

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: isAuthenticated(),
    isLoading: auth.isLoading,
    error: auth.error,
    login,
    logout,
  };
}
