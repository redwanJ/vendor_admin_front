'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, AlertCircle, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiKeyService } from '@/services/apiKeyService';
import type { CreateApiKeyDto, ApiKeyCreatedDto } from '@/types/apiKey';

const apiKeyFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tier: z.enum(['Public', 'Basic', 'Premium']),
  environment: z.enum(['production', 'staging', 'development']).default('production'),
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

export default function NewApiKeyPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKeyCreatedDto | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(true);

  const form = useForm({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      tier: 'Basic',
      environment: 'production',
      scopes: [],
    },
  });

  const selectedTier = form.watch('tier');

  const onSubmit = async (values: z.infer<typeof apiKeyFormSchema>) => {
    setSaving(true);
    try {
      const dto: CreateApiKeyDto = {
        name: values.name,
        tier: values.tier,
        description: values.description,
        environment: values.environment,
        scopes: values.scopes.length > 0 ? values.scopes : undefined,
        expiresAt: values.expiresAt || undefined,
        allowedIps: values.allowedIps ? values.allowedIps.split(',').map(ip => ip.trim()) : undefined,
        allowedOrigins: values.allowedOrigins ? values.allowedOrigins.split(',').map(o => o.trim()) : undefined,
      };

      const result = await apiKeyService.createApiKey(dto);
      setCreatedKey(result);

      toast({
        title: 'Success',
        description: 'API key created successfully',
      });
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
          description: errorData?.detail || errorData?.error || error.message || 'Failed to create API key',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey.plainTextKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard',
      });
    }
  };

  // If API key was created, show the key
  if (createdKey) {
    return (
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${locale}/dashboard/api-keys`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Key Created</h1>
            <p className="text-muted-foreground">
              Save this key now - you won't be able to see it again!
            </p>
          </div>
        </div>

        {/* Warning Alert */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>⚠️ Important Security Notice</AlertTitle>
          <AlertDescription>
            This is the only time you'll see the full API key. Copy it now and store it securely.
            If you lose this key, you'll need to create a new one.
          </AlertDescription>
        </Alert>

        {/* API Key Display */}
        <Card>
          <CardHeader>
            <CardTitle>Your New API Key</CardTitle>
            <CardDescription>
              {createdKey.name} ({createdKey.tier})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">API Key</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show
                    </>
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={createdKey.plainTextKey}
                  readOnly
                  type={showKey ? 'text' : 'password'}
                  className="font-mono text-sm"
                />
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Key Prefix</label>
              <p className="text-sm font-mono text-muted-foreground">
                {createdKey.keyPrefix}... (for identification)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Environment</label>
              <p className="text-sm text-muted-foreground">{createdKey.environment}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Created</label>
              <p className="text-sm text-muted-foreground">
                {new Date(createdKey.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/dashboard/api-keys/new`)}
          >
            Create Another
          </Button>
          <Button onClick={() => router.push(`/${locale}/dashboard/api-keys`)}>
            Go to API Keys
          </Button>
        </div>
      </div>
    );
  }

  // Otherwise, show the form
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/${locale}/dashboard/api-keys`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create API Key</h1>
          <p className="text-muted-foreground">
            Generate a new API key for programmatic access
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
                Provide a name and description for this API key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        placeholder="What will this API key be used for?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Public">Public (Anonymous)</SelectItem>
                          <SelectItem value="Basic">Basic (Free)</SelectItem>
                          <SelectItem value="Premium">Premium (Paid)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Tier determines rate limits and features
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
          {selectedTier === 'Premium' && (
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
              onClick={() => router.push(`/${locale}/dashboard/api-keys`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Creating...' : 'Create API Key'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
