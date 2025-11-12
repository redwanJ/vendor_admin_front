'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

interface WarehousesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function WarehousesFilters({ searchTerm, onSearchChange }: WarehousesFiltersProps) {
  const t = useTranslations('warehouses');
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('filters.searchPlaceholder')}
            value={localSearch}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
      </div>
    </div>
  );
}

