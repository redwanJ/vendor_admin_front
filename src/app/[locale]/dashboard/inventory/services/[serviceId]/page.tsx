'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AvailabilityCalendar from '@/components/inventory/AvailabilityCalendar';
import CreateReservationDialog from '@/components/inventory/CreateReservationDialog';
import ReservationDetailModal from '@/components/inventory/ReservationDetailModal';
import { inventoryService } from '@/services/inventoryService';
import { serviceService } from '@/services/serviceService';
import type { AvailabilitySlotDto } from '@/types/inventory';
import type { ServiceDto } from '@/types/service';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function ServiceCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('inventory');
  const { toast } = useToast();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<ServiceDto | null>(null);
  const [availabilityData, setAvailabilityData] = useState<AvailabilitySlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilitySlotDto | undefined>(undefined);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const loadService = async () => {
    try {
      const data = await serviceService.getServiceById(serviceId);
      setService(data);
    } catch (error) {
      console.error('Failed to load service:', error);
      toast({
        title: 'Error',
        description: 'Failed to load service details',
        variant: 'destructive',
      });
    }
  };

  const loadAvailability = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      const data = await inventoryService.getAvailabilityCalendar(
        serviceId,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setAvailabilityData(data);
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to load availability data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (startDate: Date, endDate: Date) => {
    loadAvailability(startDate, endDate);
  };

  const handleDateClick = (date: Date, availability?: AvailabilitySlotDto) => {
    setSelectedDate(date);
    setSelectedAvailability(availability);
    // If there are reservations or the date has availability data, show detail modal
    // Otherwise show create dialog
    if (availability && availability.reservedQuantity > 0) {
      setDetailModalOpen(true);
    } else {
      setCreateDialogOpen(true);
    }
  };

  const handleCreateFromDetailModal = () => {
    setDetailModalOpen(false);
    setCreateDialogOpen(true);
  };

  const handleReservationCreated = () => {
    setCreateDialogOpen(false);
    setSelectedDate(null);
    setSelectedAvailability(undefined);
    // Reload availability for current month
    const now = new Date();
    loadAvailability(startOfMonth(now), endOfMonth(now));
  };

  const handleReservationUpdated = () => {
    // Reload availability for current month
    const now = new Date();
    loadAvailability(startOfMonth(now), endOfMonth(now));
  };

  useEffect(() => {
    loadService();
    const now = new Date();
    loadAvailability(startOfMonth(now), endOfMonth(now));
  }, [serviceId]);

  if (!service) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-3xl font-bold">{service.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {t('rentalServices.title')} - Availability Calendar
            </p>
          </div>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)}>
          {t('quickActions.createReservation')}
        </Button>
      </div>

      {/* Service Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>{service.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Inventory</p>
              <p className="text-2xl font-bold">{service.rentalConfiguration?.inventoryQuantity || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">
                ${service.basePrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Minimum Rental</p>
              <p className="text-2xl font-bold">
                {service.rentalConfiguration?.minimumRentalPeriod || 1} {service.rentalConfiguration?.rentalPeriodUnit || 'days'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Calendar</CardTitle>
          <CardDescription>
            View and manage inventory availability. Click on a date to create a reservation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvailabilityCalendar
            availabilityData={availabilityData}
            totalQuantity={service.rentalConfiguration?.inventoryQuantity || 0}
            loading={loading}
            onDateClick={handleDateClick}
            onMonthChange={handleMonthChange}
          />
        </CardContent>
      </Card>

      {/* Create Reservation Dialog */}
      <CreateReservationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleReservationCreated}
        defaultServiceId={serviceId}
        defaultStartDate={selectedDate || undefined}
      />

      {/* Reservation Detail Modal */}
      {service && selectedDate && (
        <ReservationDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          serviceId={serviceId}
          serviceName={service.name}
          date={selectedDate}
          availability={selectedAvailability}
          totalQuantity={service.rentalConfiguration?.inventoryQuantity || 0}
          onCreateReservation={handleCreateFromDetailModal}
          onReservationUpdated={handleReservationUpdated}
        />
      )}
    </div>
  );
}
