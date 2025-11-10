'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services/bookingService';
import { serviceService } from '@/services/serviceService';
import { inventoryService } from '@/services/inventoryService';
import type { CreateBookingItemDto } from '@/types/booking';
import type { ServiceListDto } from '@/types/service';
import CustomerSelector from '@/components/customers/CustomerSelector';
import BookingAvailabilityCalendar from '@/components/bookings/BookingAvailabilityCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, ShoppingCart, AlertCircle, CheckCircle2, Calendar, MapPin } from 'lucide-react';

interface BookingItem extends CreateBookingItemDto {
  tempId: string;
  serviceName: string;
  unitPrice: number;
  serviceKind: string;
  availabilityChecked?: boolean;
  isAvailable?: boolean;
  availableQuantity?: number;
  subtotal?: number;
}

export default function NewBookingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { toast } = useToast();
  const t = useTranslations('bookings');
  const tCommon = useTranslations('common');

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [items, setItems] = useState<BookingItem[]>([]);

  // Data state
  const [services, setServices] = useState<ServiceListDto[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New item form
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemServiceId, setNewItemServiceId] = useState('');
  const [newItemStartDate, setNewItemStartDate] = useState('');
  const [newItemEndDate, setNewItemEndDate] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemNotes, setNewItemNotes] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const result = await serviceService.getServices({
        page: 1,
        pageSize: 100,
        statuses: ['Active']
      });
      setServices(result.items);
    } catch (error) {
      toast({
        title: tCommon('messages.error'),
        description: 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setLoadingServices(false);
    }
  };

  const checkAvailability = async (
    serviceId: string,
    startDate: string,
    endDate: string,
    quantity: number
  ): Promise<{ isAvailable: boolean; availableQuantity: number }> => {
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service || service.kind !== 'Rental') {
        return { isAvailable: true, availableQuantity: 999 };
      }

      const result = await inventoryService.checkAvailability(
        serviceId,
        startDate,
        endDate,
        quantity
      );

      return {
        isAvailable: result.isAvailable,
        availableQuantity: result.availableQuantity,
      };
    } catch (error) {
      return { isAvailable: false, availableQuantity: 0 };
    }
  };

  const addItem = async () => {
    if (!newItemServiceId || !newItemStartDate || !newItemEndDate || newItemQuantity < 1) {
      toast({
        title: tCommon('messages.error'),
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    const service = services.find(s => s.id === newItemServiceId);
    if (!service) return;

    setCheckingAvailability(true);
    const availability = await checkAvailability(
      newItemServiceId,
      newItemStartDate,
      newItemEndDate,
      newItemQuantity
    );
    setCheckingAvailability(false);

    if (!availability.isAvailable) {
      toast({
        title: tCommon('messages.error'),
        description: `Not enough inventory available. Available: ${availability.availableQuantity}`,
        variant: 'destructive',
      });
      return;
    }

    const newItem: BookingItem = {
      tempId: `temp-${Date.now()}`,
      serviceId: newItemServiceId,
      serviceName: service.name,
      serviceKind: service.kind,
      unitPrice: service.basePrice,
      startDate: newItemStartDate,
      endDate: newItemEndDate,
      quantity: newItemQuantity,
      notes: newItemNotes,
      availabilityChecked: service.kind === 'Rental',
      isAvailable: availability.isAvailable,
      availableQuantity: availability.availableQuantity,
      subtotal: service.basePrice * newItemQuantity,
    };

    setItems([...items, newItem]);

    // Reset form
    setNewItemServiceId('');
    setNewItemStartDate('');
    setNewItemEndDate('');
    setNewItemQuantity(1);
    setNewItemNotes('');
    setShowAddItem(false);

    toast({
      title: tCommon('messages.success'),
      description: 'Service added to booking',
    });
  };

  const removeItem = (tempId: string) => {
    setItems(items.filter(item => item.tempId !== tempId));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast({
        title: tCommon('messages.error'),
        description: 'Please select a customer',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: tCommon('messages.error'),
        description: 'Please add at least one service',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        customerId,
        eventDate: eventDate || undefined,
        eventLocation: eventLocation || undefined,
        specialRequests: specialRequests || undefined,
        items: items.map(item => ({
          serviceId: item.serviceId,
          startDate: item.startDate,
          endDate: item.endDate,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      const result = await bookingService.createBooking(bookingData);

      toast({
        title: tCommon('messages.success'),
        description: t('toasts.createSuccess'),
      });

      router.push(`/${locale}/dashboard/bookings/${result.id}`);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || t('toasts.createError'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('form.newTitle')}</h1>
        <p className="text-muted-foreground">{t('form.newDescription')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Select the customer for this booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <CustomerSelector
                value={customerId}
                onValueChange={setCustomerId}
              />
              <p className="text-sm text-muted-foreground">
                Search for existing customer or create a new one
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Calendar className="inline h-5 w-5 mr-2" />
              Event Details
            </CardTitle>
            <CardDescription>Optional information about the event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventLocation">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Event Location
                </Label>
                <Input
                  id="eventLocation"
                  type="text"
                  placeholder="Enter event location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requests or notes..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Services / Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <ShoppingCart className="inline h-5 w-5 mr-2" />
                  Services & Items
                </CardTitle>
                <CardDescription>Add services to this booking</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddItem(!showAddItem)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Item Form */}
            {showAddItem && (
              <Card className="border-dashed">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="service">Service *</Label>
                      <Select value={newItemServiceId} onValueChange={setNewItemServiceId}>
                        <SelectTrigger id="service">
                          <SelectValue placeholder="Select a service..." />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingServices ? (
                            <SelectItem value="loading" disabled>
                              Loading services...
                            </SelectItem>
                          ) : (
                            services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{service.name}</span>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Badge variant="outline">{service.kind}</Badge>
                                    <span className="text-sm font-medium">${service.basePrice}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={newItemStartDate}
                        onChange={(e) => setNewItemStartDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={newItemEndDate}
                        onChange={(e) => setNewItemEndDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="itemNotes">Notes</Label>
                      <Input
                        id="itemNotes"
                        type="text"
                        placeholder="Optional notes"
                        value={newItemNotes}
                        onChange={(e) => setNewItemNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddItem(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={addItem}
                      disabled={checkingAvailability}
                    >
                      {checkingAvailability && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add to Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items List */}
            {items.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No services added yet. Click "Add Service" to start building the booking.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.tempId}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{item.serviceName}</h4>
                            <Badge variant="outline">{item.serviceKind}</Badge>
                            {item.availabilityChecked && (
                              <Badge variant={item.isAvailable ? 'default' : 'destructive'}>
                                {item.isAvailable ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Available
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Unavailable
                                  </>
                                )}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>
                              {new Date(item.startDate).toLocaleString()} → {new Date(item.endDate).toLocaleString()}
                            </div>
                            <div>Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.subtotal?.toFixed(2)}</div>
                            {item.notes && <div>Notes: {item.notes}</div>}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.tempId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability Calendar */}
        {items.length > 0 && (
          <BookingAvailabilityCalendar
            cartItems={items.map(item => ({
              serviceId: item.serviceId,
              serviceName: item.serviceName,
              startDate: item.startDate,
              endDate: item.endDate,
              quantity: item.quantity,
            }))}
          />
        )}

        {/* Summary */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/dashboard/bookings`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || items.length === 0}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Booking
          </Button>
        </div>
      </form>
    </div>
  );
}
