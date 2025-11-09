'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ServiceFormSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import { lookupService } from '@/services/lookupService';
import ServiceForm from '@/components/services/ServiceForm';
import type { UpdateServiceDto, ServiceDto, CategoryLookup } from '@/types/service';

export default function EditServicePage({ params: paramsPromise }: { params: Promise<{ id: string; locale: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceDto | null>(null);
  const [categories, setCategories] = useState<CategoryLookup[]>([]);

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
  }, [params.id, params.locale, router, toast]);

  const handleSubmit = async (data: UpdateServiceDto) => {
    setSaving(true);
    try {
      await serviceService.updateService(params.id, data);

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
      <ServiceForm
        mode="edit"
        initialData={service}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={saving}
      />
    </div>
  );
}
