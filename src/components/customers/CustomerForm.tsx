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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import type { CreateCustomerDto, UpdateCustomerDto, CustomerDto, CustomerType } from '@/types/customer';

const customerFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200, 'Full name must be less than 200 characters'),
  email: z.string().email('Invalid email format').max(255, 'Email must be less than 255 characters'),
  phoneNumber: z.string().max(20, 'Phone number must be less than 20 characters').optional().or(z.literal('')),
  alternatePhone: z.string().max(20, 'Alternate phone must be less than 20 characters').optional().or(z.literal('')),
  customerType: z.enum(['Individual', 'Business', 'EventPlanner']),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')), // Comma-separated tags
  preferredContactMethod: z.string().max(50).optional().or(z.literal('')),
  // Address fields
  addressStreet: z.string().max(200).optional().or(z.literal('')),
  addressCity: z.string().max(100).optional().or(z.literal('')),
  addressState: z.string().max(100).optional().or(z.literal('')),
  addressPostalCode: z.string().max(20).optional().or(z.literal('')),
  addressCountry: z.string().max(100).optional().or(z.literal('')),
  // Social media
  facebookUrl: z.string().max(500).optional().or(z.literal('')),
  instagramUrl: z.string().max(500).optional().or(z.literal('')),
  linkedInUrl: z.string().max(500).optional().or(z.literal('')),
  // Business fields
  companyName: z.string().max(200).optional().or(z.literal('')),
  taxIdNumber: z.string().max(50).optional().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  initialData?: CustomerDto;
  onSubmit: (data: CreateCustomerDto | UpdateCustomerDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export default function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: CustomerFormProps) {
  const t = useTranslations('customers.form');
  const tCommon = useTranslations('common');

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      alternatePhone: initialData?.alternatePhone || '',
      customerType: (initialData?.customerType as CustomerType) || 'Individual',
      notes: initialData?.notes || '',
      tags: initialData?.tags?.join(', ') || '',
      preferredContactMethod: initialData?.preferredContactMethod || '',
      addressStreet: initialData?.address?.street || '',
      addressCity: initialData?.address?.city || '',
      addressState: initialData?.address?.state || '',
      addressPostalCode: initialData?.address?.postalCode || '',
      addressCountry: initialData?.address?.country || '',
      facebookUrl: initialData?.facebookUrl || '',
      instagramUrl: initialData?.instagramUrl || '',
      linkedInUrl: initialData?.linkedInUrl || '',
      companyName: initialData?.companyName || '',
      taxIdNumber: initialData?.taxIdNumber || '',
    },
  });

  const handleSubmit = async (values: CustomerFormValues) => {
    const hasAddress = values.addressStreet || values.addressCity || values.addressState || values.addressPostalCode || values.addressCountry;

    const data: CreateCustomerDto | UpdateCustomerDto = {
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phoneNumber || undefined,
      alternatePhone: values.alternatePhone || undefined,
      ...(isEdit ? {} : { customerType: values.customerType as CustomerType }),
      notes: values.notes || undefined,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      preferredContactMethod: values.preferredContactMethod || undefined,
      address: hasAddress ? {
        street: values.addressStreet || '',
        city: values.addressCity || '',
        state: values.addressState || '',
        postalCode: values.addressPostalCode || '',
        country: values.addressCountry || '',
      } : undefined,
      facebookUrl: values.facebookUrl || undefined,
      instagramUrl: values.instagramUrl || undefined,
      linkedInUrl: values.linkedInUrl || undefined,
      companyName: values.companyName || undefined,
      taxIdNumber: values.taxIdNumber || undefined,
    };

    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tCommon('actions.back')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? tCommon('actions.saving') : tCommon('actions.save')}
          </Button>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
            <TabsTrigger value="address">{t('tabs.address')}</TabsTrigger>
            <TabsTrigger value="social">{t('tabs.social')}</TabsTrigger>
            <TabsTrigger value="notes">{t('tabs.notes')}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.basicInfo')}</CardTitle>
                <CardDescription>{t('sections.basicInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.fullName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholders.fullName')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('placeholders.email')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.phoneNumber')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholders.phoneNumber')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alternatePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.alternatePhone')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholders.alternatePhone')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.customerType')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEdit}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('placeholders.customerType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Individual">{t('customerTypes.Individual')}</SelectItem>
                            <SelectItem value="Business">{t('customerTypes.Business')}</SelectItem>
                            <SelectItem value="EventPlanner">{t('customerTypes.EventPlanner')}</SelectItem>
                          </SelectContent>
                        </Select>
                        {isEdit && <FormDescription>{t('fields.customerTypeReadonly')}</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredContactMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.preferredContactMethod')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('placeholders.preferredContactMethod')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Email">{t('contactMethods.Email')}</SelectItem>
                            <SelectItem value="Phone">{t('contactMethods.Phone')}</SelectItem>
                            <SelectItem value="WhatsApp">{t('contactMethods.WhatsApp')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('customerType') === 'Business' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('fields.companyName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('placeholders.companyName')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxIdNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('fields.taxIdNumber')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('placeholders.taxIdNumber')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.tags')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.tags')} {...field} />
                      </FormControl>
                      <FormDescription>{t('fields.tagsDesc')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.address')}</CardTitle>
                <CardDescription>{t('sections.addressDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="addressStreet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.addressStreet')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.addressStreet')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="addressCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.addressCity')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholders.addressCity')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.addressState')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholders.addressState')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="addressPostalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.addressPostalCode')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholders.addressPostalCode')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.addressCountry')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholders.addressCountry')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.socialMedia')}</CardTitle>
                <CardDescription>{t('sections.socialMediaDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.facebookUrl')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.facebookUrl')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.instagramUrl')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.instagramUrl')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedInUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.linkedInUrl')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholders.linkedInUrl')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.notes')}</CardTitle>
                <CardDescription>{t('sections.notesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.notes')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('placeholders.notes')}
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
