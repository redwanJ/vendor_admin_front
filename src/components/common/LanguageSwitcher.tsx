'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { localeNames, type Locale } from '@/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    // Remove the current locale from the pathname
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '');
    // Navigate to the new locale
    router.push(`/${newLocale}${pathnameWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-2">
      {Object.entries(localeNames).map(([loc, name]) => (
        <Button
          key={loc}
          variant={locale === loc ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLocale(loc as Locale)}
          className="text-sm"
        >
          {name}
        </Button>
      ))}
    </div>
  );
}
