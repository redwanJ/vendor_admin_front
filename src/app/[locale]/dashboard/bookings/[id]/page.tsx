'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/services/bookingService';
import type { BookingDto } from '@/types/booking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  ArrowLeft,
  Edit,
  XCircle,
  CheckCircle2,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Package,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const bookingId = params?.id as string;
  const { toast } = useToast();
  const t = useTranslations('bookings');
  const tCommon = useTranslations('common');

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const result = await bookingService.getBookingById(bookingId);
      setBooking(result);
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || 'Failed to load booking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: tCommon('messages.error'),
        description: 'Please provide a cancellation reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCancelling(true);
      await bookingService.cancelBooking(bookingId, { reason: cancelReason });

      toast({
        title: tCommon('messages.success'),
        description: 'Booking cancelled successfully',
      });

      // Reload booking to show updated status
      await loadBooking();
      setCancelReason('');
    } catch (error: any) {
      toast({
        title: tCommon('messages.error'),
        description: error.response?.data?.error || 'Failed to cancel booking',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
      Draft: { variant: 'secondary', icon: <FileText className="h-3 w-3" /> },
      Confirmed: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
      PendingPayment: { variant: 'outline', icon: <Clock className="h-3 w-3" /> },
      InProgress: { variant: 'default', icon: <Clock className="h-3 w-3" /> },
      Completed: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
      Cancelled: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
      NoShow: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
    };

    const config = statusMap[status] || { variant: 'outline' as const, icon: null };

    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      Pending: { variant: 'outline' },
      PartiallyPaid: { variant: 'secondary' },
      Paid: { variant: 'default' },
      Refunded: { variant: 'destructive' },
      Failed: { variant: 'destructive' },
    };

    const config = statusMap[status] || { variant: 'outline' as const };

    return (
      <Badge variant={config.variant}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}/dashboard/bookings`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Booking not found
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const canCancel = booking.status !== 'Cancelled' && booking.status !== 'Completed' && booking.status !== 'NoShow';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/dashboard/bookings`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Booking #{booking.bookingNumber}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(booking.status)}
            {getPaymentStatusBadge(booking.paymentStatus)}
          </div>
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Booking
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-4">
                  <Label htmlFor="cancelReason">Cancellation Reason *</Label>
                  <Textarea
                    id="cancelReason"
                    placeholder="Please provide a reason for cancellation..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelBooking}
                    disabled={cancelling || !cancelReason.trim()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Cancellation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Cancellation Info */}
      {booking.status === 'Cancelled' && booking.cancellationReason && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Booking Cancelled</p>
              <p className="text-sm">{booking.cancellationReason}</p>
              {booking.cancelledAt && (
                <p className="text-xs">
                  Cancelled on {new Date(booking.cancelledAt).toLocaleString()}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{booking.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{booking.customerEmail}</p>
              </div>
            </div>
            {booking.customerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{booking.customerPhone}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      {(booking.eventDate || booking.eventLocation) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.eventDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-medium">
                      {new Date(booking.eventDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {booking.eventLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{booking.eventLocation}</p>
                  </div>
                </div>
              )}
            </div>
            {booking.specialRequests && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                <p className="text-sm">{booking.specialRequests}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Services & Items
          </CardTitle>
          <CardDescription>{booking.items.length} item(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {booking.items.map((item, index) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h4 className="font-semibold">{item.serviceName}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(item.startDate).toLocaleString()} →{' '}
                          {new Date(item.endDate).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)} = $
                        {item.subtotal.toFixed(2)}
                      </div>
                      {item.tax > 0 && <div>Tax: ${item.tax.toFixed(2)}</div>}
                      {item.notes && <div>Notes: {item.notes}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${item.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${booking.subtotal.toFixed(2)}</span>
            </div>
            {booking.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${booking.taxAmount.toFixed(2)}</span>
              </div>
            )}
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span className="font-medium">-${booking.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${booking.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-medium text-green-600">${booking.paidAmount.toFixed(2)}</span>
            </div>
            {booking.totalAmount - booking.paidAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance Due</span>
                <span className="font-medium text-orange-600">
                  ${(booking.totalAmount - booking.paidAmount).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          {booking.paymentMethod && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium">{booking.paymentMethod}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Booking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(booking.createdAt).toLocaleString()}</span>
          </div>
          {booking.updatedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{new Date(booking.updatedAt).toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
