'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  Settings,
  Key,
  Search,
  ChevronsUpDown,
  Building,
  UserPlus,
  Zap,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import type { User as UserType } from '@/types/auth';

interface SidebarProps {
  user: UserType | null;
  collapsed: boolean;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar({ user, collapsed }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');

  const navSections: NavSection[] = [
    {
      titleKey: 'main',
      items: [
        {
          titleKey: 'dashboard',
          href: `/${locale}/dashboard`,
          icon: LayoutDashboard,
        },
        {
          titleKey: 'services',
          href: `/${locale}/dashboard/services`,
          icon: Package,
        },
        {
          titleKey: 'bookings',
          href: `/${locale}/bookings`,
          icon: Calendar,
        },
        {
          titleKey: 'customers',
          href: `/${locale}/customers`,
          icon: Users,
        },
        {
          titleKey: 'staff',
          href: `/${locale}/staff`,
          icon: UserPlus,
        },
      ],
    },
    {
      titleKey: 'settings_section',
      items: [
        {
          titleKey: 'settings',
          href: `/${locale}/settings`,
          icon: Settings,
        },
        {
          titleKey: 'api_keys',
          href: `/${locale}/dashboard/api-keys`,
          icon: Key,
        },
      ],
    },
  ];

  if (collapsed) {
    // Collapsed sidebar - minimal view
    return (
      <aside
        className={cn(
          'flex flex-col h-screen border-r bg-background transition-all duration-300 w-16'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b flex items-center justify-center px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">MH</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {navSections.flatMap((section) =>
              section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                    title={t(item.titleKey)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </Link>
                );
              })
            )}
          </nav>
        </ScrollArea>
      </aside>
    );
  }

  // Expanded sidebar - full view
  return (
    <aside
      className={cn(
        'flex flex-col h-screen border-r bg-background transition-all duration-300 w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 border-b flex items-center px-4">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2 font-semibold"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">MH</span>
          </div>
          <span className="text-lg font-bold">Menal Hub</span>
        </Link>
      </div>

      {/* Sidebar Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 space-y-4">
          {/* Workspace Selector */}
          {user?.tenant && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-sm font-medium">
                      {user.tenant.businessName}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 flex-shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Building className="mr-2 h-4 w-4" />
                  <span>{user.tenant.businessName}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Sections */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-6 py-2">
            {navSections.map((section) => (
              <div key={section.titleKey}>
                <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t(section.titleKey)}
                </h3>
                <nav className="flex flex-col gap-1">
                  {section.items.map((item) => {
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
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{t(item.titleKey)}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Section */}
        <div className="p-4 space-y-3 border-t">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </Button>

          {/* Upgrade Box */}
          <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Upgrade to Pro</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Get unlimited services, advanced analytics, and priority support.
              </p>
              <Button size="sm" className="w-full">
                Upgrade Now
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </aside>
  );
}
