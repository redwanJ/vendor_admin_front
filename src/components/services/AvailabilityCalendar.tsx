'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { serviceService } from '@/services/serviceService';
import type { AvailabilitySlot } from '@/types/rental';

interface AvailabilityCalendarProps {
  serviceId: string;
  serviceName: string;
  inventoryQuantity: number;
}

export default function AvailabilityCalendar({
  serviceId,
  serviceName,
  inventoryQuantity,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailability();
  }, [currentDate, serviceId]);

  const loadAvailability = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get first and last day of the current month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Add a few days buffer to show partial weeks
      const rangeStart = new Date(firstDay);
      rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay()); // Start from Sunday

      const rangeEnd = new Date(lastDay);
      rangeEnd.setDate(rangeEnd.getDate() + (6 - rangeEnd.getDay())); // End on Saturday

      const availabilitySlots = await serviceService.getAvailabilityBreakdown(
        serviceId,
        rangeStart.toISOString(),
        rangeEnd.toISOString()
      );

      setSlots(availabilitySlots);
    } catch (err: any) {
      console.error('Error loading availability:', err);
      setError(err.response?.data?.error || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];

    // Start from Sunday of the first week
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End on Saturday of the last week
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  const getSlotForDate = (date: Date): AvailabilitySlot | null => {
    const dateStr = date.toISOString().split('T')[0];
    return slots.find(slot => {
      const slotDate = new Date(slot.slotStart).toISOString().split('T')[0];
      return slotDate === dateStr;
    }) || null;
  };

  const getAvailabilityColor = (slot: AvailabilitySlot | null) => {
    if (!slot) return 'bg-gray-100 text-gray-400';

    if (slot.isFullyBooked) return 'bg-red-100 text-red-700 border-red-200';

    const percentAvailable = (slot.availableQuantity / slot.totalQuantity) * 100;

    if (percentAvailable === 100) return 'bg-green-100 text-green-700 border-green-200';
    if (percentAvailable >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (percentAvailable > 0) return 'bg-orange-100 text-orange-700 border-orange-200';

    return 'bg-red-100 text-red-700 border-red-200';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Availability Calendar
            </CardTitle>
            <CardDescription>
              View availability for {serviceName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth} disabled={loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} disabled={loading}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth} disabled={loading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-lg font-semibold text-center mt-4">{getMonthName()}</div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span>Fully Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                <span>Mostly Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
                <span>Limited</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                <span>Fully Booked</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Week day headers */}
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((date, index) => {
                const slot = getSlotForDate(date);
                const colorClass = getAvailabilityColor(slot);
                const isTodayDate = isToday(date);
                const isCurrentMonthDate = isCurrentMonth(date);

                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            relative aspect-square p-2 rounded-lg border text-center cursor-pointer
                            transition-all hover:shadow-md
                            ${colorClass}
                            ${!isCurrentMonthDate ? 'opacity-40' : ''}
                            ${isTodayDate ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                          `}
                        >
                          <div className="text-sm font-medium">{date.getDate()}</div>
                          {slot && (
                            <div className="text-xs mt-1">
                              {slot.availableQuantity}/{slot.totalQuantity}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 text-xs">
                          <div className="font-semibold">
                            {date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                          {slot ? (
                            <>
                              <div>Available: {slot.availableQuantity} items</div>
                              <div>Reserved: {slot.reservedQuantity} items</div>
                              <div>Total: {slot.totalQuantity} items</div>
                              {slot.isFullyBooked && (
                                <div className="text-red-600 font-semibold">Fully Booked</div>
                              )}
                            </>
                          ) : (
                            <div>No availability data</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Total Inventory: {inventoryQuantity} items</p>
                  <p>Hover over any day to see detailed availability information.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
