'use client';

import { useState, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { serviceService } from '@/services/serviceService';
import type { AvailabilitySlotDto } from '@/types/inventory';

interface CartItem {
  serviceId: string;
  serviceName: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

interface BookingAvailabilityCalendarProps {
  cartItems: CartItem[];
}

interface DayAvailability {
  date: Date;
  isAvailable: boolean;
  isInRange: boolean;
  availabilityDetails: {
    serviceName: string;
    available: number;
    requested: number;
    isAvailable: boolean;
  }[];
}

export default function BookingAvailabilityCalendar({
  cartItems,
}: BookingAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityData, setAvailabilityData] = useState<Map<string, AvailabilitySlotDto[]>>(new Map());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const daysInCalendar = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Load availability data for all cart items
  useEffect(() => {
    if (cartItems.length === 0) {
      setAvailabilityData(new Map());
      return;
    }

    loadAvailabilityForAllItems();
  }, [cartItems, currentDate]);

  const loadAvailabilityForAllItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const newAvailabilityData = new Map<string, AvailabilitySlotDto[]>();

      // Load availability for each unique service in the cart
      const uniqueServiceIds = Array.from(new Set(cartItems.map(item => item.serviceId)));

      await Promise.all(
        uniqueServiceIds.map(async (serviceId) => {
          try {
            const rangeStart = calendarStart.toISOString();
            const rangeEnd = calendarEnd.toISOString();

            const slots = await serviceService.getAvailabilityBreakdown(
              serviceId,
              rangeStart,
              rangeEnd
            );

            newAvailabilityData.set(serviceId, slots);
          } catch (err) {
            console.error(`Failed to load availability for service ${serviceId}:`, err);
          }
        })
      );

      setAvailabilityData(newAvailabilityData);
    } catch (err: any) {
      console.error('Error loading availability:', err);
      setError('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDayAvailability = (date: Date): DayAvailability => {
    const dayAvailability: DayAvailability = {
      date,
      isAvailable: true,
      isInRange: false,
      availabilityDetails: [],
    };

    // Check each cart item
    for (const item of cartItems) {
      const itemStart = new Date(item.startDate);
      const itemEnd = new Date(item.endDate);

      // Check if this date is within the item's date range
      const isInItemRange = isWithinInterval(date, { start: itemStart, end: itemEnd });

      if (isInItemRange) {
        dayAvailability.isInRange = true;

        // Get availability slot for this service on this date
        const serviceSlots = availabilityData.get(item.serviceId) || [];
        const slot = serviceSlots.find(s => {
          const slotDate = new Date(s.slotStart);
          return isSameDay(slotDate, date);
        });

        const itemAvailable = slot ? slot.availableQuantity >= item.quantity : false;

        dayAvailability.availabilityDetails.push({
          serviceName: item.serviceName,
          available: slot?.availableQuantity || 0,
          requested: item.quantity,
          isAvailable: itemAvailable,
        });

        // If any item is unavailable, mark the whole day as unavailable
        if (!itemAvailable) {
          dayAvailability.isAvailable = false;
        }
      }
    }

    return dayAvailability;
  };

  const getDayColor = (dayAvailability: DayAvailability): string => {
    if (!dayAvailability.isInRange) {
      return 'bg-gray-50 dark:bg-gray-900';
    }

    if (!dayAvailability.isAvailable) {
      return 'bg-red-100 dark:bg-red-900/30 border-red-200';
    }

    // Check availability percentage across all services
    const avgAvailability = dayAvailability.availabilityDetails.reduce((sum, detail) => {
      const percentage = (detail.available / Math.max(detail.requested, 1)) * 100;
      return sum + percentage;
    }, 0) / dayAvailability.availabilityDetails.length;

    if (avgAvailability === 100) {
      return 'bg-green-100 dark:bg-green-900/30 border-green-200';
    } else if (avgAvailability >= 75) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200';
    } else {
      return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200';
    }
  };

  const getDayTextColor = (dayAvailability: DayAvailability): string => {
    if (!dayAvailability.isInRange) {
      return 'text-gray-400';
    }

    if (!dayAvailability.isAvailable) {
      return 'text-red-700 dark:text-red-300';
    }

    return 'text-green-700 dark:text-green-300';
  };

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
          <CardDescription>
            Add services to see their availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Add services to your booking to see availability calendar
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Availability Calendar
            </CardTitle>
            <CardDescription>
              Viewing availability for {cartItems.length} service{cartItems.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handlePreviousMonth} disabled={loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={loading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-lg font-semibold text-center mt-2">
          {format(currentDate, 'MMMM yyyy')}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 rounded"></div>
            <span>Mostly Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 rounded"></div>
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border border-red-200 rounded"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-50 dark:bg-gray-900 border rounded"></div>
            <span>Not in Range</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg p-4">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {daysInCalendar.map((date, index) => {
                const dayAvailability = getDayAvailability(date);
                const colorClass = getDayColor(dayAvailability);
                const textColorClass = getDayTextColor(dayAvailability);
                const isTodayDate = isToday(date);
                const isCurrentMonthDate = isSameMonth(date, currentDate);

                return (
                  <div
                    key={index}
                    className={cn(
                      'min-h-20 p-2 border rounded-lg transition-all',
                      colorClass,
                      !isCurrentMonthDate && 'opacity-40',
                      isTodayDate && 'ring-2 ring-blue-500 ring-offset-2',
                      'flex flex-col items-start justify-between'
                    )}
                    title={
                      dayAvailability.isInRange
                        ? dayAvailability.availabilityDetails
                            .map(d => `${d.serviceName}: ${d.available}/${d.requested}`)
                            .join('\n')
                        : ''
                    }
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isTodayDate && 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center',
                        !isTodayDate && !isCurrentMonthDate && 'text-gray-400',
                        !isTodayDate && isCurrentMonthDate && 'text-gray-900 dark:text-gray-100'
                      )}
                    >
                      {date.getDate()}
                    </span>

                    {dayAvailability.isInRange && (
                      <div className="w-full mt-auto">
                        <p className={cn('text-xs font-semibold', textColorClass)}>
                          {dayAvailability.isAvailable ? '✓ Available' : '✗ Unavailable'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Service Details */}
        {!loading && cartItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Services in Cart:</h4>
            <div className="space-y-1 text-xs">
              {cartItems.map((item, index) => (
                <div key={index} className="p-2 bg-muted rounded flex justify-between items-center">
                  <span className="font-medium">{item.serviceName}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(item.startDate), 'MMM d')} - {format(new Date(item.endDate), 'MMM d')} • Qty: {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
