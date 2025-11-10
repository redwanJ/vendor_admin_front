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
  LogOut,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { User as UserType } from '@/types/auth';

interface MobileNavProps {
  user: UserType | null;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileNav({ user, open, onClose, onLogout }: MobileNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('nav');

  const navItems = [
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
      href: `/${locale}/dashboard/bookings`,
      icon: Calendar,
    },
    {
      titleKey: 'customers',
      href: `/${locale}/dashboard/customers`,
      icon: Users,
    },
    {
      titleKey: 'settings',
      href: `/${locale}/settings`,
      icon: Settings,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = () => {
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-12rem)] py-4">
          <nav className="flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigation}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{t(item.titleKey)}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{user.email}</p>
                  {user.tenant && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {user.tenant.businessName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  asChild
                  onClick={handleNavigation}
                >
                  <Link href={`/${locale}/profile`}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
