'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save } from 'lucide-react';
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
import { useTranslations } from 'next-intl';
import type { CreateLocationDto, UpdateLocationDto, WarehouseLocationDto } from '@/types/warehouse';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  code: z.string().min(1, 'Code is required').max(50),
  type: z.string().optional(),
  isActive: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

interface LocationFormProps {
  initialData?: WarehouseLocationDto;
  warehouseId: string;
  isEdit?: boolean;
  isSubmitting?: boolean;
  onSubmit: (data: CreateLocationDto | UpdateLocationDto) => Promise<void>;
}

export default function LocationForm({ initialData, warehouseId, isEdit = false, isSubmitting = false, onSubmit }: LocationFormProps) {
  const t = useTranslations('warehouses.locations.form');

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      type: initialData?.type || undefined,
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = async (values: Values) => {
    const payload: CreateLocationDto | UpdateLocationDto = isEdit
      ? {
          name: values.name,
          code: values.code,
          type: values.type || undefined,
          isActive: values.isActive ?? true,
        }
      : {
          warehouseId,
          name: values.name,
          code: values.code,
          type: values.type || undefined,
        };

    await onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.type.label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('fields.type.placeholder')} {...field} />
                </FormControl>
                <FormDescription>{t('fields.type.description')}</FormDescription>
                <FormMessage />
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
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? t('actions.saving') : t('actions.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

