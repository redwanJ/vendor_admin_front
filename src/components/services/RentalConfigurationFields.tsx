'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { RentalPeriodUnit } from '@/types/rental';

interface RentalConfigurationFieldsProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

export default function RentalConfigurationFields({
  form,
  disabled = false,
}: RentalConfigurationFieldsProps) {
  const t = useTranslations('services.form.rental');
  const tCommon = useTranslations('common');

  const rentalPeriodUnits: RentalPeriodUnit[] = ['Hour', 'Day', 'Week', 'Month'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inventory Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            {t('inventory.title')}
          </h3>

          <FormField
            control={form.control}
            name="rentalConfiguration.inventoryQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('inventory.quantity')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={disabled}
                  />
                </FormControl>
                <FormDescription>{t('inventory.quantityDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rentalConfiguration.allowSimultaneousBookings"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t('inventory.simultaneousBookings')}
                  </FormLabel>
                  <FormDescription>
                    {t('inventory.simultaneousBookingsDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Rental Period Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t('period.title')}</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rentalConfiguration.rentalPeriodUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('period.unit')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('period.selectUnit')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rentalPeriodUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {t(`period.units.${unit.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('period.unitDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rentalConfiguration.minimumRentalPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('period.minimum')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormDescription>{t('period.minimumDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Financial Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t('financial.title')}</h3>

          <FormField
            control={form.control}
            name="rentalConfiguration.depositAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('financial.deposit')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    value={field.value || ''}
                    disabled={disabled}
                  />
                </FormControl>
                <FormDescription>{t('financial.depositDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Buffer Times Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <h3 className="text-sm font-medium">{t('buffer.title')}</h3>
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          </div>
          <p className="text-sm text-muted-foreground">{t('buffer.description')}</p>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rentalConfiguration.bufferTimeBefore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('buffer.before')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="15"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ''}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormDescription>{t('buffer.beforeDescription')}</FormDescription>
                  <FormMessage />
                </FormItem> 
              )}
            />

            <FormField
              control={form.control}
              name="rentalConfiguration.bufferTimeAfter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('buffer.after')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="15"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ''}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormDescription>{t('buffer.afterDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
