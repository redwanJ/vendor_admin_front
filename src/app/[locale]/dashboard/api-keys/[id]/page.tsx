'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Ban, Trash2, Clock, Calendar, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { apiKeyService } from '@/services/apiKeyService';
import type { ApiKeyDto } from '@/types/apiKey';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Active: 'default',
  Revoked: 'destructive',
  Expired: 'secondary',
  Suspended: 'outline',
};

const tierColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Public: 'secondary',
  Basic: 'default',
  Premium: 'default',
};

export default function ApiKeyDetailPage({ params: paramsPromise }: { params: Promise<{ id: string; locale: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<ApiKeyDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    const loadApiKey = async () => {
      setLoading(true);
      try {
        const data = await apiKeyService.getApiKeyById(params.id);
        setApiKey(data);
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

    loadApiKey();
  }, [params.id, params.locale, router, toast]);

  const handleEdit = () => {
    router.push(`/${params.locale}/dashboard/api-keys/${params.id}/edit`);
  };

  const handleRevoke = async () => {
    if (!confirm(`Are you sure you want to revoke "${apiKey?.name}"? This action cannot be undone.`)) {
      return;
    }

    setRevoking(true);
    try {
      await apiKeyService.revokeApiKey(params.id);
      toast({
        title: 'Success',
        description: 'API key revoked successfully',
      });
      // Reload to show updated status
      const data = await apiKeyService.getApiKeyById(params.id);
      setApiKey(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to revoke API key',
        variant: 'destructive',
      });
    } finally {
      setRevoking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${apiKey?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiKeyService.deleteApiKey(params.id);
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
      router.push(`/${params.locale}/dashboard/api-keys`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!apiKey) {
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
            onClick={() => router.push(`/${params.locale}/dashboard/api-keys`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{apiKey.name}</h1>
              <Badge variant={statusColors[apiKey.status] || 'default'}>
                {apiKey.status}
              </Badge>
              <Badge variant={tierColors[apiKey.tier] || 'default'}>
                {apiKey.tier}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-1">
              {apiKey.keyPrefix}...
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {apiKey.status === 'Active' && (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleRevoke} disabled={revoking}>
                <Ban className="h-4 w-4 mr-2" />
                {revoking ? 'Revoking...' : 'Revoke'}
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKey.description && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base">{apiKey.description}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Environment</label>
                  <p className="text-base">{apiKey.environment}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Tier</label>
                  <div>
                    <Badge variant={tierColors[apiKey.tier] || 'default'}>
                      {apiKey.tier}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rate Limits
              </CardTitle>
              <CardDescription>
                Current rate limit configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Requests per Hour
                  </label>
                  <p className="text-2xl font-bold">{apiKey.rateLimitPerHour.toLocaleString()}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Requests per Day
                  </label>
                  <p className="text-2xl font-bold">{apiKey.rateLimitPerDay.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          {apiKey.scopes && apiKey.scopes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Permissions (Scopes)</CardTitle>
                <CardDescription>
                  What this API key can access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {apiKey.scopes.map((scope) => (
                    <Badge key={scope} variant="outline">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {(apiKey.allowedIps.length > 0 || apiKey.allowedOrigins.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  IP and origin restrictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKey.allowedIps.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Allowed IPs</label>
                    <div className="flex flex-wrap gap-2">
                      {apiKey.allowedIps.map((ip) => (
                        <Badge key={ip} variant="outline" className="font-mono">
                          {ip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {apiKey.allowedOrigins.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Allowed Origins</label>
                    <div className="flex flex-wrap gap-2">
                      {apiKey.allowedOrigins.map((origin) => (
                        <Badge key={origin} variant="outline" className="font-mono">
                          {origin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                <div>
                  <Badge variant={statusColors[apiKey.status] || 'default'}>
                    {apiKey.status}
                  </Badge>
                </div>
              </div>

              {apiKey.lastUsedAt && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last Used
                  </label>
                  <p className="text-sm">{new Date(apiKey.lastUsedAt).toLocaleString()}</p>
                </div>
              )}

              {apiKey.expiresAt && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Expires
                  </label>
                  <p className="text-sm">{new Date(apiKey.expiresAt).toLocaleDateString()}</p>
                </div>
              )}

              {apiKey.revokedAt && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Ban className="h-4 w-4" />
                    Revoked
                  </label>
                  <p className="text-sm">{new Date(apiKey.revokedAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{new Date(apiKey.createdAt).toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Key Prefix</label>
                <p className="text-sm font-mono">{apiKey.keyPrefix}...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
