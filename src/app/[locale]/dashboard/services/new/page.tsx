'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import { lookupService } from '@/services/lookupService';
import ServiceForm from '@/components/services/ServiceForm';
import type { CreateServiceDto, ServiceTypeLookup, CategoryLookup } from '@/types/service';

export default function NewServicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeLookup[]>([]);
  const [categories, setCategories] = useState<CategoryLookup[]>([]);

  // Load lookups
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [serviceTypesData, categoriesData] = await Promise.all([
          lookupService.getServiceTypes(),
          lookupService.getCategories(),
        ]);
        setServiceTypes(serviceTypesData);
        setCategories(categoriesData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load form options',
          variant: 'destructive',
        });
      }
    };
    loadLookups();
  }, [toast]);

  const handleSubmit = async (data: CreateServiceDto) => {
    setSaving(true);
    try {
      await serviceService.createService(data);

      toast({
        title: 'Success',
        description: 'Service created successfully',
      });

      router.push('/en/dashboard/services');
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
          description: errorData?.detail || errorData?.error || error.message || 'Failed to create service',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Create New Service</h1>
            <p className="text-muted-foreground">
              Add a new service to your catalog
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ServiceForm
        mode="create"
        serviceTypes={serviceTypes}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={saving}
      />
    </div>
  );
}
