'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { warehouseService } from '@/services/warehouseService';
import type { WarehouseDto } from '@/types/warehouse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Building2, CheckCircle2, CircleOff } from 'lucide-react';
import WarehouseLocations from '@/components/warehouses/WarehouseLocations';

export default function WarehouseDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ warehouseId: string; locale: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('warehouses');
  const tCommon = useTranslations('common');
  const [warehouse, setWarehouse] = useState<WarehouseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWarehouse = async () => {
      setLoading(true);
      try {
        const data = await warehouseService.getWarehouseById(params.warehouseId);
        setWarehouse(data);
      } catch (error: any) {
        toast({
          title: tCommon('messages.error'),
          description: error.response?.data?.error || t('toasts.loadError'),
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/warehouses`);
      } finally {
        setLoading(false);
      }
    };

    loadWarehouse();
  }, [params.warehouseId, params.locale, router, toast, t, tCommon]);

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!warehouse) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/${params.locale}/dashboard/warehouses`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
              <p className="text-muted-foreground">{warehouse.code}</p>
            </div>
            {warehouse.isDefault && <Badge variant="secondary">{t('badges.default')}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/${params.locale}/dashboard/warehouses/${warehouse.id}/edit`)}>
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
              <p className="text-sm">{warehouse.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Code</span>
              <p className="text-sm font-mono">{warehouse.code}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('detail.metadata')}</CardTitle>
            <CardDescription>{t('detail.metadataDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('columns.status')}</span>
              <div className="mt-1">
                {warehouse.isActive ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {tCommon('status.active')}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <CircleOff className="h-3 w-3" /> {tCommon('status.inactive')}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('columns.default')}</span>
              <div className="mt-1">
                {warehouse.isDefault ? (
                  <Badge variant="secondary">{t('badges.default')}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.address')}</CardTitle>
          <CardDescription>{t('detail.addressDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {warehouse.address ? (
            <div className="text-sm">
              <div>{warehouse.address.street}{warehouse.address.street2 ? `, ${warehouse.address.street2}` : ''}</div>
              <div>
                {warehouse.address.city}
                {warehouse.address.state ? `, ${warehouse.address.state}` : ''}
                {warehouse.address.postalCode ? ` ${warehouse.address.postalCode}` : ''}
              </div>
              <div>{warehouse.address.country}</div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">{t('detail.noAddress')}</span>
          )}
        </CardContent>
      </Card>

      <WarehouseLocations warehouseId={warehouse.id} />
    </div>
  );
}
