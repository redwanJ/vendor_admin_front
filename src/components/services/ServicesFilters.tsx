'use client';

import { Button } from '@/components/ui/button';
import { MultiSelectFilter, MultiSelectFilterBadges } from '@/components/shared/MultiSelectFilter';
import { useTranslations } from 'next-intl';

interface Option { label: string; value: string }

interface ServicesFiltersProps {
  statusOptions: Option[];
  serviceTypeOptions: Option[];
  categoryOptions: Option[];
  selectedStatuses: string[];
  selectedServiceTypes: string[];
  selectedCategories: string[];
  onStatusChange: (values: string[]) => void;
  onServiceTypeChange: (values: string[]) => void;
  onCategoryChange: (values: string[]) => void;
  onClearAll: () => void;
}

export default function ServicesFilters({
  statusOptions,
  serviceTypeOptions,
  categoryOptions,
  selectedStatuses,
  selectedServiceTypes,
  selectedCategories,
  onStatusChange,
  onServiceTypeChange,
  onCategoryChange,
  onClearAll,
}: ServicesFiltersProps) {
  const t = useTranslations('services');
  const hasActive = selectedStatuses.length > 0 || selectedServiceTypes.length > 0 || selectedCategories.length > 0;

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
          label={t('filters.type')}
          options={serviceTypeOptions}
          selectedValues={selectedServiceTypes}
          onChange={onServiceTypeChange}
          placeholder={t('filters.allTypes')}
        />
        <MultiSelectFilter
          label={t('filters.category')}
          options={categoryOptions}
          selectedValues={selectedCategories}
          onChange={onCategoryChange}
          placeholder={t('filters.allCategories')}
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
            selectedValues={selectedServiceTypes}
            options={serviceTypeOptions}
            onRemove={(value) => onServiceTypeChange(selectedServiceTypes.filter(v => v !== value))}
          />
          <MultiSelectFilterBadges
            selectedValues={selectedCategories}
            options={categoryOptions}
            onRemove={(value) => onCategoryChange(selectedCategories.filter(v => v !== value))}
          />
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7">
            {t('actions.clearAll')}
          </Button>
        </div>
      )}
    </div>
  );
}
