import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'am'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  am: 'አማርኛ',
};

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: {
      ...(await import(`../locales/${locale}/common.json`)).default,
      auth: (await import(`../locales/${locale}/auth.json`)).default,
      dashboard: (await import(`../locales/${locale}/dashboard.json`)).default,
      apiKeys: (await import(`../locales/${locale}/api-keys.json`)).default,
      customers: (await import(`../locales/${locale}/customers.json`)).default,
      services: (await import(`../locales/${locale}/services.json`)).default,
    },
  };
});
