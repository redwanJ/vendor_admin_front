'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useAppSelector } from '@/store/hooks';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector((state) => state.auth.user);

  return <AppShell user={user}>{children}</AppShell>;
}
