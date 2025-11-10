'use client';

import { Button } from '@/components/ui/button';
import { MultiSelectFilter, MultiSelectFilterBadges } from '@/components/shared/MultiSelectFilter';
import { useTranslations } from 'next-intl';

interface Option { label: string; value: string }

interface BookingsFiltersProps {
  statusOptions: Option[];
  paymentStatusOptions: Option[];
  selectedStatuses: string[];
  selectedPaymentStatuses: string[];
  onStatusChange: (values: string[]) => void;
  onPaymentStatusChange: (values: string[]) => void;
  onClearAll: () => void;
}

export default function BookingsFilters({
  statusOptions,
  paymentStatusOptions,
  selectedStatuses,
  selectedPaymentStatuses,
  onStatusChange,
  onPaymentStatusChange,
  onClearAll,
}: BookingsFiltersProps) {
  const t = useTranslations('bookings');
  const hasActive = selectedStatuses.length > 0 || selectedPaymentStatuses.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <MultiSelectFilter
          label={t('filters.status')}
          options={statusOptions}
          selectedValues={selectedStatuses}
          onChange={onStatusChange}
          placeholder={t('filters.allStatuses')}
        />
        <MultiSelectFilter
          label={t('filters.paymentStatus')}
          options={paymentStatusOptions}
          selectedValues={selectedPaymentStatuses}
          onChange={onPaymentStatusChange}
          placeholder={t('filters.allPaymentStatuses')}
        />
      </div>

      {hasActive && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('filters.activeFilters')}</span>
          <MultiSelectFilterBadges
            selectedValues={selectedStatuses}
            options={statusOptions}
            onRemove={(value) => onStatusChange(selectedStatuses.filter(v => v !== value))}
          />
          <MultiSelectFilterBadges
            selectedValues={selectedPaymentStatuses}
            options={paymentStatusOptions}
            onRemove={(value) => onPaymentStatusChange(selectedPaymentStatuses.filter(v => v !== value))}
          />
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7">
            {t('actions.clearAll')}
          </Button>
        </div>
      )}
    </div>
  );
}
