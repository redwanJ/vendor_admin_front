'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks';
import { LayoutDashboard, Calendar, Users, Package } from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const user = useAppSelector((state) => state.auth.user);

  // Mock stats - replace with real data from API
  const stats = [
    {
      title: 'Total Services',
      value: '12',
      icon: Package,
      description: 'Active services',
    },
    {
      title: 'Pending Bookings',
      value: '8',
      icon: Calendar,
      description: 'Awaiting confirmation',
    },
    {
      title: 'Total Customers',
      value: '145',
      icon: Users,
      description: 'Registered customers',
    },
    {
      title: 'This Month Revenue',
      value: 'ETB 45,000',
      icon: LayoutDashboard,
      description: '+12% from last month',
    },
  ];

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName || 'Vendor'}!
          </p>
          {user?.tenant && (
            <p className="text-sm text-muted-foreground mt-1">
              {user.tenant.businessName}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display. Start managing your services and bookings!
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2 md:grid-cols-3">
              <button className="flex items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
                <Package className="h-5 w-5" />
                <span>Add Service</span>
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
                <Calendar className="h-5 w-5" />
                <span>View Bookings</span>
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
                <Users className="h-5 w-5" />
                <span>Manage Customers</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
