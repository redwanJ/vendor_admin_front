'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { inventoryService } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';
import ReservationStatusBadge from '@/components/inventory/ReservationStatusBadge';
import type { ReservationListDto, ReservationStatus, ReservationType } from '@/types/inventory';
import { Plus, Search, Calendar, Package2 } from 'lucide-react';

export default function ReservationsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationListDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReservationType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReservations();
  }, [page, statusFilter, typeFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);

      const filters: any = {
        page,
        pageSize,
      };

      if (statusFilter !== 'all') {
        filters.statuses = [statusFilter];
      }

      if (typeFilter !== 'all') {
        filters.types = [typeFilter];
      }

      const response = await inventoryService.getReservations(filters);
      setReservations(response.items);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load reservations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      await inventoryService.updateReservationStatus(reservationId, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Reservation status updated successfully',
      });
      loadReservations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await inventoryService.cancelReservation(reservationId);
      toast({
        title: 'Success',
        description: 'Reservation cancelled successfully',
      });
      loadReservations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to cancel reservation',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && reservations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">
            Manage all inventory reservations ({totalCount})
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Reservation
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="InUse">In Use</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="NoShow">No Show</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Booking">Booking</SelectItem>
              <SelectItem value="SoftHold">Soft Hold</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Reservations List */}
      <div className="space-y-4">
        {reservations.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No reservations found</p>
              <p className="text-sm">
                {statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first reservation to get started'}
              </p>
            </div>
          </Card>
        ) : (
          reservations.map((reservation) => (
            <Card key={reservation.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Package2 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">{reservation.serviceName || 'Service'}</h3>
                    <ReservationStatusBadge status={reservation.status} type={reservation.type} />
                    {reservation.isExpired && (
                      <span className="text-xs text-red-600 font-medium">EXPIRED</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {format(new Date(reservation.startDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {format(new Date(reservation.endDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{reservation.quantityReserved} units</p>
                    </div>
                    {reservation.customerName && (
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium">{reservation.customerName}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {reservation.status === 'Pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(reservation.id, 'Confirmed')}
                    >
                      Confirm
                    </Button>
                  )}
                  {reservation.status === 'Confirmed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(reservation.id, 'InUse')}
                      >
                        Mark In Use
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(reservation.id, 'NoShow')}
                      >
                        No Show
                      </Button>
                    </>
                  )}
                  {reservation.status === 'InUse' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(reservation.id, 'Completed')}
                    >
                      Complete
                    </Button>
                  )}
                  {reservation.status !== 'Completed' && reservation.status !== 'Cancelled' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelReservation(reservation.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{' '}
            {totalCount} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
