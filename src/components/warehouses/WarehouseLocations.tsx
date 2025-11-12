'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { warehouseService } from '@/services/warehouseService';
import { locationService } from '@/services/locationService';
import type { WarehouseLocationDto, CreateLocationDto, UpdateLocationDto } from '@/types/warehouse';
import LocationForm from './LocationForm';

export default function WarehouseLocations({ warehouseId }: { warehouseId: string }) {
  const t = useTranslations('warehouses.locations');
  const tCommon = useTranslations('common');
  const { toast } = useToast();
  const [locations, setLocations] = useState<WarehouseLocationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [editLocation, setEditLocation] = useState<WarehouseLocationDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await warehouseService.getWarehouseLocations(warehouseId);
      setLocations(result);
    } catch (error: any) {
      toast({ title: tCommon('messages.error'), description: t('toasts.loadError'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [warehouseId, tCommon, toast, t]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: CreateLocationDto) => {
    setSubmitting(true);
    try {
      await locationService.createLocation(data);
      setOpenCreate(false);
      await load();
      toast({ title: tCommon('messages.success'), description: t('toasts.createSuccess') });
    } catch (error: any) {
      toast({ title: tCommon('messages.error'), description: t('toasts.createError'), variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async (data: UpdateLocationDto) => {
    if (!editLocation) return;
    setSubmitting(true);
    try {
      await locationService.updateLocation(editLocation.id, data);
      setEditLocation(null);
      await load();
      toast({ title: tCommon('messages.success'), description: t('toasts.updateSuccess') });
    } catch (error: any) {
      toast({ title: tCommon('messages.error'), description: t('toasts.updateError'), variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (loc: WarehouseLocationDto) => {
    try {
      await locationService.deleteLocation(loc.id);
      await load();
      toast({ title: tCommon('messages.success'), description: t('toasts.deleteSuccess') });
    } catch (error: any) {
      toast({ title: tCommon('messages.error'), description: t('toasts.deleteError'), variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> {t('actions.add')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('createTitle')}</DialogTitle>
            </DialogHeader>
            <LocationForm warehouseId={warehouseId} onSubmit={handleCreate} isSubmitting={submitting} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">{t('loading')}</div>
        ) : locations.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">{t('empty')}</div>
        ) : (
          <div className="rounded-md border divide-y">
            {locations.map((loc) => (
              <div key={loc.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{loc.name}</span>
                      {loc.type && <Badge variant="secondary">{loc.type}</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{loc.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={loc.isActive ? 'default' : 'destructive'}>
                    {loc.isActive ? t('badges.active') : t('badges.inactive')}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditLocation(loc)}>
                        <Edit className="h-4 w-4 mr-2" /> {t('actions.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(loc)}>
                        <Trash2 className="h-4 w-4 mr-2" /> {t('actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!editLocation} onOpenChange={(o) => !o && setEditLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editTitle')}</DialogTitle>
          </DialogHeader>
          {editLocation && (
            <LocationForm initialData={editLocation} warehouseId={warehouseId} isEdit onSubmit={handleUpdate} isSubmitting={submitting} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

