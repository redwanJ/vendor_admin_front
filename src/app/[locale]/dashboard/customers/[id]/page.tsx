'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Building, User, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ServiceDetailSkeleton } from '@/components/shared/ServiceSkeletons';
import { useToast } from '@/hooks/use-toast';
import { useConfirmDialog } from '@/components/shared/ConfirmDialog';
import { customerService } from '@/services/customerService';
import { useTranslations } from 'next-intl';
import type { CustomerDto } from '@/types/customer';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Active: 'default',
  Inactive: 'secondary',
  Blocked: 'destructive',
  Archived: 'outline',
};

const customerTypeIcons: Record<string, any> = {
  Individual: User,
  Business: Building,
  EventPlanner: User,
};

export default function CustomerDetailPage({ params: paramsPromise }: { params: Promise<{ id: string; locale: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const { confirm, dialog } = useConfirmDialog();
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true);
      try {
        const data = await customerService.getCustomerById(params.id);
        setCustomer(data);
      } catch (error: any) {
        toast({
          title: tCommon('messages.error'),
          description: error.response?.data?.error || t('toasts.loadError'),
          variant: 'destructive',
        });
        router.push(`/${params.locale}/dashboard/customers`);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [params.id, params.locale, router, toast]);

  const handleEdit = () => {
    router.push(`/${params.locale}/dashboard/customers/${params.id}/edit`);
  };

  const handleDelete = async () => {
    await confirm({
      title: t('confirm.deleteTitle'),
      description: t('confirm.delete', { name: customer?.fullName || 'this customer' }),
      confirmText: tCommon('actions.delete'),
      cancelText: tCommon('actions.cancel'),
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await customerService.deleteCustomer(params.id);
          toast({
            title: tCommon('messages.success'),
            description: t('toasts.deleteSuccess'),
          });
          router.push(`/${params.locale}/dashboard/customers`);
        } catch (error: any) {
          toast({
            title: tCommon('messages.error'),
            description: error?.message || t('toasts.deleteError'),
            variant: 'destructive',
          });
          throw error;
        }
      },
    });
  };

  if (loading) {
    return <ServiceDetailSkeleton />;
  }

  if (!customer) {
    return null;
  }

  const Icon = customerTypeIcons[customer.customerType] || User;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${params.locale}/dashboard/customers`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-3xl font-bold tracking-tight">{customer.fullName}</h1>
              <Badge variant={statusColors[customer.status] || 'default'}>
                {t(`status.${customer.status}` as any)}
              </Badge>
              <Badge variant="outline">{t(`types.${customer.customerType}` as any)}</Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {customer.email}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            {tCommon('actions.edit')}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            {tCommon('actions.delete')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.contactInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {t('detail.email')}
                  </label>
                  <p className="text-base">{customer.email}</p>
                </div>

                {customer.phoneNumber && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {t('detail.phone')}
                    </label>
                    <p className="text-base">{customer.phoneNumber}</p>
                  </div>
                )}
              </div>

              {customer.alternatePhone && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {t('detail.alternatePhone')}
                  </label>
                  <p className="text-base">{customer.alternatePhone}</p>
                </div>
              )}

              {customer.preferredContactMethod && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('detail.preferredContactMethod')}
                  </label>
                  <p className="text-base">{customer.preferredContactMethod}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          {customer.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('detail.address')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic space-y-1">
                  <p>{customer.address.street}</p>
                  <p>{customer.address.city}, {customer.address.state} {customer.address.postalCode}</p>
                  <p>{customer.address.country}</p>
                </address>
              </CardContent>
            </Card>
          )}

          {/* Business Information */}
          {customer.customerType === 'Business' && (customer.companyName || customer.taxIdNumber) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t('detail.businessInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.companyName && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">{t('detail.companyName')}</label>
                    <p className="text-base">{customer.companyName}</p>
                  </div>
                )}
                {customer.taxIdNumber && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">{t('detail.taxIdNumber')}</label>
                    <p className="text-base">{customer.taxIdNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Media */}
          {(customer.facebookUrl || customer.instagramUrl || customer.linkedInUrl) && (
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.socialMedia')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.facebookUrl && (
                  <a
                    href={customer.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                )}
                {customer.instagramUrl && (
                  <a
                    href={customer.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-600 hover:underline"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                )}
                {customer.linkedInUrl && (
                  <a
                    href={customer.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-700 hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.notes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base whitespace-pre-wrap">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {customer.tags && customer.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.tags')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.metadata')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t('detail.created')}
                </label>
                <p className="text-sm">{new Date(customer.createdAt).toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {t('detail.updated')}
                </label>
                <p className="text-sm">{new Date(customer.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {dialog}
    </div>
  );
}
