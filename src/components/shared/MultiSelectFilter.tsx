'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectFilterProps {
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select...',
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedCount = selectedValues.length;
  const allSelected = selectedCount === options.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between min-w-[180px]"
        >
          <span className="truncate">
            {selectedCount === 0 ? (
              placeholder
            ) : selectedCount === 1 ? (
              options.find(opt => opt.value === selectedValues[0])?.label
            ) : (
              `${selectedCount} selected`
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">{label}</span>
            {selectedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleClearAll}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Options */}
          <div className="p-2 space-y-1">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => handleToggle(option.value)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(option.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm flex-1">{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Display selected filter values as badges
 */
export function MultiSelectFilterBadges({
  selectedValues,
  options,
  onRemove,
}: {
  selectedValues: string[];
  options: MultiSelectOption[];
  onRemove: (value: string) => void;
}) {
  if (selectedValues.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {selectedValues.map((value) => {
        const option = options.find(opt => opt.value === value);
        if (!option) return null;

        return (
          <Badge
            key={value}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => onRemove(value)}
          >
            {option.label}
            <span className="ml-1 text-xs">×</span>
          </Badge>
        );
      })}
    </div>
  );
}
