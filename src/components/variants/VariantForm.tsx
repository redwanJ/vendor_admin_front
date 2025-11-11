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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import type { CreateVariantDto, UpdateVariantDto, VariantDto } from '@/types/variant';

const variantFormSchema = z.object({
  productId: z.string().uuid('Invalid product ID').optional(),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU must be less than 100 characters'),
  barcode: z.string().max(100, 'Barcode must be less than 100 characters').optional().or(z.literal('')),
  optionsJson: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  currency: z.string().min(3).max(3).optional().or(z.literal('')),
  cost: z.coerce.number().min(0, 'Cost must be a positive number').optional().or(z.literal('')),
  costCurrency: z.string().min(3).max(3).optional().or(z.literal('')),
  trackInventory: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface VariantFormProps {
  productId?: string;
  initialData?: VariantDto;
  onSubmit: (data: CreateVariantDto | UpdateVariantDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export default function VariantForm({
  productId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: VariantFormProps) {
  const t = useTranslations('variants.form');
  const tCommon = useTranslations('common');

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    mode: 'onChange',
    defaultValues: {
      productId: productId || initialData?.productId || '',
      sku: initialData?.sku || '',
      barcode: initialData?.barcode || '',
      optionsJson: initialData?.options || '{}',
      price: initialData?.price || 0,
      currency: initialData?.currency || 'ETB',
      cost: initialData?.cost || undefined,
      costCurrency: initialData?.costCurrency || '',
      trackInventory: initialData?.trackInventory ?? true,
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = async (values: VariantFormValues) => {
    const data = {
      ...values,
      price: Number(values.price),
      cost: values.cost ? Number(values.cost) : undefined,
      currency: values.currency || 'ETB',
      trackInventory: values.trackInventory ?? true,
      ...(isEdit && { isActive: values.isActive ?? true }),
    };

    if (isEdit) {
      const { productId, ...updateData } = data;
      await onSubmit(updateData as UpdateVariantDto);
    } else {
      await onSubmit(data as CreateVariantDto);
    }
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
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.sku.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.sku.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.sku.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.barcode.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.barcode.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.barcode.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="optionsJson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.options.label')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('fields.options.placeholder')}
                      className="font-mono text-sm"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('fields.options.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('pricing.title')}</CardTitle>
            <CardDescription>{t('pricing.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.price.label')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.currency.label')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ETB" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ETB">ETB</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.cost.label')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>{t('fields.cost.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="costCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.costCurrency.label')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ETB" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ETB">ETB</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
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
              name="trackInventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('fields.trackInventory.label')}</FormLabel>
                    <FormDescription>{t('fields.trackInventory.description')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
