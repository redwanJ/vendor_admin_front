'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { serviceService } from '@/services/serviceService';
import { inventoryService } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Package, TrendingUp, AlertCircle } from 'lucide-react';

export default function InventoryPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [rentalServices, setRentalServices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReservations: 0,
    activeReservations: 0,
    upcomingReservations: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load rental services
      const servicesResponse = await serviceService.getServices({
        page: 1,
        pageSize: 100,
      });

      // Filter to only rental services
      const rentals = servicesResponse.items.filter((s: any) => s.kind === 'Rental');
      setRentalServices(rentals);

      // Load reservation stats
      const today = new Date().toISOString();
      const [allReservations, activeReservations, upcomingReservations] = await Promise.all([
        inventoryService.getReservations({ page: 1, pageSize: 1 }),
        inventoryService.getReservations({
          statuses: ['InUse'],
          page: 1,
          pageSize: 1,
        }),
        inventoryService.getReservations({
          statuses: ['Confirmed'],
          startDateFrom: today,
          page: 1,
          pageSize: 1,
        }),
      ]);

      setStats({
        totalReservations: allReservations.totalCount,
        activeReservations: activeReservations.totalCount,
        upcomingReservations: upcomingReservations.totalCount,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load inventory data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory & Reservations</h1>
        <p className="text-muted-foreground">
          Manage rental inventory and reservations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">All time reservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReservations}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingReservations}</div>
            <p className="text-xs text-muted-foreground">Confirmed reservations</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your rental inventory</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href={`/${locale}/dashboard/inventory/reservations`}>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              View All Reservations
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Rental Services */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Services ({rentalServices.length})</CardTitle>
          <CardDescription>Services with inventory tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {rentalServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rental services found.</p>
              <p className="text-sm">
                Create a service and configure it as a rental service to start tracking inventory.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rentalServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => router.push(`/${locale}/dashboard/inventory/services/${service.id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.inventoryQuantity} units • Min rental: {service.minimumRentalPeriod}{' '}
                      {service.rentalPeriodUnit?.toLowerCase()}(s)
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Calendar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
