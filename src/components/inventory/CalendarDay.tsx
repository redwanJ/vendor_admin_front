import { cn } from '@/lib/utils';
import type { AvailabilitySlotDto } from '@/types/inventory';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  availability?: AvailabilitySlotDto;
  totalQuantity: number;
  onClick?: () => void;
}

export default function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  availability,
  totalQuantity,
  onClick,
}: CalendarDayProps) {
  const getAvailabilityColor = (): string => {
    if (!availability) {
      return 'bg-gray-100 dark:bg-gray-800';
    }

    if (availability.isFullyBooked) {
      return 'bg-red-100 dark:bg-red-900/30';
    }

    const availabilityPercentage = (availability.availableQuantity / totalQuantity) * 100;

    if (availabilityPercentage === 100) {
      return 'bg-green-100 dark:bg-green-900/30';
    } else if (availabilityPercentage >= 50) {
      return 'bg-yellow-100 dark:bg-yellow-900/30';
    } else if (availabilityPercentage > 0) {
      return 'bg-orange-100 dark:bg-orange-900/30';
    } else {
      return 'bg-red-100 dark:bg-red-900/30';
    }
  };

  const getAvailabilityText = (): string => {
    if (!availability) {
      return '';
    }

    if (availability.isFullyBooked) {
      return 'Fully Booked';
    }

    return `${availability.availableQuantity}/${totalQuantity}`;
  };

  const getAvailabilityTextColor = (): string => {
    if (!availability) {
      return 'text-gray-500';
    }

    if (availability.isFullyBooked) {
      return 'text-red-700 dark:text-red-300';
    }

    const availabilityPercentage = (availability.availableQuantity / totalQuantity) * 100;

    if (availabilityPercentage === 100) {
      return 'text-green-700 dark:text-green-300';
    } else if (availabilityPercentage >= 50) {
      return 'text-yellow-700 dark:text-yellow-300';
    } else if (availabilityPercentage > 0) {
      return 'text-orange-700 dark:text-orange-300';
    } else {
      return 'text-red-700 dark:text-red-300';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'min-h-24 p-2 border rounded-lg transition-all hover:shadow-md hover:scale-105',
        getAvailabilityColor(),
        !isCurrentMonth && 'opacity-40',
        isToday && 'ring-2 ring-blue-500 ring-offset-2',
        'flex flex-col items-start justify-between'
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={cn(
            'text-sm font-medium',
            isToday && 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center',
            !isToday && !isCurrentMonth && 'text-gray-400',
            !isToday && isCurrentMonth && 'text-gray-900 dark:text-gray-100'
          )}
        >
          {date.getDate()}
        </span>
      </div>

      {availability && (
        <div className="w-full mt-auto">
          <p className={cn('text-xs font-semibold', getAvailabilityTextColor())}>
            {getAvailabilityText()}
          </p>
          {availability.reservedQuantity > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {availability.reservedQuantity} reserved
            </p>
          )}
        </div>
      )}
    </button>
  );
}
