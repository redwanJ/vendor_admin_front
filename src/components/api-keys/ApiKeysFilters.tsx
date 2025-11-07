'use client';

import { Button } from '@/components/ui/button';
import { MultiSelectFilter, MultiSelectFilterBadges } from '@/components/shared/MultiSelectFilter';
import { useTranslations } from 'next-intl';

interface Option { label: string; value: string }

interface ApiKeysFiltersProps {
  statusOptions: Option[];
  tierOptions: Option[];
  environmentOptions: Option[];
  selectedStatuses: string[];
  selectedTiers: string[];
  selectedEnvironments: string[];
  onStatusChange: (values: string[]) => void;
  onTierChange: (values: string[]) => void;
  onEnvironmentChange: (values: string[]) => void;
  onClearAll: () => void;
}

export default function ApiKeysFilters({
  statusOptions,
  tierOptions,
  environmentOptions,
  selectedStatuses,
  selectedTiers,
  selectedEnvironments,
  onStatusChange,
  onTierChange,
  onEnvironmentChange,
  onClearAll,
}: ApiKeysFiltersProps) {
  const t = useTranslations('apiKeys');
  const hasActive = selectedStatuses.length > 0 || selectedTiers.length > 0 || selectedEnvironments.length > 0;

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
          label={t('filters.tier')}
          options={tierOptions}
          selectedValues={selectedTiers}
          onChange={onTierChange}
          placeholder={t('filters.allTiers')}
        />
        <MultiSelectFilter
          label={t('filters.environment')}
          options={environmentOptions}
          selectedValues={selectedEnvironments}
          onChange={onEnvironmentChange}
          placeholder={t('filters.allEnvironments')}
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
            selectedValues={selectedTiers}
            options={tierOptions}
            onRemove={(value) => onTierChange(selectedTiers.filter(v => v !== value))}
          />
          <MultiSelectFilterBadges
            selectedValues={selectedEnvironments}
            options={environmentOptions}
            onRemove={(value) => onEnvironmentChange(selectedEnvironments.filter(v => v !== value))}
          />
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7">
            {t('actions.clearAll')}
          </Button>
        </div>
      )}
    </div>
  );
}
