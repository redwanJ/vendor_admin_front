'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { authService } from '@/lib/auth.service';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface AppShellProps {
  children: React.ReactNode;
  user: User | null;
}

export function AppShell({ children, user }: AppShellProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Load collapsed state from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar
        onMobileMenuToggle={handleToggleMobileMenu}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={handleToggleSidebar}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        user={user}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main
        className={cn(
          'min-h-[calc(100vh-4rem)] pt-16 transition-all duration-300',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
