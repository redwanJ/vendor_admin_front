'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Users, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import type { ServiceDto } from '@/types/service';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Draft: 'secondary',
  PendingApproval: 'outline',
  Active: 'default',
  Inactive: 'outline',
  Archived: 'destructive',
};

export default function ServiceDetailPage({ params: paramsPromise }: { params: Promise<{ id: string; locale: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const [service, setService] = useState<ServiceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      setLoading(true);
      try {
        const data = await serviceService.getServiceById(params.id);
        setService(data);
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

    loadService();
  }, [params.id, params.locale, router, toast]);

  const handleEdit = () => {
    router.push(`/${params.locale}/dashboard/services/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await serviceService.deleteService(params.id);
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
      router.push(`/${params.locale}/dashboard/services`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete service',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <ServiceDetailSkeleton />;
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
            onClick={() => router.push(`/${params.locale}/dashboard/services`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
              <Badge variant={statusColors[service.status] || 'default'}>
                {service.status}
              </Badge>
              {service.isFeatured && <span className="text-2xl">⭐</span>}
            </div>
            <p className="text-muted-foreground">{service.shortDescription}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handleDelete} variant="destructive" disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {service.description || 'No description provided'}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Service Type</h4>
                  <p className="text-base">{service.serviceType.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <p className="text-base">{service.category?.name || 'None'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Slug</h4>
                  <p className="text-base font-mono text-sm">{service.slug}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Base Price</h4>
                  <p className="text-2xl font-bold">
                    {service.currency} {service.basePrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{service.pricingModel}</p>
                </div>
                {(service.minPrice || service.maxPrice) && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Price Range</h4>
                    <p className="text-base">
                      {service.minPrice && `${service.currency} ${service.minPrice.toLocaleString()}`}
                      {service.minPrice && service.maxPrice && ' - '}
                      {service.maxPrice && `${service.currency} ${service.maxPrice.toLocaleString()}`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Capacity & Timing */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity & Timing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {(service.minCapacity || service.maxCapacity) && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Capacity</h4>
                      <p className="text-base">
                        {service.minCapacity && service.maxCapacity
                          ? `${service.minCapacity} - ${service.maxCapacity} guests`
                          : service.minCapacity
                          ? `Min ${service.minCapacity} guests`
                          : `Max ${service.maxCapacity} guests`}
                      </p>
                    </div>
                  </div>
                )}

                {service.durationMinutes && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                      <p className="text-base">
                        {Math.floor(service.durationMinutes / 60)}h {service.durationMinutes % 60}m
                      </p>
                    </div>
                  </div>
                )}

                {(service.setupTimeMinutes || service.teardownTimeMinutes) && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Setup/Teardown</h4>
                      <p className="text-base">
                        {service.setupTimeMinutes ? `${service.setupTimeMinutes}m setup` : ''}
                        {service.setupTimeMinutes && service.teardownTimeMinutes && ' / '}
                        {service.teardownTimeMinutes ? `${service.teardownTimeMinutes}m teardown` : ''}
                      </p>
                    </div>
                  </div>
                )}

                {service.leadTimeDays && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Lead Time</h4>
                      <p className="text-base">{service.leadTimeDays} days</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {service.location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {service.location.street && <p>{service.location.street}</p>}
                  <p>
                    {[service.location.city, service.location.state, service.location.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {service.location.country && <p>{service.location.country}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          {service.primaryImageUrl && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={service.primaryImageUrl}
                  alt={service.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Information */}
          {(service.metaTitle || service.metaDescription) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.metaTitle && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Meta Title</h4>
                    <p className="text-sm">{service.metaTitle}</p>
                  </div>
                )}
                {service.metaDescription && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Meta Description
                    </h4>
                    <p className="text-sm">{service.metaDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                <p className="text-sm">{new Date(service.createdAt).toLocaleString()}</p>
              </div>
              {service.updatedAt && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                  <p className="text-sm">{new Date(service.updatedAt).toLocaleString()}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Tenant</h4>
                <p className="text-sm">{service.tenant.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
