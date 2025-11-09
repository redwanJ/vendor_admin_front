'use client';

import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/shared/ImageUpload';
import { UploadContext } from '@/types/upload';
import RentalConfigurationFields from './RentalConfigurationFields';
import type {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceDto,
  ServiceTypeLookup,
  CategoryLookup
} from '@/types/service';
import type { ServiceKind, RentalPeriodUnit } from '@/types/rental';

// Rental configuration schema (conditional based on kind)
const rentalConfigSchema = z.object({
  inventoryQuantity: z.number().int().min(1, 'Inventory quantity must be at least 1'),
  rentalPeriodUnit: z.enum(['Hour', 'Day', 'Week', 'Month']),
  minimumRentalPeriod: z.number().int().min(1, 'Minimum rental period must be at least 1'),
  depositAmount: z.number().min(0).optional().or(z.nan()),
  bufferTimeBefore: z.number().int().min(0).optional().or(z.nan()),
  bufferTimeAfter: z.number().int().min(0).optional().or(z.nan()),
  allowSimultaneousBookings: z.boolean().default(false),
});

// Main service form schema
const createServiceFormSchema = z.object({
  serviceTypeId: z.string().min(1, 'Service type is required'),
  categoryId: z.string().optional().nullable(),
  kind: z.enum(['Standard', 'Rental', 'Package']),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  shortDescription: z.string().max(500, 'Short description must be less than 500 characters').optional(),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  basePrice: z.number().min(0.01, 'Base price is required and must be greater than 0'),
  currency: z.enum(['ETB', 'USD', 'EUR']),
  pricingModel: z.enum(['FixedPrice', 'PerPerson', 'PerHour', 'PerDay', 'Custom']),
  minPrice: z.number().min(0).optional().or(z.nan()),
  maxPrice: z.number().min(0).optional().or(z.nan()),
  minCapacity: z.number().int().positive().optional().or(z.nan()),
  maxCapacity: z.number().int().positive().optional().or(z.nan()),
  durationMinutes: z.number().int().positive().optional().or(z.nan()),
  setupTimeMinutes: z.number().int().min(0).optional().or(z.nan()),
  teardownTimeMinutes: z.number().int().min(0).optional().or(z.nan()),
  leadTimeDays: z.number().int().min(0).optional().or(z.nan()),
  maxAdvanceBookingDays: z.number().int().positive().optional().or(z.nan()),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(200, 'Meta title must be less than 200 characters').optional(),
  metaDescription: z.string().max(500, 'Meta description must be less than 500 characters').optional(),
  rentalConfiguration: rentalConfigSchema.optional(),
}).refine(
  (data) => {
    // If kind is Rental, rentalConfiguration is required
    if (data.kind === 'Rental') {
      return data.rentalConfiguration !== undefined;
    }
    return true;
  },
  {
    message: 'Rental configuration is required for rental services',
    path: ['rentalConfiguration'],
  }
);

const updateServiceFormSchema = createServiceFormSchema.omit({ serviceTypeId: true });

type CreateServiceFormValues = z.infer<typeof createServiceFormSchema>;
type UpdateServiceFormValues = z.infer<typeof updateServiceFormSchema>;

