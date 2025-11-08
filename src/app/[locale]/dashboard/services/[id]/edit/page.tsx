'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ServiceFormSkeleton } from '@/components/shared/ServiceSkeletons';
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
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import { lookupService } from '@/services/lookupService';
import type { UpdateServiceDto, ServiceDto, ServiceTypeLookup, CategoryLookup } from '@/types/service';
import ImageUpload from '@/components/shared/ImageUpload';
import { UploadContext } from '@/types/upload';

const serviceFormSchema = z.object({
  categoryId: z.string().optional().nullable(),
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
});

export default function EditServicePage({ params: paramsPromise }: { params: Promise<{ id: string; locale: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceDto | null>(null);
  const [categories, setCategories] = useState<CategoryLookup[]>([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState('');
  const [primaryImageId, setPrimaryImageId] = useState('');

  const form = useForm({
    resolver: zodResolver(serviceFormSchema),
    mode: 'onChange',
    defaultValues: {
      categoryId: undefined,
      name: '',
      shortDescription: '',
      description: '',
      currency: 'ETB' as const,
      pricingModel: 'FixedPrice' as const,
      basePrice: undefined as any,
      isFeatured: false,
      leadTimeDays: 1,
      setupTimeMinutes: 0,
      teardownTimeMinutes: 0,
    },
  });

  // Load service and lookups
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [serviceData, categoriesData] = await Promise.all([
          serviceService.getServiceById(params.id),
          lookupService.getCategories(),
        ]);

        setService(serviceData);
        setCategories(categoriesData);

        // Populate form with existing data
        form.reset({
          categoryId: serviceData.category?.id,
          name: serviceData.name,
          shortDescription: serviceData.shortDescription || '',
          description: serviceData.description || '',
          basePrice: serviceData.basePrice,
          currency: serviceData.currency as any,
          pricingModel: serviceData.pricingModel as any,
          minPrice: serviceData.minPrice,
          maxPrice: serviceData.maxPrice,
          minCapacity: serviceData.minCapacity,
          maxCapacity: serviceData.maxCapacity,
          durationMinutes: serviceData.durationMinutes,
          setupTimeMinutes: serviceData.setupTimeMinutes,
          teardownTimeMinutes: serviceData.teardownTimeMinutes,
          leadTimeDays: serviceData.leadTimeDays,
          maxAdvanceBookingDays: serviceData.maxAdvanceBookingDays,
          isFeatured: serviceData.isFeatured,
          metaTitle: serviceData.metaTitle || '',
          metaDescription: serviceData.metaDescription || '',
        });

        // Populate image
        if (serviceData.primaryImageUrl) {
          setPrimaryImageUrl(serviceData.primaryImageUrl);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to load service',
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/services`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, params.locale, router, toast, form]);

  const onSubmit = async (values: z.infer<typeof serviceFormSchema>) => {
    setSaving(true);
    try {
      // Helper to filter out NaN and undefined values
      const filterValue = (val: any) => {
        if (val === undefined || val === null || val === '' || Number.isNaN(val)) {
          return undefined;
        }
        return val;
      };

      const updateDto: UpdateServiceDto = {
        categoryId: filterValue(values.categoryId),
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
      };

      await serviceService.updateService(params.id, updateDto);

      toast({
        title: 'Success',
        description: 'Service updated successfully and sent for admin review',
      });

      router.push(`/${params.locale}/dashboard/services/${params.id}`);
    } catch (error: any) {
      // Check if it's a validation error with details
      const errorData = error.response?.data;
      if (errorData?.errors && typeof errorData.errors === 'object') {
        // Extract validation errors
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');

        toast({
          title: 'Validation Error',
          description: validationErrors,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorData?.detail || errorData?.error || error.message || 'Failed to update service',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ServiceFormSkeleton />;
  }

  if (!service) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
            <p className="text-muted-foreground">
              Update service details
            </p>
          </div>
        </div>
      </div>

      {/* Admin Review Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Admin Review Required</AlertTitle>
        <AlertDescription>
          Any changes made to this service will be sent for admin review before being published.
        </AlertDescription>
      </Alert>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="capacity">Capacity & Timing</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Essential details about your service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Service Type</h4>
                      <p className="text-base font-medium">{service.serviceType.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Cannot be changed after creation</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category (Optional)</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === '__none__' ? undefined : value)}
                            value={field.value || '__none__'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="__none__">No category</SelectItem>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Grand Ballroom Venue" {...field} />
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
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief summary (max 500 characters)" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be shown in service listings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description of your service"
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
                          <FormLabel className="text-base">Featured Service</FormLabel>
                          <FormDescription>
                            Display this service prominently on your page
                          </FormDescription>
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
                  <CardTitle>Service Images</CardTitle>
                  <CardDescription>
                    Add a primary image to showcase your service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Primary Image (Featured Image)
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
                      This image will be displayed prominently in service listings. Recommended size: 1200x675px (16:9 ratio)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Information</CardTitle>
                  <CardDescription>
                    Set your pricing model and rates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="Enter base price"
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
                          <FormLabel>Currency *</FormLabel>
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
                          <FormLabel>Pricing Model *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FixedPrice">Fixed Price</SelectItem>
                              <SelectItem value="PerPerson">Per Person</SelectItem>
                              <SelectItem value="PerHour">Per Hour</SelectItem>
                              <SelectItem value="PerDay">Per Day</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
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
                          <FormLabel>Minimum Price (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseFloat(val) || undefined);
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
                      name="maxPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Price (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseFloat(val) || undefined);
                              }}
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

            {/* Capacity & Timing Tab */}
            <TabsContent value="capacity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Capacity</CardTitle>
                  <CardDescription>
                    Set capacity limits for your service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 10"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val, 10) || undefined);
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
                      name="maxCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 500"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val, 10) || undefined);
                              }}
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
                  <CardTitle>Timing</CardTitle>
                  <CardDescription>
                    Define time requirements and lead times
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 240 (4 hours)"
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === '' ? undefined : parseInt(val, 10) || undefined);
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
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
                          <FormLabel>Setup Time (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 60"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val, 10) || undefined);
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
                      name="teardownTimeMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teardown Time (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 30"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val, 10) || undefined);
                              }}
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
                          <FormLabel>Lead Time (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 7"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val, 10) || undefined);
                              }}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum days notice required
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxAdvanceBookingDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Advance Booking (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 365"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val, 10) || undefined);
                              }}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum days in advance to book
                          </FormDescription>
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
                  <CardTitle>SEO Optimization</CardTitle>
                  <CardDescription>
                    Improve search engine visibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input placeholder="SEO-friendly title" {...field} />
                        </FormControl>
                        <FormDescription>
                          Recommended: 50-60 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="SEO-friendly description"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Recommended: 150-160 characters
                        </FormDescription>
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
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Service
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
