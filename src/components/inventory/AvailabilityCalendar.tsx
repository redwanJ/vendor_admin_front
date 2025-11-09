'use client';

import { useState } from 'react';
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
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import CalendarDay from './CalendarDay';
import type { AvailabilitySlotDto } from '@/types/inventory';

interface AvailabilityCalendarProps {
  availabilityData: AvailabilitySlotDto[];
  totalQuantity: number;
  loading?: boolean;
  onDateClick?: (date: Date, availability?: AvailabilitySlotDto) => void;
  onMonthChange?: (startDate: Date, endDate: Date) => void;
}

export default function AvailabilityCalendar({
  availabilityData,
  totalQuantity,
  loading = false,
  onDateClick,
  onMonthChange,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const daysInCalendar = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);

    if (onMonthChange) {
      const start = startOfMonth(newDate);
      const end = endOfMonth(newDate);
      onMonthChange(start, end);
    }
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);

    if (onMonthChange) {
      const start = startOfMonth(newDate);
      const end = endOfMonth(newDate);
      onMonthChange(start, end);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);

    if (onMonthChange) {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      onMonthChange(start, end);
    }
  };

  const getAvailabilityForDate = (date: Date): AvailabilitySlotDto | undefined => {
    return availabilityData.find((slot) => {
      const slotDate = new Date(slot.slotStart);
      return isSameDay(slotDate, date);
    });
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={handleToday}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border" />
          <span>Fully Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border" />
          <span>Partially Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30 border" />
          <span>Low Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border" />
          <span>Fully Booked</span>
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
          <div className="grid grid-cols-7 gap-2">
            {daysInCalendar.map((date, index) => (
              <div
                key={index}
                className="min-h-24 border rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {daysInCalendar.map((date, index) => {
              const availability = getAvailabilityForDate(date);
              return (
                <CalendarDay
                  key={index}
                  date={date}
                  isCurrentMonth={isSameMonth(date, currentDate)}
                  isToday={isToday(date)}
                  availability={availability}
                  totalQuantity={totalQuantity}
                  onClick={() => onDateClick?.(date, availability)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && availabilityData.length > 0 && (
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-card border rounded-lg">
            <p className="text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-bold">{totalQuantity}</p>
          </div>
          <div className="p-3 bg-card border rounded-lg">
            <p className="text-muted-foreground">Avg. Available</p>
            <p className="text-2xl font-bold">
              {Math.round(
                availabilityData.reduce((sum, slot) => sum + slot.availableQuantity, 0) /
                  availabilityData.length
              )}
            </p>
          </div>
          <div className="p-3 bg-card border rounded-lg">
            <p className="text-muted-foreground">Fully Booked Days</p>
            <p className="text-2xl font-bold">
              {availabilityData.filter((slot) => slot.isFullyBooked).length}
            </p>
          </div>
          <div className="p-3 bg-card border rounded-lg">
            <p className="text-muted-foreground">Available Days</p>
            <p className="text-2xl font-bold">
              {availabilityData.filter((slot) => slot.availableQuantity > 0).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