interface ServiceFormProps {
  mode: 'create' | 'edit';
  initialData?: ServiceDto;
  serviceTypes?: ServiceTypeLookup[];
  categories: CategoryLookup[];
  onSubmit: (data: any) => Promise<void>; // Use any to avoid union type issues
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ServiceForm({
  mode,
  initialData,
  serviceTypes,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
}: ServiceFormProps) {
  const t = useTranslations('services.form');
  const tCommon = useTranslations('common');

  const [primaryImageUrl, setPrimaryImageUrl] = React.useState(initialData?.primaryImageUrl || '');
  const [primaryImageId, setPrimaryImageId] = React.useState('');

  // Use CreateServiceFormValues as the base type to avoid union type issues
  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(mode === 'create' ? createServiceFormSchema : updateServiceFormSchema) as any,
    mode: 'onChange',
    defaultValues: mode === 'create' ? {
      serviceTypeId: '',
      categoryId: undefined,
      kind: 'Standard',
      name: '',
      shortDescription: '',
      description: '',
      currency: 'ETB',
      pricingModel: 'FixedPrice',
      basePrice: undefined as any,
      isFeatured: false,
      leadTimeDays: 1,
      setupTimeMinutes: 0,
      teardownTimeMinutes: 0,
      rentalConfiguration: undefined,
    } : {
      serviceTypeId: initialData?.serviceType?.id || '', // Dummy value for type compatibility
      categoryId: initialData?.category?.id || undefined,
      kind: initialData?.kind || 'Standard',
      name: initialData?.name || '',
      shortDescription: initialData?.shortDescription || '',
      description: initialData?.description || '',
      currency: initialData?.currency as any || 'ETB',
      pricingModel: initialData?.pricingModel as any || 'FixedPrice',
      basePrice: initialData?.basePrice,
      minPrice: initialData?.minPrice,
      maxPrice: initialData?.maxPrice,
      minCapacity: initialData?.minCapacity,
      maxCapacity: initialData?.maxCapacity,
      durationMinutes: initialData?.durationMinutes,
      setupTimeMinutes: initialData?.setupTimeMinutes,
      teardownTimeMinutes: initialData?.teardownTimeMinutes,
      leadTimeDays: initialData?.leadTimeDays,
      maxAdvanceBookingDays: initialData?.maxAdvanceBookingDays,
      isFeatured: initialData?.isFeatured || false,
      metaTitle: initialData?.metaTitle,
      metaDescription: initialData?.metaDescription,
      rentalConfiguration: initialData?.rentalConfiguration,
    },
  });

  // Watch the kind field to show/hide rental configuration
  const selectedKind = form.watch('kind');

  const handleSubmit = async (values: CreateServiceFormValues) => {
    // Helper to filter out NaN and undefined values
    const filterValue = (val: any) => {
      if (val === undefined || val === null || val === '' || Number.isNaN(val)) {
        return undefined;
      }
      return val;
    };

    const baseDto = {
      categoryId: filterValue(values.categoryId),
      kind: values.kind,
      name: values.name,
      shortDescription: filterValue(values.shortDescription),
      description: filterValue(values.description),
      basePrice: values.basePrice,
      currency: values.currency,
      pricingModel: values.pricingModel,
      minPrice: filterValue(values.minPrice),
      maxPrice: filterValue(values.maxPrice),
      minCapacity: filterValue(values.minCapacity),
      maxCapacity: filterValue(values.maxCapacity),
      durationMinutes: filterValue(values.durationMinutes),
      setupTimeMinutes: filterValue(values.setupTimeMinutes),
      teardownTimeMinutes: filterValue(values.teardownTimeMinutes),
      leadTimeDays: filterValue(values.leadTimeDays),
      maxAdvanceBookingDays: filterValue(values.maxAdvanceBookingDays),
      isFeatured: values.isFeatured,
      primaryImageUrl: filterValue(primaryImageUrl),
      metaTitle: filterValue(values.metaTitle),
      metaDescription: filterValue(values.metaDescription),
      rentalConfiguration: values.kind === 'Rental' && values.rentalConfiguration ? {
        inventoryQuantity: values.rentalConfiguration.inventoryQuantity,
        rentalPeriodUnit: values.rentalConfiguration.rentalPeriodUnit,
        minimumRentalPeriod: values.rentalConfiguration.minimumRentalPeriod,
        depositAmount: filterValue(values.rentalConfiguration.depositAmount),
        bufferTimeBefore: filterValue(values.rentalConfiguration.bufferTimeBefore),
        bufferTimeAfter: filterValue(values.rentalConfiguration.bufferTimeAfter),
        allowSimultaneousBookings: values.rentalConfiguration.allowSimultaneousBookings,
      } : undefined,
    };

    if (mode === 'create') {
      await onSubmit({
        ...baseDto,
        serviceTypeId: values.serviceTypeId,
      } as CreateServiceDto);
    } else {
      // Remove serviceTypeId for update mode
      const { serviceTypeId, ...updateData } = baseDto as any;
      await onSubmit(updateData as UpdateServiceDto);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
            <TabsTrigger value="images">{t('tabs.images')}</TabsTrigger>
            <TabsTrigger value="pricing">{t('tabs.pricing')}</TabsTrigger>
            {selectedKind === 'Rental' && (
              <TabsTrigger value="rental">{t('tabs.rental')}</TabsTrigger>
            )}
            <TabsTrigger value="capacity">{t('tabs.capacity')}</TabsTrigger>
            <TabsTrigger value="seo">{t('tabs.seo')}</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('basic.title')}</CardTitle>
                <CardDescription>{t('basic.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mode === 'create' && serviceTypes && (
                    <FormField
                      control={form.control}
                      name="serviceTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('basic.serviceType')} *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('basic.selectServiceType')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceTypes.map(type => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('basic.category')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === '__none__' ? undefined : value)}
                          value={field.value || '__none__'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('basic.selectCategory')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">{t('basic.noCategory')}</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="kind"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('basic.kind')} *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset rental configuration when switching away from Rental
                            if (value !== 'Rental') {
                              form.setValue('rentalConfiguration', undefined);
                            } else {
                              // Set default rental configuration
                              form.setValue('rentalConfiguration', {
                                inventoryQuantity: 1,
                                rentalPeriodUnit: 'Day',
                                minimumRentalPeriod: 1,
                                depositAmount: undefined,
                                bufferTimeBefore: undefined,
                                bufferTimeAfter: undefined,
                                allowSimultaneousBookings: false,
                              });
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('basic.selectKind')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Standard">{t('basic.kinds.standard')}</SelectItem>
                            <SelectItem value="Rental">{t('basic.kinds.rental')}</SelectItem>
                            <SelectItem value="Package">{t('basic.kinds.package')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>{t('basic.kindDescription')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('basic.name')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('basic.namePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('basic.shortDescription')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('basic.shortDescriptionPlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('basic.shortDescriptionHint')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('basic.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('basic.descriptionPlaceholder')}
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t('basic.featured')}</FormLabel>
                        <FormDescription>{t('basic.featuredDescription')}</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('images.title')}</CardTitle>
                <CardDescription>{t('images.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('images.primaryImage')}
                  </label>
                  <ImageUpload
                    context={UploadContext.ServicePrimaryImage}
                    value={primaryImageUrl}
                    uploadId={primaryImageId}
                    onChange={(url, id) => {
                      setPrimaryImageUrl(url);
                      setPrimaryImageId(id);
                    }}
                    maxSize={5 * 1024 * 1024}
                    aspectRatio="16/9"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('images.primaryImageHint')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('pricing.title')}</CardTitle>
                <CardDescription>{t('pricing.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('pricing.basePrice')} *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder={t('pricing.basePricePlaceholder')}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('pricing.currency')} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ETB">ETB (Ethiopian Birr)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricingModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('pricing.pricingModel')} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FixedPrice">{t('pricing.models.fixed')}</SelectItem>
                            <SelectItem value="PerPerson">{t('pricing.models.perPerson')}</SelectItem>
                            <SelectItem value="PerHour">{t('pricing.models.perHour')}</SelectItem>
                            <SelectItem value="PerDay">{t('pricing.models.perDay')}</SelectItem>
                            <SelectItem value="Custom">{t('pricing.models.custom')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('pricing.minPrice')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('pricing.maxPrice')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rental Configuration Tab - Only shown for Rental services */}
          {selectedKind === 'Rental' && (
            <TabsContent value="rental" className="space-y-6">
              <RentalConfigurationFields form={form} disabled={isSubmitting} />
            </TabsContent>
          )}

          {/* Capacity & Timing Tab */}
          <TabsContent value="capacity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('capacity.title')}</CardTitle>
                <CardDescription>{t('capacity.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('capacity.min')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('capacity.max')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('timing.title')}</CardTitle>
                <CardDescription>{t('timing.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('timing.duration')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="240"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>{t('timing.durationHint')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="setupTimeMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('timing.setup')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="60"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teardownTimeMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('timing.teardown')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="leadTimeDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('timing.leadTime')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="7"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>{t('timing.leadTimeHint')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxAdvanceBookingDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('timing.maxAdvance')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="365"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>{t('timing.maxAdvanceHint')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('seo.title')}</CardTitle>
                <CardDescription>{t('seo.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('seo.metaTitle')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('seo.metaTitlePlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('seo.metaTitleHint')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('seo.metaDescription')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('seo.metaDescriptionPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{t('seo.metaDescriptionHint')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tCommon('actions.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              tCommon('messages.saving')
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? tCommon('actions.create') : tCommon('actions.save')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
