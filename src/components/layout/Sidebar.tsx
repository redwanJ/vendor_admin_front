'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Package2,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('nav');

  const navItems = [
    {
      titleKey: 'dashboard',
      href: `/${locale}`,
      icon: LayoutDashboard,
    },
    {
      titleKey: 'orders',
      href: `/${locale}/orders`,
      icon: ShoppingCart,
    },
    {
      titleKey: 'products',
      href: `/${locale}/products`,
      icon: Package,
    },
    {
      titleKey: 'inventory',
      href: `/${locale}/inventory`,
      icon: Package2,
    },
    {
      titleKey: 'sales',
      href: `/${locale}/sales`,
      icon: TrendingUp,
    },
    {
      titleKey: 'settings',
      href: `/${locale}/settings`,
      icon: Settings,
    },
  ];

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.titleKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
