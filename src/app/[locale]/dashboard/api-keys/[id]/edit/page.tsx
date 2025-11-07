'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ServiceFormSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { apiKeyService } from '@/services/apiKeyService';
import type { UpdateApiKeyDto, ApiKeyDto } from '@/types/apiKey';

const updateApiKeyFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  expiresAt: z.string().optional(),
  scopes: z.array(z.string()).default([]),
  allowedIps: z.string().optional(),
  allowedOrigins: z.string().optional(),
});

const AVAILABLE_SCOPES = [
  { value: 'catalog:read', label: 'Read Catalog', description: 'View services and categories' },
  { value: 'catalog:write', label: 'Write Catalog', description: 'Create/update services' },
  { value: 'bookings:read', label: 'Read Bookings', description: 'View bookings' },
  { value: 'bookings:write', label: 'Write Bookings', description: 'Create/update bookings' },
];

export default function EditApiKeyPage({ params: paramsPromise }: { params: Promise<{ id: string; locale: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<ApiKeyDto | null>(null);

  const form = useForm({
    resolver: zodResolver(updateApiKeyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      scopes: [],
    },
  });

  // Load API key
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const apiKeyData = await apiKeyService.getApiKeyById(params.id);
        setApiKey(apiKeyData);

        // Set form values
        form.reset({
          name: apiKeyData.name,
          description: apiKeyData.description || '',
          expiresAt: apiKeyData.expiresAt ? apiKeyData.expiresAt.split('T')[0] : '',
          scopes: apiKeyData.scopes || [],
          allowedIps: apiKeyData.allowedIps?.join(', ') || '',
          allowedOrigins: apiKeyData.allowedOrigins?.join(', ') || '',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to load API key',
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/api-keys`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, params.locale, router, toast, form]);

  const onSubmit = async (values: z.infer<typeof updateApiKeyFormSchema>) => {
    setSaving(true);
    try {
      const dto: UpdateApiKeyDto = {
        name: values.name,
        description: values.description,
        scopes: values.scopes.length > 0 ? values.scopes : undefined,
        expiresAt: values.expiresAt || undefined,
        allowedIps: values.allowedIps ? values.allowedIps.split(',').map(ip => ip.trim()) : undefined,
        allowedOrigins: values.allowedOrigins ? values.allowedOrigins.split(',').map(o => o.trim()) : undefined,
      };

      await apiKeyService.updateApiKey(params.id, dto);

      toast({
        title: 'Success',
        description: 'API key updated successfully',
      });

      router.push(`/${params.locale}/dashboard/api-keys/${params.id}`);
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.errors && typeof errorData.errors === 'object') {
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
          description: errorData?.detail || errorData?.error || error.message || 'Failed to update API key',
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

  if (!apiKey) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/${params.locale}/dashboard/api-keys/${params.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit API Key</h1>
          <p className="text-muted-foreground">
            Update API key configuration and permissions
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Key Prefix</label>
                <p className="text-base font-mono">{apiKey.keyPrefix}...</p>
                <p className="text-xs text-muted-foreground">The API key itself cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tier</label>
                <p className="text-base">{apiKey.tier}</p>
                <p className="text-xs text-muted-foreground">Tier cannot be changed after creation</p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., My Mobile App" {...field} />
                    </FormControl>
                    <FormDescription>
                      A friendly name to identify this API key
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What is this API key used for?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty for no expiration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions (Scopes)</CardTitle>
              <CardDescription>
                Select what this API key can access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="scopes"
                render={() => (
                  <FormItem>
                    <div className="space-y-3">
                      {AVAILABLE_SCOPES.map((scope) => (
                        <FormField
                          key={scope.value}
                          control={form.control}
                          name="scopes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={scope.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(scope.value)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        // When checking a scope
                                        const newScopes = [...(field.value || []), scope.value];

                                        // If checking a write scope, automatically add read scope
                                        if (scope.value.endsWith(':write')) {
                                          const readScope = scope.value.replace(':write', ':read');
                                          if (!newScopes.includes(readScope)) {
                                            newScopes.push(readScope);
                                          }
                                        }

                                        return field.onChange(newScopes);
                                      } else {
                                        // When unchecking a scope
                                        let newScopes = field.value?.filter((value) => value !== scope.value) || [];

                                        // If unchecking a read scope, also remove write scope
                                        if (scope.value.endsWith(':read')) {
                                          const writeScope = scope.value.replace(':read', ':write');
                                          newScopes = newScopes.filter((value) => value !== writeScope);
                                        }

                                        return field.onChange(newScopes);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-medium">
                                    {scope.label}
                                  </FormLabel>
                                  <FormDescription>{scope.description}</FormDescription>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Security Settings (Premium only) */}
          {apiKey.tier === 'Premium' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Premium feature: Restrict access by IP and origin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="allowedIps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed IP Addresses (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of allowed IPs. Leave empty to allow all.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowedOrigins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed Origins (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., https://example.com, https://app.example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of allowed origins for CORS. Leave empty to allow all.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${params.locale}/dashboard/api-keys/${params.id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
