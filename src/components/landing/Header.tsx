"use client";

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import SocialLinks from './SocialLinks';

export default function Header() {
  const locale = useLocale();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">MH</span>
          </div>
          <span className="text-lg font-bold">Menal Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <SocialLinks className="hidden sm:flex" />
          <Link href={`/${locale}/login`}>
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href={`/${locale}/register`}>
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
