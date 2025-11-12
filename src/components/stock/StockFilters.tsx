'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTranslations } from 'next-intl';
import { lookupService } from '@/services/lookupService';
import type { WarehouseLookup, LocationLookup } from '@/types/lookups';

interface StockFiltersProps {
  search: string;
  warehouseIds: string[];
  locationIds: string[];
  onSearchChange: (value: string) => void;
  onWarehouseIdsChange: (ids: string[]) => void;
  onLocationIdsChange: (ids: string[]) => void;
}

export default function StockFilters({
  search,
  warehouseIds,
  locationIds,
  onSearchChange,
  onWarehouseIdsChange,
  onLocationIdsChange,
}: StockFiltersProps) {
  const t = useTranslations('inventory.stockList');
  const [warehouses, setWarehouses] = useState<WarehouseLookup[]>([]);
  const [locations, setLocations] = useState<LocationLookup[]>([]);

  useEffect(() => {
    lookupService.getWarehouses(undefined, 100).then(setWarehouses).catch(() => setWarehouses([]));
  }, []);

  useEffect(() => {
    // If filtering by warehouses, load locations per first warehouse; otherwise load all
    const load = async () => {
      if (warehouseIds.length === 1) {
        const locs = await lookupService.getLocations(warehouseIds[0], undefined, 200);
        setLocations(locs);
      } else {
        // For simplicity, do not auto-load all locations when multiple warehouses selected
        const locs = await lookupService.getLocations(undefined, undefined, 200);
        setLocations(locs);
      }
    };
    load().catch(() => setLocations([]));
  }, [warehouseIds]);

  const selectedWarehouses = useMemo(
    () => warehouses.filter((w) => warehouseIds.includes(w.id)),
    [warehouses, warehouseIds]
  );
  const selectedLocations = useMemo(
    () => locations.filter((l) => locationIds.includes(l.id)),
    [locations, locationIds]
  );

  const toggleWarehouse = (id: string) => {
    if (warehouseIds.includes(id)) onWarehouseIdsChange(warehouseIds.filter((x) => x !== id));
    else onWarehouseIdsChange([...warehouseIds, id]);
  };
  const toggleLocation = (id: string) => {
    if (locationIds.includes(id)) onLocationIdsChange(locationIds.filter((x) => x !== id));
    else onLocationIdsChange([...locationIds, id]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('filters.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Warehouses multi-select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {t('filters.warehouses')} {warehouseIds.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {warehouseIds.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput placeholder={t('filters.warehouses')} />
              <CommandList>
                <CommandEmpty>No warehouses found.</CommandEmpty>
                <CommandGroup>
                  {warehouses.map((w) => {
                    const checked = warehouseIds.includes(w.id);
                    return (
                      <CommandItem key={w.id} onSelect={() => toggleWarehouse(w.id)}>
                        <Checkbox checked={checked} className="mr-2" />
                        <span className="font-mono mr-2">{w.code}</span>
                        <span className="text-muted-foreground truncate">{w.name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Locations multi-select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {t('filters.locations')} {locationIds.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {locationIds.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput placeholder={t('filters.locations')} />
              <CommandList>
                <CommandEmpty>No locations found.</CommandEmpty>
                <CommandGroup>
                  {locations.map((l) => {
                    const checked = locationIds.includes(l.id);
                    return (
                      <CommandItem key={l.id} onSelect={() => toggleLocation(l.id)}>
                        <Checkbox checked={checked} className="mr-2" />
                        <span className="font-mono mr-2">{l.code}</span>
                        <span className="text-muted-foreground truncate">{l.name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {(warehouseIds.length > 0 || locationIds.length > 0 || search) && (
          <Button
            variant="ghost"
            onClick={() => {
              onSearchChange('');
              onWarehouseIdsChange([]);
              onLocationIdsChange([]);
            }}
          >
            {t('filters.clearAll')}
          </Button>
        )}
      </div>

      {(selectedWarehouses.length > 0 || selectedLocations.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          {selectedWarehouses.length > 0 && (
            <span>{t('filters.selectedWarehouses', { count: selectedWarehouses.length })}</span>
          )}
          {selectedLocations.length > 0 && (
            <span>{t('filters.selectedLocations', { count: selectedLocations.length })}</span>
          )}
        </div>
      )}
    </div>
  );
}
