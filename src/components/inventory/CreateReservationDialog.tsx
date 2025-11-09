'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { serviceService } from '@/services/serviceService';
import type { CreateReservationDto, ReservationType } from '@/types/inventory';
import type { ServiceDto } from '@/types/service';

const reservationSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  quantityReserved: z.number().min(1, 'Quantity must be at least 1'),
  type: z.enum(['Booking', 'SoftHold', 'Maintenance', 'Blocked'] as const),
  notes: z.string().optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  services?: Array<{ id: string; name: string; inventoryQuantity: number }>;
  defaultServiceId?: string;
  defaultStartDate?: Date;
}

export default function CreateReservationDialog({
  open,
  onOpenChange,
  onSuccess,
  services: servicesProp,
  defaultServiceId,
  defaultStartDate,
}: CreateReservationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    isAvailable: boolean;
    message?: string;
  } | null>(null);
  const [services, setServices] = useState<Array<{ id: string; name: string; inventoryQuantity: number }>>(
    servicesProp || []
  );
  const [loadingServices, setLoadingServices] = useState(false);

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      serviceId: defaultServiceId || '',
      quantityReserved: 1,
      type: 'Booking',
      startDate: defaultStartDate ? formatDateForInput(defaultStartDate) : '',
      endDate: '',
      notes: '',
    },
  });

  // Load services if not provided
  useEffect(() => {
    if (!servicesProp && open) {
      loadServices();
    }
  }, [open, servicesProp]);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const data = await serviceService.getServices({
        page: 1,
        pageSize: 100,
      });
      setServices(
        data.items
          .filter((s) => s.kind === 'Rental')
          .map((s) => ({
            id: s.id,
            name: s.name,
            inventoryQuantity: 0, // ServiceListDto doesn't have inventoryQuantity, will need to load full service details
          }))
      );
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (defaultServiceId) {
      form.setValue('serviceId', defaultServiceId);
    }
    if (defaultStartDate) {
      form.setValue('startDate', formatDateForInput(defaultStartDate));
    }
  }, [defaultServiceId, defaultStartDate]);

  // Check availability when dates or quantity change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'startDate' || name === 'endDate' || name === 'quantityReserved' || name === 'serviceId') {
        checkAvailability();
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const checkAvailability = async () => {
    const values = form.getValues();

    if (!values.serviceId || !values.startDate || !values.endDate || !values.quantityReserved) {
      setAvailabilityResult(null);
      return;
    }

    try {
      setCheckingAvailability(true);
      const result = await inventoryService.checkAvailability(
        values.serviceId,
        values.startDate,
        values.endDate,
        values.quantityReserved
      );

      setAvailabilityResult({
        isAvailable: result.isAvailable,
        message: result.message,
      });
    } catch (error) {
      setAvailabilityResult(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const onSubmit = async (data: ReservationFormData) => {
    if (!availabilityResult?.isAvailable) {
      return;
    }

    try {
      setLoading(true);

      const dto: CreateReservationDto = {
        serviceId: data.serviceId,
        startDate: data.startDate,
        endDate: data.endDate,
        quantityReserved: data.quantityReserved,
        type: data.type as ReservationType,
        notes: data.notes,
      };

      await inventoryService.createReservation(dto);
      onSuccess();
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Reservation</DialogTitle>
          <DialogDescription>
            Reserve inventory for a customer or block it for maintenance
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingServices}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingServices ? "Loading services..." : "Select a rental service"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantityReserved"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Booking">Booking</SelectItem>
                        <SelectItem value="SoftHold">Soft Hold</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Soft hold expires automatically; Booking is confirmed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability Check Result */}
            {checkingAvailability && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Checking availability...</AlertDescription>
              </Alert>
            )}

            {availabilityResult && !checkingAvailability && (
              <Alert variant={availabilityResult.isAvailable ? 'default' : 'destructive'}>
                {availabilityResult.isAvailable ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {availabilityResult.isAvailable
                    ? 'Inventory is available for the selected dates and quantity'
                    : availabilityResult.message || 'Insufficient inventory available'}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !availabilityResult?.isAvailable}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Reservation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
