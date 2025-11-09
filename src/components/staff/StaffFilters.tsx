'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelectFilter, MultiSelectFilterBadges } from '@/components/shared/MultiSelectFilter';
import { useTranslations } from 'next-intl';

interface Option { label: string; value: string }

interface StaffFiltersProps {
  searchTerm: string;
  selectedStatuses: string[];
  statusOptions: Option[];
  onSearch: (value: string) => void;
  onStatusChange: (values: string[]) => void;
  onClearAll: () => void;
}

export default function StaffFilters({
  searchTerm,
  selectedStatuses,
  statusOptions,
  onSearch,
  onStatusChange,
  onClearAll,
}: StaffFiltersProps) {
  const t = useTranslations('staff');
  const hasActive = searchTerm || selectedStatuses.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('filters.search')}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter - Multi-select */}
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
          {searchTerm && (
            <span className="text-sm text-muted-foreground">Search: "{searchTerm}"</span>
          )}
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
