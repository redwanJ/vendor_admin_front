'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { variantService } from '@/services/variantService';
import { stockService } from '@/services/stockService';
import type { VariantDto } from '@/types/variant';
import type { StockByLocationDto } from '@/types/stock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Package, DollarSign, Barcode, TrendingUp } from 'lucide-react';

export default function VariantDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ variantId: string; productId: string; locale: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('variants');
  const tCommon = useTranslations('common');
  const [variant, setVariant] = useState<VariantDto | null>(null);
  const [stockLevels, setStockLevels] = useState<StockByLocationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(true);

  useEffect(() => {
    const loadVariant = async () => {
      setLoading(true);
      try {
        const data = await variantService.getVariantById(params.variantId);
        setVariant(data);
      } catch (error: any) {
        toast({
          title: tCommon('messages.error'),
          description: error.response?.data?.error || t('toasts.loadError'),
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/products/${params.productId}/variants`);
      } finally {
        setLoading(false);
      }
    };

    loadVariant();
  }, [params.variantId, params.productId, params.locale, router, toast, t, tCommon]);

  useEffect(() => {
    const loadStock = async () => {
      if (!variant || !variant.trackInventory) {
        setStockLoading(false);
        return;
      }

      setStockLoading(true);
      try {
        const data = await stockService.getStockByVariant(params.variantId);
        setStockLevels(data);
      } catch (error: any) {
        console.error('Failed to load stock:', error);
        // Don't show error toast for stock, just log it
      } finally {
        setStockLoading(false);
      }
    };

    if (variant) {
      loadStock();
    }
  }, [variant, params.variantId]);

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!variant) {
    return null;
  }

  const totalStock = stockLevels.reduce((sum, loc) => sum + loc.onHandQty, 0);
  const totalReserved = stockLevels.reduce((sum, loc) => sum + loc.reservedQty, 0);
  const totalAvailable = stockLevels.reduce((sum, loc) => sum + loc.availableQty, 0);

  const profitMargin = variant.cost
    ? (((variant.price - variant.cost) / variant.price) * 100).toFixed(1)
    : null;

  const parseOptions = () => {
    try {
      return JSON.parse(variant.options);
    } catch {
      return {};
    }
  };

  const options = parseOptions();
  const optionEntries = Object.entries(options);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${params.locale}/dashboard/products/${params.productId}/variants`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{variant.sku}</h1>
            {variant.barcode && (
              <p className="text-muted-foreground flex items-center gap-1">
                <Barcode className="h-3 w-3" />
                {variant.barcode}
              </p>
            )}
          </div>
          <Badge variant={variant.isActive ? 'default' : 'secondary'}>
            {variant.isActive ? t('status.active') : t('status.inactive')}
          </Badge>
        </div>
        <Button onClick={() => router.push(`/${params.locale}/dashboard/products/${params.productId}/variants/${variant.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          {t('actions.edit')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Price Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('detail.price')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {variant.price.toFixed(2)} {variant.currency}
            </div>
            {variant.cost && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('detail.cost')}: {variant.cost.toFixed(2)} {variant.costCurrency || variant.currency}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Profit Margin Card */}
        {profitMargin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('detail.margin')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profitMargin}%</div>
              <p className="text-xs text-muted-foreground mt-1">Profit margin</p>
            </CardContent>
          </Card>
        )}

        {/* Total Stock Card */}
        {variant.trackInventory && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('detail.totalStock')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStock}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('stock.onHand')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('detail.availableStock')}</CardTitle>
                <Package className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalAvailable}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalReserved} {t('stock.reserved')}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('detail.basicInfo')}</CardTitle>
            <CardDescription>{t('detail.basicInfoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('detail.sku')}</span>
              <p className="text-sm font-mono">{variant.sku}</p>
            </div>
            {variant.barcode && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">{t('detail.barcode')}</span>
                <p className="text-sm font-mono">{variant.barcode}</p>
              </div>
            )}
            {optionEntries.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">{t('detail.options')}</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {optionEntries.map(([key, value]) => (
                    <Badge key={key} variant="outline">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('detail.settings')}</CardTitle>
            <CardDescription>{t('detail.settingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('detail.trackInventory')}</span>
              <p className="text-sm">
                <Badge variant={variant.trackInventory ? 'default' : 'secondary'}>
                  {variant.trackInventory ? t('status.tracked') : t('status.notTracked')}
                </Badge>
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('detail.isActive')}</span>
              <p className="text-sm">
                <Badge variant={variant.isActive ? 'default' : 'secondary'}>
                  {variant.isActive ? t('status.active') : t('status.inactive')}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        {variant.trackInventory && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t('stock.byLocation')}</CardTitle>
              <CardDescription>{t('detail.stockDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {stockLoading ? (
                <p className="text-sm text-muted-foreground">{tCommon('actions.loading')}</p>
              ) : stockLevels.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('stock.noStock')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('stock.location')}</TableHead>
                      <TableHead className="text-right">{t('stock.onHand')}</TableHead>
                      <TableHead className="text-right">{t('stock.reserved')}</TableHead>
                      <TableHead className="text-right">{t('stock.available')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLevels.map((stock) => (
                      <TableRow key={stock.locationId}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{stock.locationCode}</p>
                            {stock.locationType && (
                              <p className="text-xs text-muted-foreground">{stock.locationType}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{stock.onHandQty}</TableCell>
                        <TableCell className="text-right">{stock.reservedQty}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {stock.availableQty}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
