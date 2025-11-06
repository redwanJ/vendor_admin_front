/**
 * Environment configuration
 * Access environment variables with type safety
 */

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  authUrl: process.env.NEXT_PUBLIC_AUTH_URL,
  authRealm: process.env.NEXT_PUBLIC_AUTH_REALM,
  authClientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID,
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
