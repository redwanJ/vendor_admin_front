'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, User, Package, Clock, FileText, Plus } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import ReservationStatusBadge from './ReservationStatusBadge';
import type { ReservationDto, ReservationListDto, ReservationStatus, AvailabilitySlotDto } from '@/types/inventory';

interface ReservationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceName: string;
  date: Date;
  availability?: AvailabilitySlotDto;
  totalQuantity: number;
  onCreateReservation: () => void;
  onReservationUpdated: () => void;
}

export default function ReservationDetailModal({
  open,
  onOpenChange,
  serviceId,
  serviceName,
  date,
  availability,
  totalQuantity,
  onCreateReservation,
  onReservationUpdated,
}: ReservationDetailModalProps) {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<ReservationListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadReservations();
    }
  }, [open, serviceId, date]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const data = await inventoryService.getReservations({
        serviceId,
        startDateFrom: startOfDay.toISOString(),
        startDateTo: endOfDay.toISOString(),
        page: 1,
        pageSize: 50,
      });

      setReservations(data.items);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reservations for this date',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      setUpdatingStatus(reservationId);
      await inventoryService.updateReservationStatus(reservationId, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Reservation status updated successfully',
      });
      loadReservations();
      onReservationUpdated();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reservation status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusActions = (reservation: ReservationListDto) => {
    const actions = [];

    if (reservation.status === 'Pending') {
      actions.push(
        <Button
          key="confirm"
          size="sm"
          onClick={() => handleStatusChange(reservation.id, 'Confirmed')}
          disabled={updatingStatus === reservation.id}
        >
          Confirm
        </Button>
      );
    }

    if (reservation.status === 'Confirmed') {
      actions.push(
        <Button
          key="in-use"
          size="sm"
          onClick={() => handleStatusChange(reservation.id, 'InUse')}
          disabled={updatingStatus === reservation.id}
        >
          Mark In Use
        </Button>,
        <Button
          key="no-show"
          size="sm"
          variant="outline"
          onClick={() => handleStatusChange(reservation.id, 'NoShow')}
          disabled={updatingStatus === reservation.id}
        >
          No Show
        </Button>
      );
    }

    if (reservation.status === 'InUse') {
      actions.push(
        <Button
          key="complete"
          size="sm"
          onClick={() => handleStatusChange(reservation.id, 'Completed')}
          disabled={updatingStatus === reservation.id}
        >
          Complete
        </Button>
      );
    }

    if (['Pending', 'Confirmed'].includes(reservation.status)) {
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="destructive"
          onClick={() => handleStatusChange(reservation.id, 'Cancelled')}
          disabled={updatingStatus === reservation.id}
        >
          Cancel
        </Button>
      );
    }

    return actions;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(date, 'MMMM d, yyyy')}
          </DialogTitle>
          <DialogDescription>{serviceName}</DialogDescription>
        </DialogHeader>

        {/* Availability Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Availability Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Capacity</p>
                <p className="text-xl font-bold">{totalQuantity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="text-xl font-bold text-green-600">
                  {availability?.availableQuantity || totalQuantity}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Reserved</p>
                <p className="text-xl font-bold text-blue-600">
                  {availability?.reservedQuantity || 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="text-xl font-bold">
                  {availability?.isFullyBooked ? (
                    <span className="text-red-600">Fully Booked</span>
                  ) : (
                    <span className="text-green-600">Available</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Reservations ({reservations.length})
          </h3>
          <Button size="sm" onClick={onCreateReservation}>
            <Plus className="h-4 w-4 mr-1" />
            New Reservation
          </Button>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reservations for this date</p>
            <Button className="mt-4" onClick={onCreateReservation}>
              Create First Reservation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header with Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ReservationStatusBadge
                          status={reservation.status}
                          type={reservation.type}
                        />
                        {reservation.isExpired && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        #{reservation.id.slice(0, 8)}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {reservation.customerName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Customer</p>
                            <p className="font-medium">{reservation.customerName}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{reservation.quantityReserved} units</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">
                            {format(new Date(reservation.startDate), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p className="font-medium">
                            {format(new Date(reservation.endDate), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>


                    {/* Actions */}
                    {getStatusActions(reservation).length > 0 && (
                      <>
                        <Separator />
                        <div className="flex gap-2">
                          {getStatusActions(reservation)}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
