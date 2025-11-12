'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import type { CreateWarehouseDto, UpdateWarehouseDto, WarehouseDto } from '@/types/warehouse';

const warehouseFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code must be less than 50 characters'),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  // address fields are optional; enforce presence only on submit when provided
  addressStreet: z.string().optional(),
  addressStreet2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

interface WarehouseFormProps {
  initialData?: WarehouseDto;
  onSubmit: (data: CreateWarehouseDto | UpdateWarehouseDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export default function WarehouseForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: WarehouseFormProps) {
  const t = useTranslations('warehouses.form');
  const tCommon = useTranslations('common');

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      isDefault: initialData?.isDefault ?? false,
      isActive: initialData?.isActive ?? true,
      addressStreet: initialData?.address?.street || '',
      addressStreet2: initialData?.address?.street2 || '',
      addressCity: initialData?.address?.city || '',
      addressState: initialData?.address?.state || '',
      addressPostalCode: initialData?.address?.postalCode || '',
      addressCountry: initialData?.address?.country || '',
    },
  });

  const handleSubmit = async (values: WarehouseFormValues) => {
    // Only send address if required fields are present
    const street = values.addressStreet?.trim();
    const city = values.addressCity?.trim();
    const country = values.addressCountry?.trim();

    const address = street && city && country
      ? {
          street,
          street2: values.addressStreet2?.trim() || undefined,
          city,
          state: values.addressState?.trim() || undefined,
          postalCode: values.addressPostalCode?.trim() || undefined,
          country,
        }
      : undefined;

    const data: CreateWarehouseDto | UpdateWarehouseDto = {
      name: values.name,
      code: values.code,
      isDefault: values.isDefault ?? false,
      ...(isEdit ? { isActive: values.isActive ?? true } : {}),
      ...(address ? { address } : {}),
    };

    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo.title')}</CardTitle>
            <CardDescription>{t('basicInfo.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.name.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.name.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.name.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.code.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.code.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.code.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('address.title')}</CardTitle>
          <CardDescription>{t('address.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="addressStreet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.address.street.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.address.street.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.address.street.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressStreet2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.address.street2.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.address.street2.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.address.street2.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.address.city.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.address.city.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.address.city.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.address.state.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.address.state.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.address.state.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressPostalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.address.postalCode.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.address.postalCode.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.address.postalCode.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.address.country.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.address.country.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.address.country.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.title')}</CardTitle>
            <CardDescription>{t('settings.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('fields.isDefault.label')}</FormLabel>
                    <FormDescription>{t('fields.isDefault.description')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('fields.isActive.label')}</FormLabel>
                      <FormDescription>{t('fields.isActive.description')}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tCommon('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? tCommon('actions.saving') : tCommon('actions.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
