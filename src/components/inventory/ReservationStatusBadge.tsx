import { Badge } from '@/components/ui/badge';
import type { ReservationStatus, ReservationType } from '@/types/inventory';

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  type?: ReservationType;
}

export default function ReservationStatusBadge({ status, type }: ReservationStatusBadgeProps) {
  const getStatusColor = (status: ReservationStatus): string => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'InUse':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'NoShow':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type?: ReservationType): string | null => {
    if (!type) return null;
    switch (type) {
      case 'SoftHold':
        return '🕐';
      case 'Booking':
        return '📅';
      case 'Maintenance':
        return '🔧';
      case 'Blocked':
        return '🚫';
      default:
        return null;
    }
  };

  const typeIcon = getTypeIcon(type);

  return (
    <Badge className={getStatusColor(status)}>
      {typeIcon && <span className="mr-1">{typeIcon}</span>}
      {status}
    </Badge>
  );
}
