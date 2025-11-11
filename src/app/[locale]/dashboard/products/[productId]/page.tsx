'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { productService } from '@/services/productService';
import type { ProductDto } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Package } from 'lucide-react';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Draft: 'outline',
  Active: 'default',
  Inactive: 'secondary',
  Archived: 'destructive',
};

export default function ProductDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ productId: string; locale: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(params.productId);
        setProduct(data);
      } catch (error: any) {
        toast({
          title: tCommon('messages.error'),
          description: error.response?.data?.error || t('toasts.loadError'),
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/products`);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.productId, params.locale, router, toast, t, tCommon]);

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!product) {
    return null;
  }

  const tags = product.tags ? product.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/${params.locale}/dashboard/products`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">{product.slug}</p>
          </div>
          <Badge variant={statusColors[product.status] || 'default'}>{t(`status.${product.status}` as any)}</Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/${params.locale}/dashboard/products/${product.id}/variants`)}>
            <Package className="h-4 w-4 mr-2" />
            {t('actions.manageVariants')}
          </Button>
          <Button onClick={() => router.push(`/${params.locale}/dashboard/products/${product.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            {t('actions.edit')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('detail.basicInfo')}</CardTitle>
            <CardDescription>{t('detail.basicInfoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('columns.name')}</span>
              <p className="text-sm">{product.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('detail.slug')}</span>
              <p className="text-sm font-mono">{product.slug}</p>
            </div>
            {product.description && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">{t('detail.description')}</span>
                <p className="text-sm">{product.description}</p>
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">{t('columns.tags')}</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('detail.metadata')}</CardTitle>
            <CardDescription>{t('detail.metadataDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('detail.createdAt')}</span>
              <p className="text-sm">{new Date(product.createdAt).toLocaleString()}</p>
            </div>
            {product.updatedAt && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">{t('detail.updatedAt')}</span>
                <p className="text-sm">{new Date(product.updatedAt).toLocaleString()}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('columns.status')}</span>
              <div className="mt-1">
                <Badge variant={statusColors[product.status] || 'default'}>{t(`status.${product.status}` as any)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {product.attributes && product.attributes !== '{}' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.attributes')}</CardTitle>
              <CardDescription>{t('detail.attributesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(JSON.parse(product.attributes), null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {product.images && product.images !== '[]' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.images')}</CardTitle>
              <CardDescription>{t('detail.imagesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(JSON.parse(product.images), null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {(product.metaTitle || product.metaDescription) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t('detail.seo')}</CardTitle>
              <CardDescription>{t('detail.seoDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.metaTitle && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('detail.metaTitle')}</span>
                  <p className="text-sm">{product.metaTitle}</p>
                </div>
              )}
              {product.metaDescription && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('detail.metaDescription')}</span>
                  <p className="text-sm">{product.metaDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
