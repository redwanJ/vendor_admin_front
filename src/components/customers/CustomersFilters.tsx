'use client';

import { Button } from '@/components/ui/button';
import { MultiSelectFilter, MultiSelectFilterBadges } from '@/components/shared/MultiSelectFilter';
import { useTranslations } from 'next-intl';

interface Option { label: string; value: string }

interface CustomersFiltersProps {
  customerTypeOptions: Option[];
  statusOptions: Option[];
  selectedCustomerTypes: string[];
  selectedStatuses: string[];
  onCustomerTypeChange: (values: string[]) => void;
  onStatusChange: (values: string[]) => void;
  onClearAll: () => void;
}

export default function CustomersFilters({
  customerTypeOptions,
  statusOptions,
  selectedCustomerTypes,
  selectedStatuses,
  onCustomerTypeChange,
  onStatusChange,
  onClearAll,
}: CustomersFiltersProps) {
  const t = useTranslations('customers');
  const hasActive = selectedCustomerTypes.length > 0 || selectedStatuses.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <MultiSelectFilter
          label={t('filters.customerType')}
          options={customerTypeOptions}
          selectedValues={selectedCustomerTypes}
          onChange={onCustomerTypeChange}
          placeholder={t('filters.allCustomerTypes')}
        />
        <MultiSelectFilter
          label={t('filters.status')}
          options={statusOptions}
          selectedValues={selectedStatuses}
          onChange={onStatusChange}
          placeholder={t('filters.allStatuses')}
        />
      </div>

      {hasActive && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('filters.activeFilters')}</span>
          <MultiSelectFilterBadges
            selectedValues={selectedCustomerTypes}
            options={customerTypeOptions}
            onRemove={(value) => onCustomerTypeChange(selectedCustomerTypes.filter(v => v !== value))}
          />
          <MultiSelectFilterBadges
            selectedValues={selectedStatuses}
            options={statusOptions}
            onRemove={(value) => onStatusChange(selectedStatuses.filter(v => v !== value))}
          />
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7">
            {t('actions.clearAll')}
          </Button>
        </div>
      )}
    </div>
  );
}
