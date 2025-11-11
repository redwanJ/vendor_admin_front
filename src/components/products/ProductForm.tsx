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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import type { CreateProductDto, UpdateProductDto, ProductDto } from '@/types/product';

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Name must be less than 200 characters'),
  slug: z
    .string()
    .max(200, 'Slug must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  categoryId: z.string().uuid('Invalid category ID').optional().or(z.literal('')),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional().or(z.literal('')),
  attributesJson: z.string().optional().or(z.literal('')),
  imagesJson: z.string().optional().or(z.literal('')),
  tags: z.string().max(500, 'Tags must be less than 500 characters').optional().or(z.literal('')),
  metaTitle: z.string().max(200, 'Meta title must be less than 200 characters').optional().or(z.literal('')),
  metaDescription: z
    .string()
    .max(500, 'Meta description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: ProductDto;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export default function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: ProductFormProps) {
  const t = useTranslations('products.form');
  const tCommon = useTranslations('common');

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      categoryId: initialData?.categoryId || '',
      description: initialData?.description || '',
      attributesJson: initialData?.attributes || '{}',
      imagesJson: initialData?.images || '[]',
      tags: initialData?.tags || '',
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
    },
  });

  const handleSubmit = async (values: ProductFormValues) => {
    const data = {
      ...values,
      categoryId: values.categoryId || undefined,
      description: values.description || undefined,
      attributesJson: values.attributesJson || undefined,
      imagesJson: values.imagesJson || undefined,
      tags: values.tags || undefined,
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined,
    };

    if (isEdit) {
      // For update, slug is required
      const updateData: UpdateProductDto = {
        ...data,
        slug: values.slug || initialData?.slug || '',
      };
      await onSubmit(updateData);
    } else {
      await onSubmit(data as CreateProductDto);
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.slug.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.slug.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.slug.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.description.label')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('fields.description.placeholder')} rows={4} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.description.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.tags.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.tags.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.tags.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('attributes.title')}</CardTitle>
            <CardDescription>{t('attributes.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="attributesJson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.attributes.label')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('fields.attributes.placeholder')}
                      className="font-mono text-sm"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('fields.attributes.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imagesJson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.images.label')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('fields.images.placeholder')}
                      className="font-mono text-sm"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('fields.images.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
                  <FormLabel>{t('fields.metaTitle.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fields.metaTitle.placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.metaTitle.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.metaDescription.label')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('fields.metaDescription.placeholder')} rows={3} {...field} />
                  </FormControl>
                  <FormDescription>{t('fields.metaDescription.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
